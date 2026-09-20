"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useAccount,
  useConnect,
  useDisconnect,
  usePublicClient,
  useReadContract,
  useReadContracts,
  useSwitchChain,
} from "wagmi";
import { getWalletErrorMessage } from "./errors";
import { erc721TestAbi } from "./erc721TestAbi";
import { BLOCK_TITANS_TEST_COLLECTION, testWagmiConfig } from "./testConfig";
import { findOwnedTokenIdsFromTransferLogs } from "./transferLogScan";
import { withTimeout } from "./withTimeout";

const LOG = "[HolderPortalTest]";

/** Caps enumeration/verification calls if a wallet reports an implausibly large balance. */
const MAX_TOKENS = 50;
/** Above this, a totalSupply()-driven ownerOf sweep would itself be too many calls — fall back to log scanning. */
const MAX_BRUTE_FORCE_SUPPLY = 10_000;
/** Hard deadline for either token-ID discovery path, so a stalled RPC can never freeze the UI indefinitely. */
const DISCOVERY_TIMEOUT_MS = 20_000;

export type TokenIdResolutionMethod = "enumerable" | "total-supply-scan" | "transfer-logs" | "none";

export interface ResolvedTokenUri {
  tokenId: string;
  uri: string | undefined;
  uriError: boolean;
}

function shorten(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/** Pulls out the fields viem/wagmi errors actually carry (HTTP status, RPC message, cause chain) for diagnostics. */
function describeError(error: unknown): Record<string, unknown> {
  if (!(error instanceof Error)) return { error };
  const richError = error as Error & { shortMessage?: string; details?: string; status?: number; url?: string };
  return {
    name: richError.name,
    message: richError.message,
    shortMessage: richError.shortMessage,
    details: richError.details,
    status: richError.status,
    url: richError.url,
    cause: richError.cause instanceof Error ? richError.cause.message : richError.cause,
  };
}

/**
 * Wallet connection + ERC-721 ownership detection for the Holder Portal
 * test harness. Mirrors the shape of lib/web3/useWallet.ts, but talks only
 * to testWagmiConfig (Robinhood Chain) and the Block Titans test contract —
 * never the production Nasalis Flow config or contract.
 *
 * Token ID resolution, in order:
 *  1. ERC-721 Enumerable (`tokenOfOwnerByIndex`) — Block Titans doesn't
 *     implement this, so it falls through.
 *  2. `totalSupply()` + a batched `ownerOf(i)` sweep over the whole ID
 *     range (via multicall) — a read-only alternative that needs no log
 *     scanning at all, used when the collection is small enough to make
 *     that sweep cheap.
 *  3. Replaying on-chain Transfer events (see transferLogScan.ts), bounded
 *     to fixed-size block windows and stopped as soon as `balanceOf`'s
 *     worth of currently-owned tokens is confirmed, then re-checked with a
 *     direct `ownerOf` read — used only if `totalSupply` is unavailable or
 *     the collection is too large to brute-force.
 * Every path ends in a direct `ownerOf`/`totalSupply` contract read before
 * a token ID is trusted, so nothing displayed is ever inferred or guessed.
 */
export function useHolderPortalTest() {
  const { address, isConnected, chainId, status } = useAccount({ config: testWagmiConfig });
  const { connect, connectors, error, isPending, reset } = useConnect({ config: testWagmiConfig });
  const { disconnect } = useDisconnect({ config: testWagmiConfig });
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain({ config: testWagmiConfig });
  const publicClient = usePublicClient({ config: testWagmiConfig, chainId: BLOCK_TITANS_TEST_COLLECTION.chainId });

  const shortAddress = useMemo(() => (address ? shorten(address) : undefined), [address]);
  const errorMessage = useMemo(() => (error ? getWalletErrorMessage(error) : undefined), [error]);
  const isCorrectNetwork = chainId === BLOCK_TITANS_TEST_COLLECTION.chainId;

  const balanceQuery = useReadContract({
    config: testWagmiConfig,
    address: BLOCK_TITANS_TEST_COLLECTION.contractAddress,
    abi: erc721TestAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: BLOCK_TITANS_TEST_COLLECTION.chainId,
    query: { enabled: Boolean(address), retry: false },
  });

  useEffect(() => {
    if (balanceQuery.data !== undefined) {
      console.info(`${LOG} balance result`, { balance: balanceQuery.data.toString() });
    }
  }, [balanceQuery.data]);

  useEffect(() => {
    if (balanceQuery.error) {
      console.error(`${LOG} balanceOf() failed`, describeError(balanceQuery.error));
    }
  }, [balanceQuery.error]);

  const balance = balanceQuery.data ?? BigInt(0);
  const enumerateCount = balance > BigInt(MAX_TOKENS) ? MAX_TOKENS : Number(balance);

  // --- Attempt 1: ERC-721 Enumerable (tokenOfOwnerByIndex) ---
  const enumerableCalls = useMemo(() => {
    if (!address || enumerateCount === 0) return [];
    return Array.from({ length: enumerateCount }, (_, index) => ({
      address: BLOCK_TITANS_TEST_COLLECTION.contractAddress,
      abi: erc721TestAbi,
      functionName: "tokenOfOwnerByIndex" as const,
      args: [address, BigInt(index)] as const,
      chainId: BLOCK_TITANS_TEST_COLLECTION.chainId,
    }));
  }, [address, enumerateCount]);

  const enumerableQuery = useReadContracts({
    config: testWagmiConfig,
    contracts: enumerableCalls,
    query: { enabled: enumerableCalls.length > 0, retry: false },
  });

  const enumerableTokenIds = useMemo(() => {
    if (!enumerableQuery.data) return [];
    return enumerableQuery.data
      .filter((result) => result.status === "success")
      .map((result) => (result.result as bigint).toString());
  }, [enumerableQuery.data]);

  const enumerationUnavailable =
    balance > BigInt(0) &&
    enumerableCalls.length > 0 &&
    enumerableQuery.data !== undefined &&
    enumerableTokenIds.length === 0;

  useEffect(() => {
    if (enumerationUnavailable) {
      console.info(`${LOG} token ID discovery started — Enumerable unavailable, trying totalSupply() sweep next`);
    }
  }, [enumerationUnavailable]);

  useEffect(() => {
    if (enumerableQuery.error) {
      console.error(`${LOG} tokenOfOwnerByIndex() batch failed`, describeError(enumerableQuery.error));
    }
  }, [enumerableQuery.error]);

  // --- Attempt 2: totalSupply() + a batched ownerOf(i) sweep (no log scanning at all) ---
  const totalSupplyQuery = useReadContract({
    config: testWagmiConfig,
    address: BLOCK_TITANS_TEST_COLLECTION.contractAddress,
    abi: erc721TestAbi,
    functionName: "totalSupply",
    chainId: BLOCK_TITANS_TEST_COLLECTION.chainId,
    query: { enabled: enumerationUnavailable, retry: false },
  });

  useEffect(() => {
    if (totalSupplyQuery.error) {
      // Expected/normal if the contract simply doesn't implement totalSupply() — falls through to log scanning.
      console.warn(`${LOG} totalSupply() failed (falling back to Transfer-log scan)`, describeError(totalSupplyQuery.error));
    }
  }, [totalSupplyQuery.error]);

  const totalSupplyAvailable = totalSupplyQuery.isSuccess && totalSupplyQuery.data !== undefined;
  const totalSupplyTooLarge = totalSupplyAvailable && totalSupplyQuery.data! > BigInt(MAX_BRUTE_FORCE_SUPPLY);
  const shouldBruteForce = enumerationUnavailable && totalSupplyAvailable && !totalSupplyTooLarge;
  // totalSupply() unavailable (reverted) or too large — only then fall back to the log scan.
  const shouldLogScan =
    enumerationUnavailable && totalSupplyQuery.isFetched && (!totalSupplyAvailable || totalSupplyTooLarge);

  const bruteForceCalls = useMemo(() => {
    if (!shouldBruteForce || totalSupplyQuery.data === undefined) return [];
    // Inclusive of both ends so 0-indexed and 1-indexed collections are both covered.
    const count = Number(totalSupplyQuery.data) + 1;
    return Array.from({ length: count }, (_, tokenId) => ({
      address: BLOCK_TITANS_TEST_COLLECTION.contractAddress,
      abi: erc721TestAbi,
      functionName: "ownerOf" as const,
      args: [BigInt(tokenId)] as const,
      chainId: BLOCK_TITANS_TEST_COLLECTION.chainId,
    }));
  }, [shouldBruteForce, totalSupplyQuery.data]);

  useEffect(() => {
    if (bruteForceCalls.length > 0) {
      console.info(`${LOG} totalSupply() sweep started`, { tokenIdRangeSize: bruteForceCalls.length });
    }
  }, [bruteForceCalls.length]);

  const bruteForceQuery = useReadContracts({
    config: testWagmiConfig,
    contracts: bruteForceCalls,
    query: { enabled: bruteForceCalls.length > 0, retry: false },
  });

  const bruteForceTokenIds = useMemo(() => {
    if (!bruteForceQuery.data || !address) return [];
    const ownerLower = address.toLowerCase();
    return bruteForceQuery.data
      .map((result, tokenId) => ({ result, tokenId }))
      .filter(({ result }) => result.status === "success" && (result.result as string).toLowerCase() === ownerLower)
      .map(({ tokenId }) => tokenId.toString());
  }, [bruteForceQuery.data, address]);

  useEffect(() => {
    if (bruteForceQuery.data) {
      console.info(`${LOG} ownerOf verification result (totalSupply sweep)`, { tokenIds: bruteForceTokenIds });
    }
  }, [bruteForceQuery.data, bruteForceTokenIds]);

  useEffect(() => {
    if (bruteForceQuery.error) {
      console.error(`${LOG} totalSupply-driven ownerOf sweep (multicall) failed`, {
        ...describeError(bruteForceQuery.error),
        callCount: bruteForceCalls.length,
      });
    }
  }, [bruteForceQuery.error, bruteForceCalls.length]);

  // --- Attempt 3: bounded Transfer-log replay, then re-confirm each candidate with ownerOf ---
  const logScanQuery = useQuery({
    queryKey: ["block-titans-test-log-scan", address, balance.toString()],
    queryFn: async () => {
      if (!address || !publicClient) throw new Error("Wallet or RPC client not ready");
      console.info(`${LOG} token ID discovery started — bounded Transfer-log scan`, {
        targetCount: Number(balance),
      });
      const result = await withTimeout(
        findOwnedTokenIdsFromTransferLogs(publicClient, {
          contractAddress: BLOCK_TITANS_TEST_COLLECTION.contractAddress,
          ownerAddress: address,
          targetCount: Number(balance),
          onProgress: (progress) =>
            console.info(`${LOG} block range scanned`, {
              chunk: progress.chunkIndex,
              fromBlock: progress.fromBlock.toString(),
              toBlock: progress.toBlock.toString(),
              transferLogsFound: progress.logsFound,
            }),
        }),
        DISCOVERY_TIMEOUT_MS,
        "Transfer-log scan timed out before resolving ownership",
      );
      console.info(`${LOG} token IDs discovered (unverified) via Transfer logs`, {
        tokenIds: result.tokenIds.map(String),
        isPartial: result.isPartial,
        chunksScanned: result.chunksScanned,
        blocksScanned: result.blocksScanned.toString(),
      });
      return result;
    },
    enabled: shouldLogScan && Boolean(address) && Boolean(publicClient),
    staleTime: 60_000,
    retry: false,
  });

  useEffect(() => {
    if (logScanQuery.error) {
      console.error(`${LOG} Transfer-log scan failed`, describeError(logScanQuery.error));
    }
  }, [logScanQuery.error]);

  const verifyCalls = useMemo(() => {
    const candidates = logScanQuery.data?.tokenIds.slice(0, MAX_TOKENS) ?? [];
    return candidates.map((tokenId) => ({
      address: BLOCK_TITANS_TEST_COLLECTION.contractAddress,
      abi: erc721TestAbi,
      functionName: "ownerOf" as const,
      args: [tokenId] as const,
      chainId: BLOCK_TITANS_TEST_COLLECTION.chainId,
    }));
  }, [logScanQuery.data]);

  const verifyQuery = useReadContracts({
    config: testWagmiConfig,
    contracts: verifyCalls,
    query: { enabled: verifyCalls.length > 0, retry: false },
  });

  const verifiedLogScanTokenIds = useMemo(() => {
    if (!verifyQuery.data || !address) return [];
    const candidates = logScanQuery.data?.tokenIds.slice(0, MAX_TOKENS) ?? [];
    const ownerLower = address.toLowerCase();
    return candidates
      .filter((_, index) => {
        const result = verifyQuery.data?.[index];
        return result?.status === "success" && (result.result as string).toLowerCase() === ownerLower;
      })
      .map((tokenId) => tokenId.toString());
  }, [verifyQuery.data, logScanQuery.data, address]);

  useEffect(() => {
    if (verifyQuery.data) {
      console.info(`${LOG} ownerOf verification result (Transfer-log candidates)`, {
        tokenIds: verifiedLogScanTokenIds,
      });
    }
  }, [verifyQuery.data, verifiedLogScanTokenIds]);

  useEffect(() => {
    if (verifyQuery.error) {
      console.error(`${LOG} ownerOf verification batch failed`, describeError(verifyQuery.error));
    }
  }, [verifyQuery.error]);

  const resolutionMethod: TokenIdResolutionMethod = !enumerationUnavailable
    ? enumerableTokenIds.length > 0
      ? "enumerable"
      : "none"
    : bruteForceCalls.length > 0
      ? "total-supply-scan"
      : verifyCalls.length > 0
        ? "transfer-logs"
        : "none";

  const resolvedTokenIds = useMemo(() => {
    if (resolutionMethod === "enumerable") return enumerableTokenIds;
    if (resolutionMethod === "total-supply-scan") return bruteForceTokenIds;
    if (resolutionMethod === "transfer-logs") return verifiedLogScanTokenIds;
    return [];
  }, [resolutionMethod, enumerableTokenIds, bruteForceTokenIds, verifiedLogScanTokenIds]);

  // A verified count lower than balanceOf means some tokens couldn't be confirmed
  // (e.g. the log scan was capped) — never fabricated, just not shown.
  const resolutionIncomplete = resolutionMethod === "transfer-logs" && BigInt(resolvedTokenIds.length) < balance;

  useEffect(() => {
    if (resolvedTokenIds.length > 0) {
      console.info(`${LOG} token IDs discovered`, { method: resolutionMethod, tokenIds: resolvedTokenIds });
    }
  }, [resolvedTokenIds, resolutionMethod]);

  // --- Batch-fetch tokenURI for every resolved token ID ---
  const tokenUriCalls = useMemo(() => {
    if (resolvedTokenIds.length === 0) return [];
    return resolvedTokenIds.map((tokenId) => ({
      address: BLOCK_TITANS_TEST_COLLECTION.contractAddress,
      abi: erc721TestAbi,
      functionName: "tokenURI" as const,
      args: [BigInt(tokenId)] as const,
      chainId: BLOCK_TITANS_TEST_COLLECTION.chainId,
    }));
  }, [resolvedTokenIds]);

  useEffect(() => {
    if (tokenUriCalls.length > 0) {
      console.info(`${LOG} metadata fetch started`, { tokenCount: tokenUriCalls.length });
    }
  }, [tokenUriCalls.length]);

  const tokenUriQuery = useReadContracts({
    config: testWagmiConfig,
    contracts: tokenUriCalls,
    query: { enabled: tokenUriCalls.length > 0, retry: false },
  });

  useEffect(() => {
    if (tokenUriQuery.error) {
      console.error(`${LOG} tokenURI() batch failed`, describeError(tokenUriQuery.error));
    }
  }, [tokenUriQuery.error]);

  const tokenUris = useMemo<ResolvedTokenUri[]>(() => {
    return resolvedTokenIds.map((tokenId, index) => {
      const result = tokenUriQuery.data?.[index];
      return {
        tokenId,
        uri: result?.status === "success" ? (result.result as string) : undefined,
        uriError: result?.status === "failure",
      };
    });
  }, [resolvedTokenIds, tokenUriQuery.data]);

  const isCheckingOwnership =
    balanceQuery.isLoading ||
    enumerableQuery.isLoading ||
    totalSupplyQuery.isLoading ||
    bruteForceQuery.isLoading ||
    logScanQuery.isLoading ||
    verifyQuery.isLoading ||
    tokenUriQuery.isLoading;

  const connectWallet = () => {
    const connector = connectors[0];
    if (!connector) return;
    reset();
    connect({ connector });
  };

  const switchToTestChain = () => switchChain({ chainId: BLOCK_TITANS_TEST_COLLECTION.chainId });

  const ownershipError =
    balanceQuery.error ??
    enumerableQuery.error ??
    verifyQuery.error ??
    (shouldLogScan ? logScanQuery.error : null) ??
    undefined;

  useEffect(() => {
    if (!ownershipError) return;
    const source = balanceQuery.error
      ? "balanceOf()"
      : enumerableQuery.error
        ? "tokenOfOwnerByIndex() batch"
        : verifyQuery.error
          ? "ownerOf() verification batch"
          : "Transfer-log scan";
    console.error(`${LOG} ownershipError surfaced in UI — source: ${source}`, describeError(ownershipError));
  }, [ownershipError, balanceQuery.error, enumerableQuery.error, verifyQuery.error]);

  return {
    address,
    shortAddress,
    isConnected,
    isConnecting: isPending || status === "connecting" || status === "reconnecting",
    connect: connectWallet,
    disconnect,
    errorMessage,
    chainId,
    isCorrectNetwork,
    isSwitchingChain,
    switchToTestChain,
    isCheckingOwnership,
    ownsAny: balance > BigInt(0),
    balance: balance.toString(),
    tokenIds: resolvedTokenIds,
    tokenUris,
    resolutionMethod,
    resolutionTruncated: balance > BigInt(MAX_TOKENS),
    resolutionIncomplete,
    resolutionPartialScan: logScanQuery.data?.isPartial ?? false,
    ownershipError,
  };
}

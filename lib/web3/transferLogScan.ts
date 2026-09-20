import type { Address, PublicClient } from "viem";
import { erc721TransferEvent } from "./erc721TestAbi";

/** Blocks per `eth_getLogs` call — bounded so a single call can never be asked to cover the whole chain history. */
const DEFAULT_CHUNK_SIZE = BigInt(10_000);
/** Hard ceiling on chunks scanned (default: 50 * 10,000 = 500,000 blocks backward from latest). */
const DEFAULT_MAX_CHUNKS = 50;
/** If a chunk itself is rejected by the RPC (range still too wide), retry once at this size before giving up on it. */
const MIN_CHUNK_SIZE = BigInt(500);

export interface ChunkProgress {
  chunkIndex: number;
  fromBlock: bigint;
  toBlock: bigint;
  logsFound: number;
}

function fetchTransferLogs(
  client: PublicClient,
  contractAddress: Address,
  args: { from?: Address; to?: Address },
  fromBlock: bigint,
  toBlock: bigint,
) {
  return client.getLogs({ address: contractAddress, event: erc721TransferEvent, args, fromBlock, toBlock });
}

export interface OwnedTokenScanResult {
  /** Token IDs currently owned by `ownerAddress`, per the most recent Transfer event seen. */
  tokenIds: bigint[];
  /** True if the scan stopped due to the chunk cap or a rejected chunk, before covering full history. */
  isPartial: boolean;
  chunksScanned: number;
  blocksScanned: bigint;
}

/**
 * Reconstructs an address's current ERC-721 holdings for a contract that
 * doesn't implement the Enumerable extension, by replaying Transfer events
 * that named it as sender or recipient. Every conforming ERC-721 contract
 * must emit Transfer on mint/transfer/burn, so this needs no third-party
 * indexer or API key — only the RPC transport already configured for the
 * chain.
 *
 * Scans backward from the latest block in fixed-size windows (never the
 * full history in one call, unlike a naive single-shot query) and stops as
 * soon as `targetCount` currently-owned tokens have been confirmed — since
 * backward traversal visits each token's most recent Transfer before any
 * earlier one, the first sighting of a token IS its current state, so
 * scanning can stop the moment enough tokens are accounted for instead of
 * continuing through the rest of history.
 *
 * Callers should still verify the returned token IDs with a direct
 * `ownerOf` read before treating them as final, since a partial scan (see
 * `isPartial`) can miss transfers outside the covered block range.
 */
export async function findOwnedTokenIdsFromTransferLogs(
  client: PublicClient,
  params: {
    contractAddress: Address;
    ownerAddress: Address;
    /** Stop scanning once this many currently-owned tokens are confirmed (e.g. the known balanceOf count). */
    targetCount?: number;
    chunkSize?: bigint;
    maxChunks?: number;
    onProgress?: (progress: ChunkProgress) => void;
  },
): Promise<OwnedTokenScanResult> {
  const maxChunks = params.maxChunks ?? DEFAULT_MAX_CHUNKS;
  const ownerLower = params.ownerAddress.toLowerCase();

  const latest = await client.getBlockNumber();
  // tokenId -> owner as of the first (i.e. most recent) sighting during backward traversal.
  const resolvedOwnerByToken = new Map<string, Address>();

  let toBlock = latest;
  let chunkSize = params.chunkSize ?? DEFAULT_CHUNK_SIZE;
  let chunksScanned = 0;
  let blocksScanned = BigInt(0);
  let isPartial = false;

  const ownedCount = () =>
    Array.from(resolvedOwnerByToken.values()).filter((owner) => owner.toLowerCase() === ownerLower).length;

  while (chunksScanned < maxChunks && toBlock >= BigInt(0)) {
    const windowStart = toBlock > chunkSize ? toBlock - chunkSize + BigInt(1) : BigInt(0);

    let incoming: Awaited<ReturnType<typeof fetchTransferLogs>>;
    let outgoing: Awaited<ReturnType<typeof fetchTransferLogs>>;
    try {
      [incoming, outgoing] = await Promise.all([
        fetchTransferLogs(client, params.contractAddress, { to: params.ownerAddress }, windowStart, toBlock),
        fetchTransferLogs(client, params.contractAddress, { from: params.ownerAddress }, windowStart, toBlock),
      ]);
    } catch {
      if (chunkSize > MIN_CHUNK_SIZE) {
        // This window was rejected (still too wide for the provider) — shrink and retry the same toBlock.
        chunkSize = chunkSize / BigInt(2) > MIN_CHUNK_SIZE ? chunkSize / BigInt(2) : MIN_CHUNK_SIZE;
        continue;
      }
      // Already at the smallest chunk size and still rejected — give up on this window, note it as partial.
      isPartial = true;
      chunksScanned += 1;
      blocksScanned += toBlock - windowStart + BigInt(1);
      params.onProgress?.({ chunkIndex: chunksScanned, fromBlock: windowStart, toBlock, logsFound: 0 });
      if (windowStart === BigInt(0)) break;
      toBlock = windowStart - BigInt(1);
      continue;
    }

    chunksScanned += 1;
    blocksScanned += toBlock - windowStart + BigInt(1);
    const merged = [...incoming, ...outgoing];
    params.onProgress?.({ chunkIndex: chunksScanned, fromBlock: windowStart, toBlock, logsFound: merged.length });

    // Resolve the latest (blockNumber, logIndex) event per token WITHIN this chunk...
    const latestInChunk = new Map<string, { blockNumber: bigint; logIndex: number; to: Address }>();
    for (const log of merged) {
      const tokenId = log.args.tokenId;
      const to = log.args.to;
      if (tokenId === undefined || to === undefined) continue;
      const key = tokenId.toString();
      const logIndex = log.logIndex ?? 0;
      const blockNumber = log.blockNumber ?? BigInt(0);
      const existing = latestInChunk.get(key);
      if (!existing || blockNumber > existing.blockNumber || (blockNumber === existing.blockNumber && logIndex > existing.logIndex)) {
        latestInChunk.set(key, { blockNumber, logIndex, to });
      }
    }

    // ...then only record a token the FIRST time it's seen, since every earlier (more recent, because we scan
    // backward) chunk has already had the chance to resolve it — an older sighting is never more current.
    for (const [tokenId, event] of latestInChunk) {
      if (!resolvedOwnerByToken.has(tokenId)) {
        resolvedOwnerByToken.set(tokenId, event.to);
      }
    }

    if (params.targetCount !== undefined && ownedCount() >= params.targetCount) break;
    if (windowStart === BigInt(0)) break;
    toBlock = windowStart - BigInt(1);
  }

  if (chunksScanned >= maxChunks && toBlock >= BigInt(0)) isPartial = true;

  const tokenIds = Array.from(resolvedOwnerByToken.entries())
    .filter(([, owner]) => owner.toLowerCase() === ownerLower)
    .map(([tokenId]) => BigInt(tokenId));

  return { tokenIds, isPartial, chunksScanned, blocksScanned };
}

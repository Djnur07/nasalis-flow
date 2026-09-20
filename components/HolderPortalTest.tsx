"use client";

import { useEffect, useMemo, useState } from "react";
import { useHolderPortalTest } from "@/lib/web3/useHolderPortalTest";
import { useBlockTitansMetadata, type NftMetadata } from "@/lib/web3/useBlockTitansMetadata";
import { resolveMetadataUriCandidates } from "@/lib/web3/resolveMetadataUri";
import { detectMediaKind, type MediaKind } from "@/lib/web3/detectMediaKind";
import { BLOCK_TITANS_TEST_COLLECTION, isRobinhoodTestRpcConfigured } from "@/lib/web3/testConfig";

// Keyed by `src` at each call site (see BlockTitansCard) so a new media URL
// remounts this component with fresh state, instead of needing an effect to
// resync candidateIndex/exhausted when `src` changes.
function NftMedia({ src, alt }: { src?: string; alt: string }) {
  const candidates = useMemo(() => (src ? resolveMetadataUriCandidates(src) : []), [src]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [exhausted, setExhausted] = useState(false);
  // Detection result tagged with the src it applies to, so a stale result
  // from a since-changed candidate is never rendered as current — this
  // lets `mediaKind` below stay undefined (i.e. "loading") without the
  // effect itself calling setState synchronously to reset it.
  const [detected, setDetected] = useState<{ src: string; kind: MediaKind } | undefined>(undefined);

  const currentSrc = candidates[candidateIndex];
  const mediaKind = detected && detected.src === currentSrc ? detected.kind : undefined;

  // metadata.image commonly points at an IPFS CID with no file extension
  // (Block Titans' is actually an MP4), so the media type isn't known
  // until it's probed — see detectMediaKind.
  useEffect(() => {
    if (!currentSrc) return;
    let cancelled = false;
    const controller = new AbortController();
    detectMediaKind(currentSrc, controller.signal).then((kind) => {
      if (!cancelled) setDetected({ src: currentSrc, kind });
    });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [currentSrc]);

  const tryNextCandidate = () => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex((index) => index + 1);
    } else {
      setExhausted(true);
    }
  };

  if (!src || exhausted || candidates.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center border-b border-ink/10 bg-ink/5 text-xs text-ink/40">
        Media unavailable
      </div>
    );
  }

  if (!mediaKind) {
    return (
      <div className="flex aspect-square w-full items-center justify-center border-b border-ink/10 bg-ink/5 text-xs text-ink/40">
        Loading media…
      </div>
    );
  }

  if (mediaKind === "video") {
    return (
      <video
        key={currentSrc}
        src={currentSrc}
        autoPlay
        loop
        muted
        playsInline
        controls
        aria-label={alt}
        className="aspect-square w-full border-b border-ink/10 object-cover"
        onError={tryNextCandidate}
      />
    );
  }

  return (
    // Remote NFT image hosts vary per token and aren't known ahead of time,
    // so next/image's static domain allowlist doesn't fit here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      className="aspect-square w-full border-b border-ink/10 object-cover"
      onError={tryNextCandidate}
    />
  );
}

function TraitList({ attributes }: { attributes: NftMetadata["attributes"] }) {
  if (!attributes || attributes.length === 0) return null;
  return (
    <div className="mt-3 border-t border-ink/10 pt-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-ink/45">Traits</p>
      <ul className="mt-2 space-y-1">
        {attributes.map((attribute, index) => (
          <li key={`${attribute.trait_type ?? "trait"}-${index}`} className="flex justify-between gap-3 text-xs">
            <span className="text-ink/55">{attribute.trait_type ?? "Trait"}</span>
            <span className="text-right text-ink">{String(attribute.value ?? "—")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BlockTitansCard({
  tokenId,
  metadata,
  isLoading,
  error,
}: {
  tokenId: string;
  metadata: NftMetadata | undefined;
  isLoading: boolean;
  error: unknown;
}) {
  const displayName = metadata?.name ?? `${BLOCK_TITANS_TEST_COLLECTION.name} #${tokenId}`;

  return (
    <div className="border border-ink/15 bg-cream">
      {isLoading ? (
        <div className="flex aspect-square w-full items-center justify-center border-b border-ink/10 bg-ink/5 text-xs text-ink/40">
          Loading image…
        </div>
      ) : (
        <NftMedia key={metadata?.image ?? "none"} src={metadata?.image} alt={displayName} />
      )}

      <div className="p-4">
        <h3 className="font-serif text-lg text-ink">{isLoading ? "Loading…" : displayName}</h3>
        <p className="mt-1 font-mono text-xs text-ink/55">Token ID: {tokenId}</p>

        {isLoading ? (
          <p className="mt-3 text-xs text-ink/50">Fetching metadata…</p>
        ) : error ? (
          <p role="alert" className="mt-3 text-xs text-ink/60">
            Metadata could not be retrieved for this token. The image and traits above may be unavailable.
          </p>
        ) : (
          <>
            {metadata?.description && <p className="mt-2 text-sm leading-relaxed text-ink/70">{metadata.description}</p>}
            <TraitList attributes={metadata?.attributes} />
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Standalone test harness for the Holder Portal pattern, wired to the
 * Block Titans collection on Robinhood Chain instead of the (unreleased)
 * Nasalis Flow contract. Exists only to validate ownership-detection and
 * metadata-rendering logic before it is pointed at the real collection —
 * see app/holder-portal-test.
 */
export function HolderPortalTest() {
  const {
    isConnected,
    isConnecting,
    address,
    shortAddress,
    chainId,
    isCorrectNetwork,
    isSwitchingChain,
    switchToTestChain,
    connect,
    disconnect,
    errorMessage,
    isCheckingOwnership,
    ownsAny,
    balance,
    tokenUris,
    resolutionMethod,
    resolutionTruncated,
    resolutionIncomplete,
    resolutionPartialScan,
    ownershipError,
  } = useHolderPortalTest();

  const metadataResults = useBlockTitansMetadata(tokenUris);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 inline-flex items-center gap-2 border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-brown">
        Test Environment — Not Connected to Production Nasalis Flow
      </div>

      {!isRobinhoodTestRpcConfigured && (
        <div role="alert" className="mb-6 border border-red-500/40 bg-red-500/10 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-red-700">
            Development configuration error
          </p>
          <p className="mt-1 text-xs leading-relaxed text-red-700/90">
            <code>NEXT_PUBLIC_ROBINHOOD_RPC_URL</code> is not set, so this test is falling back to Robinhood
            Chain&apos;s public RPC — which is rate-limited and known to be unreliable (Robinhood&apos;s own docs
            recommend Alchemy instead). Set <code>NEXT_PUBLIC_ROBINHOOD_RPC_URL</code> in <code>.env.local</code>{" "}
            to a dedicated RPC endpoint, then restart the dev server.
          </p>
        </div>
      )}

      <p className="text-xs uppercase tracking-[0.3em] text-brown">Holder Portal Test</p>
      <h1 className="mt-3 font-serif text-4xl text-ink sm:text-5xl">Block Titans</h1>
      <p className="mt-4 max-w-2xl text-ink/70">
        Verifies the Holder Portal&apos;s NFT-ownership detection and metadata rendering against the{" "}
        {BLOCK_TITANS_TEST_COLLECTION.name} test collection on {BLOCK_TITANS_TEST_COLLECTION.chainName} (chain ID{" "}
        {BLOCK_TITANS_TEST_COLLECTION.chainId}), contract{" "}
        <span className="font-mono text-sm">{BLOCK_TITANS_TEST_COLLECTION.contractAddress}</span>.
      </p>

      <div className="mt-10 border border-ink/15 bg-cream-dim px-8 py-10">
        {!isConnected ? (
          <div className="flex flex-col items-start gap-4">
            <p className="text-sm leading-relaxed text-ink/75">
              Connect a wallet to check whether it holds any Block Titans NFTs.
            </p>
            <button
              type="button"
              onClick={connect}
              disabled={isConnecting}
              aria-busy={isConnecting}
              className="inline-flex items-center justify-center px-7 py-3 text-xs font-medium uppercase tracking-[0.25em] text-cream bg-ink transition-colors hover:bg-brown disabled:opacity-60"
            >
              {isConnecting ? "Connecting…" : "Connect Wallet"}
            </button>
            {errorMessage && (
              <p role="alert" className="text-xs text-ink/70">
                {errorMessage}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-6">
            <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-sm text-ink" title={address}>
                  {shortAddress}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-ink/55">
                  {isCorrectNetwork
                    ? BLOCK_TITANS_TEST_COLLECTION.chainName
                    : `Connected wallet network: chain ${chainId ?? "unknown"}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => disconnect()}
                className="text-xs uppercase tracking-[0.15em] text-ink/60 underline-offset-4 hover:text-ink hover:underline"
              >
                Disconnect Wallet
              </button>
            </div>

            {!isCorrectNetwork && (
              <div className="flex w-full flex-col items-start gap-2 border border-brown/25 bg-brown/5 px-4 py-3">
                <p className="text-xs text-ink/70">
                  Your wallet is not set to {BLOCK_TITANS_TEST_COLLECTION.chainName}. Ownership is still checked
                  directly on-chain, but you can switch networks to match it.
                </p>
                <button
                  type="button"
                  onClick={switchToTestChain}
                  disabled={isSwitchingChain}
                  className="text-xs uppercase tracking-[0.15em] text-brown underline-offset-4 hover:underline disabled:opacity-60"
                >
                  {isSwitchingChain ? "Switching…" : `Switch to ${BLOCK_TITANS_TEST_COLLECTION.chainName}`}
                </button>
              </div>
            )}

            <div className="w-full border-t border-ink/10 pt-6">
              {isCheckingOwnership ? (
                <p className="text-sm text-ink/70">Checking Block Titans ownership…</p>
              ) : ownershipError ? (
                <p role="alert" className="text-sm text-ink/70">
                  Could not read the Block Titans contract on {BLOCK_TITANS_TEST_COLLECTION.chainName}. Try again in
                  a moment.
                </p>
              ) : ownsAny ? (
                <div className="flex flex-col gap-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-turquoise">Your Block Titans</p>
                    <p className="mt-2 text-sm leading-relaxed text-ink/85">
                      This wallet holds <strong>{balance}</strong> {BLOCK_TITANS_TEST_COLLECTION.name} NFT
                      {balance === "1" ? "" : "s"}.
                    </p>
                    {resolutionMethod === "total-supply-scan" && (
                      <p className="mt-1 text-xs text-ink/50">
                        Token IDs resolved via a direct <code>totalSupply()</code> + <code>ownerOf()</code> sweep of
                        the collection (this contract doesn&apos;t implement ERC-721 Enumerable) — no log scanning
                        was needed.
                      </p>
                    )}
                    {resolutionMethod === "transfer-logs" && (
                      <p className="mt-1 text-xs text-ink/50">
                        Token IDs resolved from on-chain Transfer event history (totalSupply() was unavailable or
                        too large to sweep directly), each re-confirmed with a direct <code>ownerOf</code> read.
                        {resolutionPartialScan && " The event scan was capped before covering full chain history —"}
                        {resolutionIncomplete &&
                          " Some held tokens may not be listed below if they fall outside what could be scanned."}
                      </p>
                    )}
                    {resolutionTruncated && (
                      <p className="mt-1 text-xs text-ink/50">Showing at most the first 50 detected tokens.</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {metadataResults.map(({ tokenId, metadata, isLoading, error }) => (
                      <BlockTitansCard
                        key={tokenId}
                        tokenId={tokenId}
                        metadata={metadata}
                        isLoading={isLoading}
                        error={error}
                      />
                    ))}
                  </div>

                  {metadataResults.length === 0 && (
                    <p className="text-xs text-ink/60">
                      Token IDs could not be resolved for this wallet, so no artwork can be displayed — only the
                      total balance above.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-ink/85">No Block Titans NFT found in this wallet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

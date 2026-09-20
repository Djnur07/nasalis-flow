/**
 * Public IPFS gateways tried in order when resolving `ipfs://` metadata or
 * image URIs. No API key or account is required for any of these — they're
 * free, publicly-run gateways onto the IPFS network.
 *
 * Pinata is listed first: it's the pinning service backing the Block
 * Titans collection, so it's the only gateway verified to reliably serve
 * this collection's CIDs. The others are kept as fallbacks, but as of this
 * writing ipfs.io rate-limits (HTTP 429), cloudflare-ipfs.com no longer
 * resolves at all (DNS failure), and nftstorage.link 302-redirects to
 * ipfs.io, inheriting its rate limit.
 */
const IPFS_GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://nftstorage.link/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
];

function stripIpfsPrefix(value: string): string {
  return value.replace(/^ipfs:\/\//i, "").replace(/^ipfs\//i, "");
}

/**
 * Every gateway URL worth trying for a given tokenURI/image URI, in
 * fallback order. Handles `ipfs://`, an `https://.../ipfs/<cid>` URL
 * (rewritten to the other gateways too), a bare CID/path, `ar://`
 * (Arweave), `data:` URIs (returned as-is, no network needed), and plain
 * `http(s)://` URLs that aren't IPFS at all (also returned as-is).
 */
export function resolveMetadataUriCandidates(uri: string): string[] {
  const trimmed = uri.trim();
  if (trimmed.length === 0) return [];

  if (trimmed.startsWith("data:")) return [trimmed];

  if (trimmed.startsWith("ar://")) {
    return [`https://arweave.net/${trimmed.slice("ar://".length)}`];
  }

  if (/^ipfs:\/\//i.test(trimmed)) {
    const path = stripIpfsPrefix(trimmed);
    return IPFS_GATEWAYS.map((gateway) => `${gateway}${path}`);
  }

  const gatewayMatch = trimmed.match(/\/ipfs\/(.+)$/i);
  if (gatewayMatch) {
    return IPFS_GATEWAYS.map((gateway) => `${gateway}${gatewayMatch[1]}`);
  }

  if (/^https?:\/\//i.test(trimmed)) return [trimmed];

  // No recognized scheme — most likely a bare IPFS CID/path.
  return IPFS_GATEWAYS.map((gateway) => `${gateway}${stripIpfsPrefix(trimmed)}`);
}

/** First resolved candidate — good enough for a plain <img src>, which handles its own load failures separately. */
export function resolveMetadataUri(uri: string): string {
  return resolveMetadataUriCandidates(uri)[0] ?? uri;
}

/** Fetches and JSON-parses a tokenURI/metadata URI, trying every gateway fallback before giving up. */
export async function fetchJsonWithGatewayFallback(uri: string): Promise<unknown> {
  const candidates = resolveMetadataUriCandidates(uri);
  if (candidates.length === 0) throw new Error("Empty metadata URI");

  let lastError: unknown;
  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Failed to fetch metadata");
}

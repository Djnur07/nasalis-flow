"use client";

import { useQueries } from "@tanstack/react-query";
import { fetchJsonWithGatewayFallback } from "./resolveMetadataUri";
import type { ResolvedTokenUri } from "./useHolderPortalTest";

export interface NftAttribute {
  trait_type?: string;
  value?: string | number | boolean;
}

export interface NftMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: NftAttribute[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Best-effort normalization — anything that isn't shaped like NFT metadata is treated as malformed. */
function toNftMetadata(value: unknown): NftMetadata {
  if (!isPlainObject(value)) throw new Error("Malformed metadata: expected a JSON object");

  const attributesRaw = value.attributes;
  const attributes = Array.isArray(attributesRaw)
    ? attributesRaw
        .filter(isPlainObject)
        .map((entry) => ({
          trait_type: typeof entry.trait_type === "string" ? entry.trait_type : undefined,
          value:
            typeof entry.value === "string" || typeof entry.value === "number" || typeof entry.value === "boolean"
              ? entry.value
              : undefined,
        }))
    : undefined;

  return {
    name: typeof value.name === "string" ? value.name : undefined,
    description: typeof value.description === "string" ? value.description : undefined,
    image: typeof value.image === "string" ? value.image : undefined,
    attributes,
  };
}

/**
 * Fetches and normalizes off-chain NFT metadata for a batch of resolved
 * tokenURIs, one independent query per token so a single unavailable or
 * malformed metadata document doesn't block the others.
 */
export function useBlockTitansMetadata(tokenUris: ResolvedTokenUri[]) {
  const results = useQueries({
    queries: tokenUris.map(({ tokenId, uri, uriError }) => ({
      queryKey: ["block-titans-test-metadata", tokenId, uri],
      queryFn: async () => toNftMetadata(await fetchJsonWithGatewayFallback(uri as string)),
      enabled: Boolean(uri) && !uriError,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    })),
  });

  return tokenUris.map(({ tokenId, uri, uriError }, index) => {
    const result = results[index];
    return {
      tokenId,
      metadata: result?.data,
      isLoading: Boolean(uri) && !uriError && (result?.isLoading ?? false),
      error: uriError ? new Error("tokenURI could not be read from the contract") : result?.error ?? undefined,
    };
  });
}

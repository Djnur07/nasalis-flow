const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i;
const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|svg|avif|bmp)(\?.*)?$/i;

export type MediaKind = "image" | "video";

/**
 * Best-effort media type detection for a resolved NFT media URL. NFT
 * metadata commonly points at IPFS CIDs with no file extension (Block
 * Titans' "image" field, for example, actually resolves to an MP4), so
 * extension sniffing alone isn't reliable — this falls back to a HEAD
 * request's Content-Type header, and finally to "image" as the safest
 * default for callers that fall back from <img> to <video> on error.
 */
export async function detectMediaKind(url: string, signal?: AbortSignal): Promise<MediaKind> {
  if (VIDEO_EXTENSIONS.test(url)) return "video";
  if (IMAGE_EXTENSIONS.test(url)) return "image";

  if (url.startsWith("data:")) {
    return url.startsWith("data:video/") ? "video" : "image";
  }

  try {
    const response = await fetch(url, { method: "HEAD", signal });
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.startsWith("video/")) return "video";
    if (contentType.startsWith("image/")) return "image";
  } catch {
    // HEAD unsupported/blocked by this gateway (CORS, 405, network) — fall through to the default below.
  }

  return "image";
}

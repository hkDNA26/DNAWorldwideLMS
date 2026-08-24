export interface ParsedVimeo {
  videoId: string;
  videoHash: string | null;
}

/**
 * Parse a Vimeo URL into its numeric id and (for unlisted videos) privacy hash.
 * Accepts forms like:
 *   https://vimeo.com/1072417114
 *   https://vimeo.com/1072417114/3c676fddf7?fl=tl&fe=ec
 *   https://player.vimeo.com/video/1072417114?h=3c676fddf7
 */
export function parseVimeoUrl(input: string): ParsedVimeo | null {
  const trimmed = input.trim();
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (!/(^|\.)vimeo\.com$/.test(url.hostname)) return null;

  const segments = url.pathname.split("/").filter(Boolean);
  // player.vimeo.com/video/{id}?h={hash}
  if (segments[0] === "video" && /^\d+$/.test(segments[1] ?? "")) {
    return { videoId: segments[1], videoHash: url.searchParams.get("h") };
  }
  // vimeo.com/{id}[/{hash}]
  const idSeg = segments.find((s) => /^\d+$/.test(s));
  if (!idSeg) return null;
  const idx = segments.indexOf(idSeg);
  const hash = segments[idx + 1] && /^[a-z0-9]+$/i.test(segments[idx + 1]) ? segments[idx + 1] : url.searchParams.get("h");
  return { videoId: idSeg, videoHash: hash ?? null };
}

/** Player embed URL (includes the unlisted hash when present). */
export function vimeoEmbedUrl(videoId: string, videoHash: string | null): string {
  const base = `https://player.vimeo.com/video/${videoId}`;
  return videoHash ? `${base}?h=${videoHash}` : base;
}

/** Canonical vimeo.com watch URL, used for oEmbed lookups. */
export function vimeoCanonicalUrl(videoId: string, videoHash: string | null): string {
  return videoHash ? `https://vimeo.com/${videoId}/${videoHash}` : `https://vimeo.com/${videoId}`;
}

export interface VimeoMeta {
  title: string | null;
  thumbnailUrl: string | null;
  durationSec: number | null;
}

/** Fetch title/thumbnail/duration via Vimeo's public oEmbed endpoint. Best-effort. */
export async function fetchVimeoMeta(videoId: string, videoHash: string | null): Promise<VimeoMeta> {
  const target = vimeoCanonicalUrl(videoId, videoHash);
  try {
    const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(target)}`, {
      // Cache a while — titles/thumbnails rarely change.
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return { title: null, thumbnailUrl: null, durationSec: null };
    const data = (await res.json()) as { title?: string; thumbnail_url?: string; duration?: number };
    return {
      title: data.title ?? null,
      thumbnailUrl: data.thumbnail_url ?? null,
      durationSec: typeof data.duration === "number" ? data.duration : null,
    };
  } catch {
    return { title: null, thumbnailUrl: null, durationSec: null };
  }
}

/** "1:47" style label from a duration in seconds. */
export function formatDuration(sec: number | null | undefined): string | null {
  if (!sec || sec <= 0) return null;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

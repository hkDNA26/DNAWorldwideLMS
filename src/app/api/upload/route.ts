import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { parseFileUpload } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    await requireAuth("ADMIN");

    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "image";

    // optimize: downscale/re-encode oversized images. Left off for certificate
    // templates (printed, so they need their full resolution) and for logos,
    // which are small already and may be SVG.
    const allowedTypes: Record<string, { mimes: string[]; folder: string; optimize?: boolean }> = {
      cover: { mimes: ["image/jpeg", "image/png", "image/webp", "image/gif"], folder: "covers", optimize: true },
      video: { mimes: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"], folder: "videos" },
      image: { mimes: ["image/jpeg", "image/png", "image/webp", "image/gif"], folder: "images", optimize: true },
      template: { mimes: ["image/jpeg", "image/png", "image/webp"], folder: "certificate-templates" },
      thumbnail: { mimes: ["image/jpeg", "image/png", "image/webp"], folder: "thumbnails", optimize: true },
      logo: { mimes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"], folder: "organizations" },
    };

    const config = allowedTypes[type];
    if (!config) {
      return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });
    }

    const result = await parseFileUpload(request, "file", config.folder, config.mimes, config.optimize);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: { url: result.url } });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

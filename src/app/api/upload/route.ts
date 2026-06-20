import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { parseFileUpload } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    await requireAuth("INSTRUCTOR");

    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "image";

    const allowedTypes: Record<string, { mimes: string[]; folder: string }> = {
      cover: { mimes: ["image/jpeg", "image/png", "image/webp", "image/gif"], folder: "covers" },
      video: { mimes: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"], folder: "videos" },
      image: { mimes: ["image/jpeg", "image/png", "image/webp", "image/gif"], folder: "images" },
      template: { mimes: ["image/jpeg", "image/png", "image/webp"], folder: "certificate-templates" },
    };

    const config = allowedTypes[type];
    if (!config) {
      return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });
    }

    const result = await parseFileUpload(request, "file", config.folder, config.mimes);

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

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import mime from "mime-types";

/**
 * Serves uploaded files (course videos/images, certificate backgrounds, etc.)
 * directly from disk instead of relying on Next's `public/` static handler.
 *
 * `next start`'s production server resolves `public/` assets against a
 * manifest built at compile time — files written to `public/uploads` at
 * runtime (via storage.ts, onto a mounted persistent volume) are invisible
 * to it and 404 even though they're genuinely on disk. This route reads the
 * file live on every request instead, so it always reflects what's actually
 * on disk, and adds Range support so video seeking works.
 */

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;

  if (segments.some((s) => s.includes("..") || s.includes("/") || s.includes("\\"))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const uploadDir = process.env.UPLOAD_DIR || "./public/uploads";
  const filePath = path.join(process.cwd(), uploadDir.replace("./", ""), ...segments);

  let stat: Awaited<ReturnType<typeof fs.stat>>;
  try {
    stat = await fs.stat(filePath);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const contentType = mime.lookup(filePath) || "application/octet-stream";
  // Video/image uploads get a fresh UUID filename per upload (see storage.ts),
  // so caching them forever is safe. SCORM files live at a stable, courseId-based
  // path that "replace package" overwrites in place, so they must revalidate.
  const cacheControl = segments[0] === "scorm" ? "public, max-age=0, must-revalidate" : "public, max-age=31536000, immutable";

  const range = request.headers.get("range");
  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    const start = match?.[1] ? Number(match[1]) : 0;
    const end = match?.[2] ? Number(match[2]) : stat.size - 1;
    const chunkSize = end - start + 1;

    const fileHandle = await fs.open(filePath, "r");
    try {
      const buffer = Buffer.alloc(chunkSize);
      await fileHandle.read(buffer, 0, chunkSize, start);
      return new NextResponse(new Uint8Array(buffer), {
        status: 206,
        headers: {
          "Content-Type": contentType,
          "Content-Range": `bytes ${start}-${end}/${stat.size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": String(chunkSize),
          "Cache-Control": cacheControl,
        },
      });
    } finally {
      await fileHandle.close();
    }
  }

  const buffer = await fs.readFile(filePath);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(stat.size),
      "Accept-Ranges": "bytes",
      "Cache-Control": cacheControl,
    },
  });
}

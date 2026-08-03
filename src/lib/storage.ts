import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export interface StorageProvider {
  save(file: Buffer, originalName: string, folder: string): Promise<string>;
  delete(filePath: string): Promise<void>;
  getPublicUrl(filePath: string): string;
}

class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || "./public/uploads";
  }

  async save(file: Buffer, originalName: string, folder: string): Promise<string> {
    const ext = path.extname(originalName).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    const dir = path.join(process.cwd(), this.uploadDir.replace("./", ""), folder);

    await fs.mkdir(dir, { recursive: true });

    const fullPath = path.join(dir, filename);
    await fs.writeFile(fullPath, file);

    return `/uploads/${folder}/${filename}`;
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), "public", filePath);
    try {
      await fs.unlink(fullPath);
    } catch {
      // File may not exist; ignore
    }
  }

  getPublicUrl(filePath: string): string {
    return filePath;
  }
}

export const storage: StorageProvider = new LocalStorageProvider();

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

// Some hosts (Dropbox share links in particular) report a generic binary
// content-type for perfectly valid files instead of the real mime type.
const GENERIC_CONTENT_TYPES = new Set(["application/octet-stream", "application/binary", ""]);

/** Rewrites a Dropbox share link so it serves the raw file instead of the HTML preview page. */
function normalizeRemoteUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith("dropbox.com")) {
      parsed.searchParams.set("dl", "1");
      return parsed.toString();
    }
  } catch {
    // Not a valid URL — let fetch() below produce a clear error.
  }
  return url;
}

/** Downloads a remote file (e.g. a Dropbox share link) and stores it via the configured StorageProvider. */
export async function downloadRemoteFile(
  url: string,
  folder: string,
  allowedMimes: string[]
): Promise<{ url: string; error?: never } | { url?: never; error: string }> {
  let response: Response;
  try {
    response = await fetch(normalizeRemoteUrl(url));
  } catch (err) {
    console.error(`Failed to fetch ${url}:`, err);
    return { error: `Could not reach ${url}` };
  }

  if (!response.ok) {
    return { error: `${url} returned HTTP ${response.status}` };
  }

  const contentType = response.headers.get("content-type")?.split(";")[0].trim() || "";
  let resolvedMime = contentType;
  let urlExt = "";
  try {
    urlExt = path.extname(new URL(url).pathname).toLowerCase();
  } catch {
    // ignore — url was already validated by the fetch() above
  }

  if (!allowedMimes.includes(resolvedMime) && GENERIC_CONTENT_TYPES.has(contentType)) {
    const inferredMime = MIME_BY_EXT[urlExt];
    if (inferredMime && allowedMimes.includes(inferredMime)) {
      resolvedMime = inferredMime;
    }
  }

  if (!allowedMimes.includes(resolvedMime)) {
    return { error: `${url} is not an allowed file type (got ${contentType || "unknown"})` };
  }

  const maxSize = 100 * 1024 * 1024; // 100MB
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > maxSize) {
    return { error: `${url} is too large (max 100MB)` };
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > maxSize) {
    return { error: `${url} is too large (max 100MB)` };
  }

  const ext = urlExt || EXT_BY_MIME[resolvedMime] || "";
  const savedUrl = await storage.save(buffer, `download${ext}`, folder);

  return { url: savedUrl };
}

export async function parseFileUpload(
  request: Request,
  field: string,
  folder: string,
  allowedTypes: string[]
): Promise<{ url: string; error?: never } | { url?: never; error: string }> {
  try {
    const formData = await request.formData();
    const file = formData.get(field);

    if (!file || !(file instanceof File)) {
      return { error: "No file provided" };
    }

    if (!allowedTypes.includes(file.type)) {
      return { error: `File type ${file.type} not allowed` };
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return { error: "File too large (max 100MB)" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await storage.save(buffer, file.name, folder);

    return { url };
  } catch (err) {
    console.error("File upload error:", err);
    return { error: "Upload failed" };
  }
}

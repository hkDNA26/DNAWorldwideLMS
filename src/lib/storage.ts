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

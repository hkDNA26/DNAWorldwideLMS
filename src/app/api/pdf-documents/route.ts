import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storage } from "@/lib/storage";
import { PdfCategory } from "@/generated/prisma/enums";
import { getLibraryCategory, isAllowedForCategory } from "@/lib/library";

const MAX_SIZE = 100 * 1024 * 1024; // 100MB
const VALID_CATEGORIES = Object.values(PdfCategory) as string[];

export async function POST(request: Request) {
  try {
    const session = await requireAuth("ADMIN");

    const formData = await request.formData();
    const category = String(formData.get("category") || "");
    const title = String(formData.get("title") || "").trim();
    const file = formData.get("file");

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "A valid category is required" }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: "A title is required" }, { status: 400 });
    }
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "A file is required" }, { status: 400 });
    }

    const def = getLibraryCategory(category as PdfCategory);
    if (!isAllowedForCategory(def, file.type, file.name)) {
      return NextResponse.json(
        { error: `That file type isn't allowed here. Expected: ${def.acceptHint}.` },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 100MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileUrl = await storage.save(buffer, file.name, def.folder);

    const doc = await db.pdfDocument.create({
      data: {
        category: category as PdfCategory,
        title,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || null,
        uploadedById: session.userId,
      },
    });

    return NextResponse.json({ data: doc }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Create library file error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

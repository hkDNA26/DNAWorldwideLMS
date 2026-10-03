import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storage } from "@/lib/storage";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth("ADMIN");
    const { id } = await params;
    const body = await request.json();
    const title = String(body.title ?? "").trim();

    if (!title) {
      return NextResponse.json({ error: "Title can't be empty" }, { status: 400 });
    }

    const doc = await db.pdfDocument.findUnique({ where: { id } });
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Only the display title changes — the stored file and its URL are untouched,
    // so nothing that already links to this document breaks.
    const updated = await db.pdfDocument.update({ where: { id }, data: { title } });
    return NextResponse.json({ data: updated });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Rename PDF document error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth("ADMIN");
    const { id } = await params;

    const doc = await db.pdfDocument.findUnique({ where: { id } });
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Remove the DB record first, then the file from disk. If the unlink fails
    // (already gone), storage.delete swallows it so the record still clears.
    await db.pdfDocument.delete({ where: { id } });
    await storage.delete(doc.fileUrl);

    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Delete PDF document error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

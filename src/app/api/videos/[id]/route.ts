import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth("ADMIN");
    const { id } = await params;
    const body = await request.json();
    const title = String(body.title ?? "").trim();

    if (!title) {
      return NextResponse.json({ error: "Title can't be empty" }, { status: 400 });
    }

    const video = await db.videoResource.findUnique({ where: { id } });
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const updated = await db.videoResource.update({ where: { id }, data: { title } });
    return NextResponse.json({ data: updated });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Rename video error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth("ADMIN");
    const { id } = await params;

    const video = await db.videoResource.findUnique({ where: { id } });
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    await db.videoResource.delete({ where: { id } });
    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Delete video error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

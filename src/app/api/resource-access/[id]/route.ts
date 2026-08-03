import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth("ADMIN");
    const { id } = await params;

    const access = await db.resourceAccess.findUnique({ where: { id } });
    if (!access) {
      return NextResponse.json({ error: "Access record not found" }, { status: 404 });
    }

    await db.resourceAccess.delete({ where: { id } });

    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Revoke resource access error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

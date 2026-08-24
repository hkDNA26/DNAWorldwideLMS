import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { id: string };

export async function PATCH(request: Request, { params }: { params: Promise<Params> }) {
  try {
    await requireAuth("ADMIN");
    const { id } = await params;
    const body = await request.json();
    const { name, logoUrl } = body;

    const data: { name?: string; logoUrl?: string | null } = {};
    if (name !== undefined) {
      if (!name.trim()) return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
      data.name = name.trim();
    }
    if (logoUrl !== undefined) data.logoUrl = logoUrl?.trim() || null;

    const organization = await db.organization.update({
      where: { id },
      data,
      select: { id: true, name: true, logoUrl: true, createdAt: true },
    });

    return NextResponse.json({ data: organization });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Update organization error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<Params> }) {
  try {
    await requireAuth("ADMIN");
    const { id } = await params;

    const usersLinked = await db.user.count({ where: { organizationId: id } });
    if (usersLinked > 0) {
      return NextResponse.json(
        { error: `${usersLinked} user(s) still belong to this organization — reassign them first.` },
        { status: 409 }
      );
    }

    await db.organization.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Delete organization error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

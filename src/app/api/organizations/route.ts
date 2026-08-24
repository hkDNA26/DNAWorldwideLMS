import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await requireAuth("ADMIN");

    const organizations = await db.organization.findMany({
      select: {
        id: true,
        name: true,
        logoUrl: true,
        createdAt: true,
        _count: { select: { users: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: organizations });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth("ADMIN");
    const body = await request.json();
    const { name, logoUrl } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
    }

    const organization = await db.organization.create({
      data: { name: name.trim(), logoUrl: logoUrl?.trim() || null },
      select: { id: true, name: true, logoUrl: true, createdAt: true },
    });

    return NextResponse.json({ data: organization }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Create organization error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

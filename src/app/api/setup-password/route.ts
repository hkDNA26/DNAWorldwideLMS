import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

    const record = await db.inviteToken.findUnique({
      where: { token },
      select: { id: true, expiresAt: true, usedAt: true, user: { select: { name: true, email: true } } },
    });

    if (!record) return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    if (record.usedAt) return NextResponse.json({ error: "This link has already been used" }, { status: 410 });
    if (record.expiresAt < new Date()) return NextResponse.json({ error: "This link has expired" }, { status: 410 });

    return NextResponse.json({ data: { name: record.user.name, email: record.user.email } });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) return NextResponse.json({ error: "Token and password required" }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    const record = await db.inviteToken.findUnique({
      where: { token },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });

    if (!record) return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    if (record.usedAt) return NextResponse.json({ error: "This link has already been used" }, { status: 410 });
    if (record.expiresAt < new Date()) return NextResponse.json({ error: "This link has expired" }, { status: 410 });

    await db.$transaction([
      db.user.update({
        where: { id: record.userId },
        data: { passwordHash: await bcrypt.hash(password, 12) },
      }),
      db.inviteToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

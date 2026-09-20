import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAuth, createSession, setSessionCookie, sessionRevocationCutoff } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const { currentPassword, newPassword } = await request.json();

    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return NextResponse.json({ error: "Current and new password are required." }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.user.update({
      where: { id: session.userId },
      // Signs out every other session; the caller keeps access via the fresh
      // token issued below.
      data: { passwordHash, sessionsValidFrom: sessionRevocationCutoff() },
    });

    await setSessionCookie(await createSession(session));

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Change password error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession, setSessionCookie } from "@/lib/auth";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const ip = rateLimit(`login:ip:${clientIp(request)}`, 20, 15 * 60 * 1000);
    if (!ip.allowed) return tooManyRequests(ip.retryAfterSeconds);

    const account = rateLimit(`login:email:${String(email).toLowerCase()}`, 10, 15 * 60 * 1000);
    if (!account.allowed) return tooManyRequests(account.retryAfterSeconds);

    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const token = await createSession({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      data: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

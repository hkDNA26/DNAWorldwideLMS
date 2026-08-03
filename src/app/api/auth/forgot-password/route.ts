import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

// Always the same shape/message regardless of whether the email is
// registered — branching the response on that would let this endpoint be
// used to enumerate valid accounts.
const GENERIC_RESPONSE = {
  data: { message: "If an account exists for that email, we've sent password reset instructions." },
};

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, name: true, email: true },
    });

    if (user) {
      const inviteToken = await db.inviteToken.create({
        data: {
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour — shorter-lived than a new-account invite
        },
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetUrl = `${appUrl}/setup-password?token=${inviteToken.token}`;

      try {
        await sendPasswordResetEmail(user.email, user.name, resetUrl);
      } catch (emailErr) {
        console.error("Failed to send password reset email:", emailErr);
      }
    }

    return NextResponse.json(GENERIC_RESPONSE);
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

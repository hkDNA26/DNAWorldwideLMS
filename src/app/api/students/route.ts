import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendStudentInviteEmail } from "@/lib/email";
import crypto from "crypto";

export async function GET() {
  try {
    await requireAuth("INSTRUCTOR");

    const students = await db.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: students });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth("INSTRUCTOR");
    const body = await request.json();
    const {
      name,
      email,
      password,
      sendInvite = false,
      courseIds = [] as string[],
    } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    if (!sendInvite) {
      if (!password?.trim()) {
        return NextResponse.json({ error: "Password is required when not sending an invite" }, { status: 400 });
      }
      if (password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
      }
    }

    const existing = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }

    // Validate courseIds belong to this instructor
    let validCourseIds: string[] = [];
    if (courseIds.length > 0) {
      const ownedCourses = await db.course.findMany({
        where: { id: { in: courseIds }, instructorId: session.userId },
        select: { id: true },
      });
      validCourseIds = ownedCourses.map((c) => c.id);
    }

    const passwordHash = await bcrypt.hash(
      sendInvite ? crypto.randomBytes(16).toString("hex") : password,
      12
    );

    // Create user + token atomically via nested create
    const student = await db.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        role: "STUDENT",
        ...(validCourseIds.length > 0 && {
          enrollments: {
            create: validCourseIds.map((courseId) => ({ courseId })),
          },
        }),
        ...(sendInvite && {
          inviteTokens: {
            create: {
              expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
            },
          },
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: { select: { enrollments: true } },
        inviteTokens: sendInvite ? { select: { token: true }, orderBy: { createdAt: "desc" }, take: 1 } : false,
      },
    });

    if (sendInvite) {
      const token = (student as typeof student & { inviteTokens: { token: string }[] }).inviteTokens[0].token;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const setupUrl = `${appUrl}/setup-password?token=${token}`;

      const courseNames =
        validCourseIds.length > 0
          ? (
              await db.course.findMany({
                where: { id: { in: validCourseIds } },
                select: { title: true },
              })
            ).map((c) => c.title)
          : [];

      try {
        await sendStudentInviteEmail(student.email, student.name, setupUrl, courseNames);
      } catch (emailErr) {
        console.error("Failed to send invite email:", emailErr);
        const { inviteTokens: _tokens, ...studentData } = student as typeof student & { inviteTokens: unknown };
        return NextResponse.json(
          {
            data: studentData,
            warning: "Student created but invite email could not be sent. Check your SMTP settings.",
          },
          { status: 201 }
        );
      }
    }

    const { inviteTokens: _tokens, ...studentData } = student as typeof student & { inviteTokens?: unknown };
    return NextResponse.json({ data: studentData }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Create student error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

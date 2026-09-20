import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { RESOURCES } from "@/lib/resources";
import { secureToken } from "@/lib/tokens";
import { sendStudentInviteEmail } from "@/lib/email";
import { parseStaffWorkbook, type ParsedStaffRow } from "@/lib/staff-import/parse";
import type { ResourceKey } from "@/generated/prisma/enums";

// Invites are spaced out rather than fired in one burst. Fifty password-setup
// emails arriving at once from a young sending domain is exactly the pattern spam
// filters act on, and these are the emails people cannot afford to lose.
const INVITE_GAP_MS = 1500;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(request: Request) {
  try {
    await requireAuth("ADMIN");

    const form = await request.formData();
    const file = form.get("file");
    const commit = form.get("commit") === "true";
    const sendInvites = form.get("sendInvites") !== "false";
    const role = (form.get("role") as string) === "TENDER" ? "TENDER" : "STAFF";
    const organizationId = (form.get("organizationId") as string) || null;
    const courseIds = JSON.parse((form.get("courseIds") as string) || "[]") as string[];
    const resourceKeys = JSON.parse((form.get("resourceKeys") as string) || "[]") as ResourceKey[];

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ errors: ["No file provided"] }, { status: 400 });
    }
    if (role === "TENDER" && !organizationId) {
      return NextResponse.json({ errors: ["Tender accounts must belong to an organization"] }, { status: 400 });
    }

    const parsed = await parseStaffWorkbook(Buffer.from(await file.arrayBuffer()));
    if (parsed.errors) return NextResponse.json({ errors: parsed.errors }, { status: 400 });

    const { valid, problems } = parsed.data;

    // Anything already in the system is reported and skipped, never overwritten —
    // silently changing an existing person's access isn't something a bulk import
    // should do on its own.
    const existing = await db.user.findMany({
      where: { email: { in: valid.map((r) => r.email) } },
      select: { email: true },
    });
    const existingEmails = new Set(existing.map((u) => u.email.toLowerCase()));

    const toCreate = valid.filter((r) => !existingEmails.has(r.email));
    const skipped = valid.filter((r) => existingEmails.has(r.email));

    const validCourseIds = courseIds.length
      ? (await db.course.findMany({ where: { id: { in: courseIds } }, select: { id: true } })).map((c) => c.id)
      : [];
    const validResourceKeys =
      role === "TENDER" ? [] : resourceKeys.filter((k) => RESOURCES.some((r) => r.key === k));

    const summary = {
      willCreate: toCreate.map((r) => ({ name: r.name, email: r.email })),
      skipped: skipped.map((r) => ({ name: r.name, email: r.email, reason: "Already has an account" })),
      problems,
      courses: (
        await db.course.findMany({ where: { id: { in: validCourseIds } }, select: { title: true } })
      ).map((c) => c.title),
      resources: validResourceKeys.map((k) => RESOURCES.find((r) => r.key === k)!.label),
      sendInvites,
      role,
    };

    if (!commit) {
      return NextResponse.json({ data: { preview: true, ...summary } });
    }

    const created: { name: string; email: string }[] = [];
    const failed: { name: string; email: string; reason: string }[] = [];

    for (const person of toCreate) {
      try {
        await createOne(person, {
          role,
          organizationId,
          validCourseIds,
          validResourceKeys,
          sendInvites,
        });
        created.push({ name: person.name, email: person.email });
        if (sendInvites) await sleep(INVITE_GAP_MS);
      } catch (err) {
        console.error(`Bulk create failed for ${person.email}:`, err);
        failed.push({
          name: person.name,
          email: person.email,
          reason: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({ data: { preview: false, ...summary, created, failed } });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ errors: [err.message] }, { status: 401 });
    }
    console.error("Bulk staff upload error:", err);
    return NextResponse.json({ errors: ["Something went wrong"] }, { status: 500 });
  }
}

async function createOne(
  person: ParsedStaffRow,
  opts: {
    role: "STAFF" | "TENDER";
    organizationId: string | null;
    validCourseIds: string[];
    validResourceKeys: ResourceKey[];
    sendInvites: boolean;
  }
) {
  const { role, organizationId, validCourseIds, validResourceKeys, sendInvites } = opts;

  // Invited accounts get an unguessable throwaway password: the real one is set
  // through the invite link, and this is never shown to anyone.
  const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 12);

  const user = await db.user.create({
    data: {
      name: person.name,
      email: person.email,
      passwordHash,
      role,
      organizationId: role === "TENDER" ? organizationId : null,
      ...(validCourseIds.length > 0 && {
        enrollments: { create: validCourseIds.map((courseId) => ({ courseId })) },
      }),
      ...(validResourceKeys.length > 0 && {
        resourceAccess: { create: validResourceKeys.map((resource) => ({ resource })) },
      }),
      ...(sendInvites && {
        inviteTokens: {
          create: { token: secureToken(), expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000) },
        },
      }),
    },
    select: {
      name: true,
      email: true,
      inviteTokens: sendInvites ? { select: { token: true }, orderBy: { createdAt: "desc" }, take: 1 } : false,
    },
  });

  if (!sendInvites) return;

  const token = (user as typeof user & { inviteTokens: { token: string }[] }).inviteTokens[0].token;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const setupUrl = `${appUrl}/setup-password?token=${token}`;

  const courseNames = validCourseIds.length
    ? (await db.course.findMany({ where: { id: { in: validCourseIds } }, select: { title: true } })).map(
        (c) => c.title
      )
    : [];
  const resourceNames = validResourceKeys.map((k) => RESOURCES.find((r) => r.key === k)!.label);

  // A failed send must not lose the account — the admin can resend from the
  // student's page, and losing the user record would be far worse.
  try {
    await sendStudentInviteEmail(user.email, user.name, setupUrl, courseNames, resourceNames);
  } catch (emailErr) {
    console.error(`Invite email failed for ${user.email}:`, emailErr);
  }
}

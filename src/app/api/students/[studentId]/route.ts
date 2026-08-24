import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { TENDER_COURSE_TITLES } from "@/lib/tender";

type Params = { studentId: string };

// Toggling a user between STAFF and TENDER — ADMIN is deliberately excluded from this
// self-service route (changing admin access stays a manual DB operation).
export async function PATCH(req: Request, { params }: { params: Promise<Params> }) {
  try {
    await requireAuth("ADMIN");
    const { studentId } = await params;
    const body = await req.json();
    const { role, organizationId } = body as { role?: "STAFF" | "TENDER"; organizationId?: string | null };

    const student = await db.user.findUnique({ where: { id: studentId } });
    if (!student || student.role === "ADMIN") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (role !== undefined && role !== "STAFF" && role !== "TENDER") {
      return NextResponse.json({ error: "Role must be STAFF or TENDER" }, { status: 400 });
    }
    if (role === "TENDER" && !organizationId && !student.organizationId) {
      return NextResponse.json({ error: "Tender accounts must belong to an organization" }, { status: 400 });
    }
    if (organizationId) {
      const org = await db.organization.findUnique({ where: { id: organizationId } });
      if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const nextRole = role ?? student.role;
    const updated = await db.user.update({
      where: { id: studentId },
      data: {
        role: nextRole,
        // Demoting back to STAFF clears the organization link; promoting to TENDER
        // requires one (validated above).
        organizationId: nextRole === "TENDER" ? organizationId ?? student.organizationId : null,
      },
      select: { id: true, name: true, email: true, role: true, organizationId: true },
    });

    // Tender accounts get auto-enrolled in their fixed course list on promotion —
    // courses that don't exist here yet (see lib/tender.ts) are simply skipped.
    if (role === "TENDER" && student.role !== "TENDER") {
      const tenderCourses = await db.course.findMany({
        where: { title: { in: TENDER_COURSE_TITLES } },
        select: { id: true },
      });
      for (const c of tenderCourses) {
        await db.enrollment.upsert({
          where: { studentId_courseId: { studentId, courseId: c.id } },
          update: {},
          create: { studentId, courseId: c.id },
        });
      }
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Update student error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<Params> }) {
  try {
    await requireAuth("ADMIN");
    const { studentId } = await params;

    const student = await db.user.findUnique({ where: { id: studentId } });
    if (!student || student.role === "ADMIN") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Delete in dependency order — children before parents
    await db.$transaction([
      // AttemptAnswers cascade from QuizAttempts, so delete attempts first
      db.quizAttempt.deleteMany({ where: { studentId } }),
      // LessonProgress cascades from Enrollment, so delete enrollments next
      db.enrollment.deleteMany({ where: { studentId } }),
      db.certificate.deleteMany({ where: { studentId } }),
      // InviteTokens have onDelete: Cascade on User, but delete explicitly to be safe
      db.inviteToken.deleteMany({ where: { userId: studentId } }),
      db.user.delete({ where: { id: studentId } }),
    ]);

    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Delete student error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

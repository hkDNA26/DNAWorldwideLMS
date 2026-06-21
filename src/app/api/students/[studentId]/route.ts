import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { studentId: string };

export async function DELETE(_req: Request, { params }: { params: Promise<Params> }) {
  try {
    await requireAuth("INSTRUCTOR");
    const { studentId } = await params;

    const student = await db.user.findUnique({ where: { id: studentId } });
    if (!student || student.role !== "STUDENT") {
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

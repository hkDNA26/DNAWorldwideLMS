import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendReminderEmail } from "@/lib/email";

type Params = { studentId: string };

export async function POST(_req: Request, { params }: { params: Promise<Params> }) {
  try {
    await requireAuth("INSTRUCTOR");
    const { studentId } = await params;

    const student = await db.user.findUnique({
      where: { id: studentId, role: "STUDENT" },
      select: { id: true, name: true, email: true },
    });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const enrollments = await db.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            modules: {
              orderBy: { orderIndex: "asc" },
              include: {
                lessons: { orderBy: { orderIndex: "asc" }, select: { id: true, title: true } },
              },
            },
          },
        },
        lessonProgress: { select: { lessonId: true } },
      },
    });

    const certificates = await db.certificate.findMany({
      where: { studentId },
      select: { courseId: true },
    });
    const certSet = new Set(certificates.map((c) => c.courseId));

    const courses = enrollments.map((enr) => {
      const allLessons = enr.course.modules.flatMap((m) => m.lessons);
      const completedIds = new Set(enr.lessonProgress.map((p) => p.lessonId));
      const incompleteLessons = allLessons
        .filter((l) => !completedIds.has(l.id))
        .map((l) => l.title);
      return {
        title: enr.course.title,
        completedLessons: enr.lessonProgress.length,
        totalLessons: allLessons.length,
        isCompleted: !!enr.completedAt,
        hasCertificate: certSet.has(enr.courseId),
        incompleteLessons,
      };
    });

    await sendReminderEmail(student.email, student.name, courses);

    return NextResponse.json({ data: { sent: true } });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Reminder email error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}

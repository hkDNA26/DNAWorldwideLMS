import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await requireAuth("STAFF");

    const enrollments = await db.enrollment.findMany({
      where: { studentId: session.userId },
      include: {
        course: {
          include: {
            instructor: { select: { name: true } },
            modules: {
              include: { lessons: { select: { id: true } } },
            },
            _count: { select: { modules: true } },
          },
        },
        lessonProgress: { select: { lessonId: true } },
      },
      orderBy: { enrolledAt: "desc" },
    });

    const result = enrollments.map((e) => {
      const totalLessons = e.course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
      const completedLessons = e.lessonProgress.length;
      const progress =
        e.course.type === "SCORM"
          ? e.completedAt
            ? 100
            : 0
          : totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

      return {
        ...e,
        progress,
        totalLessons,
        completedLessons,
      };
    });

    return NextResponse.json({ data: result });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Self-enrollment is disabled — students only get access to courses an admin
// assigns them from the Staff section.
export async function POST() {
  return NextResponse.json(
    { error: "Self-enrollment is disabled. Ask your admin to add you to a course." },
    { status: 410 }
  );
}

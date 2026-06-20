import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await requireAuth("STUDENT");

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
      const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

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

export async function POST(request: Request) {
  try {
    const session = await requireAuth("STUDENT");
    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json({ error: "Course ID required" }, { status: 400 });
    }

    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course || course.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const existing = await db.enrollment.findUnique({
      where: { studentId_courseId: { studentId: session.userId, courseId } },
    });
    if (existing) {
      return NextResponse.json({ error: "Already enrolled" }, { status: 409 });
    }

    const enrollment = await db.enrollment.create({
      data: { studentId: session.userId, courseId },
    });

    return NextResponse.json({ data: enrollment }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

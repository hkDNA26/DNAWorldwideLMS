import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await requireAuth("STUDENT");
    const body = await request.json();
    const { lessonId } = body;

    if (!lessonId) {
      return NextResponse.json({ error: "Lesson ID required" }, { status: 400 });
    }

    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true },
    });
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const enrollment = await db.enrollment.findFirst({
      where: { courseId: lesson.module.courseId, studentId: session.userId },
    });
    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
    }

    const progress = await db.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId },
      },
      create: { enrollmentId: enrollment.id, lessonId },
      update: {},
    });

    // Check course completion
    const allLessons = await db.lesson.findMany({
      where: { module: { courseId: lesson.module.courseId } },
      select: { id: true },
    });
    const completedLessons = await db.lessonProgress.findMany({
      where: { enrollmentId: enrollment.id },
      select: { lessonId: true },
    });
    const completedIds = new Set(completedLessons.map((l) => l.lessonId));
    const allComplete = allLessons.every((l) => completedIds.has(l.id));

    if (allComplete && !enrollment.completedAt) {
      await db.enrollment.update({
        where: { id: enrollment.id },
        data: { completedAt: new Date() },
      });

      const existing = await db.certificate.findUnique({
        where: { studentId_courseId: { studentId: session.userId, courseId: lesson.module.courseId } },
      });
      if (!existing) {
        await db.certificate.create({
          data: { studentId: session.userId, courseId: lesson.module.courseId },
        });
      }
    }

    return NextResponse.json({ data: progress });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Progress error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

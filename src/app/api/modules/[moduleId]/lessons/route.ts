import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { moduleId: string };

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const session = await requireAuth("INSTRUCTOR");
    const { moduleId } = await params;
    const body = await request.json();

    const module = await db.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });
    if (!module || module.course.instructorId !== session.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const lastLesson = await db.lesson.findFirst({
      where: { moduleId },
      orderBy: { orderIndex: "desc" },
    });

    const lesson = await db.lesson.create({
      data: {
        moduleId,
        title: body.title?.trim() || "New Lesson",
        orderIndex: (lastLesson?.orderIndex ?? -1) + 1,
        contentType: body.contentType || "TEXT",
        content: body.content || null,
        videoUrl: body.videoUrl || null,
      },
    });

    if (body.contentType === "QUIZ") {
      await db.quiz.create({
        data: {
          lessonId: lesson.id,
          title: body.title?.trim() || "Quiz",
          passingScore: body.passingScore || 70,
        },
      });
    }

    const full = await db.lesson.findUnique({
      where: { id: lesson.id },
      include: { quiz: true },
    });

    return NextResponse.json({ data: full }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const session = await requireAuth("INSTRUCTOR");
    const { moduleId } = await params;
    const body = await request.json(); // [{ id, orderIndex }]

    const module = await db.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });
    if (!module || module.course.instructorId !== session.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await Promise.all(
      body.map((l: { id: string; orderIndex: number }) =>
        db.lesson.update({ where: { id: l.id }, data: { orderIndex: l.orderIndex } })
      )
    );

    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

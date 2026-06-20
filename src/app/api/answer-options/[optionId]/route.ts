import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { optionId: string };

export async function DELETE(_req: Request, { params }: { params: Promise<Params> }) {
  try {
    const session = await requireAuth("INSTRUCTOR");
    const { optionId } = await params;

    const option = await db.answerOption.findUnique({
      where: { id: optionId },
      include: {
        question: {
          include: { quiz: { include: { lesson: { include: { module: { include: { course: true } } } } } } },
        },
      },
    });

    if (!option || option.question.quiz.lesson.module.course.instructorId !== session.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Don't allow deleting below 2 options
    const optionCount = await db.answerOption.count({ where: { questionId: option.questionId } });
    if (optionCount <= 2) {
      return NextResponse.json({ error: "A question must have at least 2 options" }, { status: 400 });
    }

    await db.answerOption.delete({ where: { id: optionId } });

    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

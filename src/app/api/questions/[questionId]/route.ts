import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { questionId: string };

export async function PATCH(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const session = await requireAuth("INSTRUCTOR");
    const { questionId } = await params;
    const body = await request.json();

    const question = await db.question.findUnique({
      where: { id: questionId },
      include: { quiz: { include: { lesson: { include: { module: { include: { course: true } } } } } } },
    });
    if (!question || question.quiz.lesson.module.course.instructorId !== session.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Update question text
    if (body.questionText !== undefined) {
      await db.question.update({
        where: { id: questionId },
        data: { questionText: body.questionText },
      });
    }

    // Upsert answer options — temp-* IDs are client-side placeholders, always create them
    if (body.answerOptions) {
      for (const opt of body.answerOptions) {
        if (opt.id && !opt.id.startsWith("temp-")) {
          await db.answerOption.update({
            where: { id: opt.id },
            data: { text: opt.text, isCorrect: opt.isCorrect },
          });
        } else {
          await db.answerOption.create({
            data: { questionId, text: opt.text, isCorrect: opt.isCorrect },
          });
        }
      }
    }

    const updated = await db.question.findUnique({
      where: { id: questionId },
      include: { answerOptions: true },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<Params> }) {
  try {
    const session = await requireAuth("INSTRUCTOR");
    const { questionId } = await params;

    const question = await db.question.findUnique({
      where: { id: questionId },
      include: { quiz: { include: { lesson: { include: { module: { include: { course: true } } } } } } },
    });
    if (!question || question.quiz.lesson.module.course.instructorId !== session.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.question.delete({ where: { id: questionId } });

    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

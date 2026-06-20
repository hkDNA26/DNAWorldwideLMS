import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { quizId: string };

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const session = await requireAuth("INSTRUCTOR");
    const { quizId } = await params;
    const body = await request.json();

    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: { lesson: { include: { module: { include: { course: true } } } } },
    });
    if (!quiz || quiz.lesson.module.course.instructorId !== session.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const lastQuestion = await db.question.findFirst({
      where: { quizId },
      orderBy: { orderIndex: "desc" },
    });

    const question = await db.question.create({
      data: {
        quizId,
        questionText: body.questionText || "New question",
        type: body.type || "MULTIPLE_CHOICE",
        orderIndex: (lastQuestion?.orderIndex ?? -1) + 1,
        answerOptions: {
          create:
            body.type === "TRUE_FALSE"
              ? [
                  { text: "True", isCorrect: true },
                  { text: "False", isCorrect: false },
                ]
              : body.type === "SHORT_ANSWER"
              ? []
              : [
                  { text: "Option A", isCorrect: false },
                  { text: "Option B", isCorrect: false },
                ],
        },
      },
      include: { answerOptions: true },
    });

    return NextResponse.json({ data: question }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

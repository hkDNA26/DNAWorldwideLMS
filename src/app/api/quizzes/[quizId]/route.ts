import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { quizId: string };

export async function PATCH(request: Request, { params }: { params: Promise<Params> }) {
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

    const updated = await db.quiz.update({
      where: { id: quizId },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.passingScore !== undefined && { passingScore: body.passingScore }),
      },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

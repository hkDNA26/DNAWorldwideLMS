import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordCourseCompletion } from "@/lib/sheets";

type Params = { quizId: string };

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const session = await requireAuth("STUDENT");
    const { quizId } = await params;
    const body = await request.json();
    // body.answers: [{ questionId, answerOptionId?, textAnswer? }]

    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: { answerOptions: true },
          orderBy: { orderIndex: "asc" },
        },
        lesson: { include: { module: true } },
      },
    });
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Verify enrollment
    const enrollment = await db.enrollment.findFirst({
      where: { courseId: quiz.lesson.module.courseId, studentId: session.userId },
    });
    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
    }

    let correctCount = 0;
    const gradedAnswers = body.answers.map((a: { questionId: string; answerOptionId?: string; textAnswer?: string }) => {
      const question = quiz.questions.find((q) => q.id === a.questionId);
      if (!question) return { ...a, correct: false };

      if (question.type === "SHORT_ANSWER") {
        correctCount += 0; // Short answer not auto-graded as correct
        return { ...a, correct: false };
      }

      const selectedOption = question.answerOptions.find((o) => o.id === a.answerOptionId);
      const correct = !!selectedOption?.isCorrect;
      if (correct) correctCount++;
      return { ...a, correct };
    });

    const gradableQuestions = quiz.questions.filter((q) => q.type !== "SHORT_ANSWER");
    const score = gradableQuestions.length > 0
      ? Math.round((correctCount / gradableQuestions.length) * 100)
      : 0;
    const passed = score >= quiz.passingScore;

    const attempt = await db.quizAttempt.create({
      data: {
        studentId: session.userId,
        quizId,
        score,
        passed,
        answers: {
          create: body.answers.map((a: { questionId: string; answerOptionId?: string; textAnswer?: string }) => ({
            questionId: a.questionId,
            answerOptionId: a.answerOptionId || null,
            textAnswer: a.textAnswer || null,
          })),
        },
      },
      include: { answers: true },
    });

    // If passed, mark quiz lesson as complete
    if (passed) {
      const existing = await db.lessonProgress.findUnique({
        where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId: quiz.lessonId } },
      });
      if (!existing) {
        await db.lessonProgress.create({
          data: { enrollmentId: enrollment.id, lessonId: quiz.lessonId },
        });
      }

      // Check if course is now complete
      await checkCourseCompletion(enrollment.id, quiz.lesson.module.courseId, session.userId);
    }

    return NextResponse.json({
      data: {
        attemptId: attempt.id,
        score,
        passed,
        passingScore: quiz.passingScore,
        gradedAnswers,
      },
    });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Quiz attempt error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

async function checkCourseCompletion(enrollmentId: string, courseId: string, studentId: string) {
  const allLessons = await db.lesson.findMany({
    where: { module: { courseId } },
    select: { id: true },
  });

  const completedLessons = await db.lessonProgress.findMany({
    where: { enrollmentId },
    select: { lessonId: true },
  });

  const completedIds = new Set(completedLessons.map((l) => l.lessonId));
  const allComplete = allLessons.every((l) => completedIds.has(l.id));

  if (allComplete) {
    await db.enrollment.update({
      where: { id: enrollmentId },
      data: { completedAt: new Date() },
    });

    // Issue certificate if not already issued
    const existing = await db.certificate.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
    if (!existing) {
      await db.certificate.create({ data: { studentId, courseId } });

      // Record completion in Google Sheet
      const [student, course] = await Promise.all([
        db.user.findUnique({ where: { id: studentId }, select: { name: true } }),
        db.course.findUnique({ where: { id: courseId }, select: { title: true } }),
      ]);
      if (student && course) {
        recordCourseCompletion(student.name, course.title).catch((err) =>
          console.error("Google Sheets update failed:", err)
        );
      }
    }
  }
}

import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CoursePlayer } from "@/components/student/course-player";

type Params = { courseId: string; lessonId: string };

export default async function LearnPage({ params }: { params: Promise<Params> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { courseId, lessonId } = await params;

  const enrollment = await db.enrollment.findUnique({
    where: { studentId_courseId: { studentId: session.userId, courseId } },
    include: { lessonProgress: { select: { lessonId: true } } },
  });

  if (!enrollment) {
    redirect(`/student/catalog`);
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      instructor: { select: { name: true } },
      modules: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: {
            orderBy: { orderIndex: "asc" },
            select: { id: true, title: true, contentType: true, orderIndex: true },
          },
        },
      },
    },
  });

  if (!course) notFound();

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      quiz: {
        include: {
          questions: {
            orderBy: { orderIndex: "asc" },
            include: { answerOptions: true },
          },
        },
      },
    },
  });

  if (!lesson) notFound();

  const completedLessonIds = new Set(enrollment.lessonProgress.map((p) => p.lessonId));

  // Get latest quiz attempt if it's a quiz lesson
  let latestAttempt = null;
  if (lesson.contentType === "QUIZ" && lesson.quiz) {
    latestAttempt = await db.quizAttempt.findFirst({
      where: { studentId: session.userId, quizId: lesson.quiz.id },
      orderBy: { submittedAt: "desc" },
    });
  }

  const certificate = enrollment.completedAt
    ? await db.certificate.findUnique({
        where: { studentId_courseId: { studentId: session.userId, courseId } },
      })
    : null;

  return (
    <CoursePlayer
      course={course}
      currentLesson={lesson}
      completedLessonIds={Array.from(completedLessonIds)}
      enrollmentCompleted={!!enrollment.completedAt}
      certificate={certificate}
      latestAttempt={latestAttempt}
    />
  );
}

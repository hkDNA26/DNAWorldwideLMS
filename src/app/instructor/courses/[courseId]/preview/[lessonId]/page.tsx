import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CoursePlayer } from "@/components/student/course-player";

type Params = { courseId: string; lessonId: string };

export default async function PreviewPage({ params }: { params: Promise<Params> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { courseId, lessonId } = await params;

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

  if (!course || course.instructorId !== session.userId) notFound();

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

  return (
    <CoursePlayer
      course={course}
      currentLesson={lesson}
      completedLessonIds={[]}
      enrollmentCompleted={false}
      certificate={null}
      latestAttempt={null}
      isPreview
    />
  );
}

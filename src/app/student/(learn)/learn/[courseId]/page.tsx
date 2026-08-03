import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CourseIntro } from "@/components/student/course-intro";

type Params = { courseId: string };

export default async function LearnCoursePage({ params }: { params: Promise<Params> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { courseId } = await params;

  const enrollment = await db.enrollment.findUnique({
    where: { studentId_courseId: { studentId: session.userId, courseId } },
  });
  if (!enrollment) redirect("/student/catalog");

  const isFirstVisit = !enrollment.firstAccessedAt;

  if (isFirstVisit) {
    await db.enrollment.update({
      where: { id: enrollment.id },
      data: { firstAccessedAt: new Date() },
    });
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { type: true, title: true, description: true, coverImage: true, estimatedTime: true },
  });
  if (!course) redirect("/student/catalog");

  if (course.type === "SCORM") {
    const startUrl = `/student/learn/${courseId}/scorm`;
    if (!isFirstVisit) redirect(startUrl);
    return <CourseIntro course={course} startUrl={startUrl} />;
  }

  const firstLesson = await db.lesson.findFirst({
    where: { module: { courseId } },
    orderBy: [{ module: { orderIndex: "asc" } }, { orderIndex: "asc" }],
  });

  if (!firstLesson) redirect("/student/catalog");

  const startUrl = `/student/learn/${courseId}/${firstLesson.id}`;

  if (!isFirstVisit) {
    redirect(startUrl);
  }

  return <CourseIntro course={course} startUrl={startUrl} />;
}

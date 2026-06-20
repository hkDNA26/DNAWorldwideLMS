import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { courseId: string };

export default async function LearnCoursePage({ params }: { params: Promise<Params> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { courseId } = await params;

  const enrollment = await db.enrollment.findUnique({
    where: { studentId_courseId: { studentId: session.userId, courseId } },
  });
  if (!enrollment) redirect("/student/catalog");

  const firstLesson = await db.lesson.findFirst({
    where: { module: { courseId } },
    orderBy: [{ module: { orderIndex: "asc" } }, { orderIndex: "asc" }],
  });

  if (firstLesson) {
    redirect(`/student/learn/${courseId}/${firstLesson.id}`);
  }

  redirect("/student/catalog");
}

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { StudentDashboardClient } from "@/components/student/student-dashboard-client";

export default async function StudentDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  const enrollments = await db.enrollment.findMany({
    where: { studentId: session.userId },
    include: {
      course: {
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
      },
      lessonProgress: { select: { lessonId: true, completedAt: true }, orderBy: { completedAt: "desc" } },
    },
    orderBy: { enrolledAt: "desc" },
  });

  const certificates = await db.certificate.findMany({
    where: { studentId: session.userId },
    select: { courseId: true, verificationCode: true, issuedAt: true },
  });

  const certMap = new Map(certificates.map((c) => [c.courseId, c]));

  const courses = enrollments.map((enr) => {
    const allLessons = enr.course.modules.flatMap((m) => m.lessons);
    const completedIds = new Set(enr.lessonProgress.map((p) => p.lessonId));
    const totalLessons = allLessons.length;
    const completedLessons = enr.lessonProgress.length;
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // First uncompleted lesson, or first lesson if none completed
    const nextLesson =
      allLessons.find((l) => !completedIds.has(l.id)) ?? allLessons[0] ?? null;

    const cert = certMap.get(enr.courseId);

    return {
      enrollmentId: enr.id,
      courseId: enr.courseId,
      title: enr.course.title,
      instructor: enr.course.instructor.name,
      coverImage: enr.course.coverImage,
      totalLessons,
      completedLessons,
      progress,
      isCompleted: !!enr.completedAt,
      nextLessonId: nextLesson?.id ?? null,
      nextLessonTitle: nextLesson?.title ?? null,
      enrolledAt: enr.enrolledAt.toISOString(),
      certificate: cert
        ? { code: cert.verificationCode, issuedAt: cert.issuedAt.toISOString() }
        : null,
    };
  });

  const totalCompleted = courses.filter((c) => c.isCompleted).length;
  const avgProgress =
    courses.length > 0
      ? Math.round(courses.reduce((s, c) => s + c.progress, 0) / courses.length)
      : 0;

  return (
    <StudentDashboardClient
      name={session.name}
      summary={{
        enrolled: courses.length,
        completed: totalCompleted,
        certificates: certificates.length,
        avgProgress,
      }}
      courses={courses}
    />
  );
}

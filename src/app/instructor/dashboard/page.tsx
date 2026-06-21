import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardClient } from "@/components/instructor/dashboard-client";
import { redirect } from "next/navigation";

export default async function InstructorDashboard() {
  const session = await getSession();
  if (!session || session.role !== "INSTRUCTOR") redirect("/login");

  const courses = await db.course.findMany({
    where: { instructorId: session.userId },
    include: {
      _count: { select: { enrollments: true, modules: true } },
      enrollments: {
        select: { completedAt: true, enrolledAt: true },
        orderBy: { enrolledAt: "asc" },
      },
      modules: { select: { lessons: { select: { id: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Build 8-week enrollment trend
  const now = new Date();
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const start = new Date(now);
    start.setDate(start.getDate() - (7 - i) * 7);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { label: `W${i + 1}`, start, end };
  });

  const allEnrollments = courses.flatMap((c) => c.enrollments);
  const trend = weeks.map((w) => ({
    week: w.label,
    enrollments: allEnrollments.filter(
      (e) => new Date(e.enrolledAt) >= w.start && new Date(e.enrolledAt) < w.end
    ).length,
  }));

  const courseData = courses.map((c) => {
    const totalLessons = c.modules.reduce((s, m) => s + m.lessons.length, 0);
    const completions = c.enrollments.filter((e) => e.completedAt).length;
    const completionRate = c._count.enrollments > 0
      ? Math.round((completions / c._count.enrollments) * 100)
      : 0;
    return {
      id: c.id,
      title: c.title,
      status: c.status as string,
      coverImage: c.coverImage,
      enrollments: c._count.enrollments,
      modules: c._count.modules,
      totalLessons,
      completions,
      completionRate,
      createdAt: c.createdAt.toISOString(),
    };
  });

  const totalStudents = courses.reduce((s, c) => s + c._count.enrollments, 0);
  const totalCompletions = courses.reduce(
    (s, c) => s + c.enrollments.filter((e) => e.completedAt).length, 0
  );
  const avgCompletion = totalStudents > 0
    ? Math.round((totalCompletions / totalStudents) * 100)
    : 0;

  return (
    <DashboardClient
      name={session.name}
      summary={{
        totalCourses: courses.length,
        totalStudents,
        totalCompletions,
        avgCompletion,
      }}
      trend={trend}
      courses={courseData}
    />
  );
}

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AnalyticsPanel } from "@/components/instructor/analytics-panel";

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session || session.role !== "INSTRUCTOR") redirect("/login");

  const courses = await db.course.findMany({
    where: { instructorId: session.userId },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      modules: {
        select: { lessons: { select: { id: true } } },
      },
      enrollments: {
        select: {
          id: true,
          enrolledAt: true,
          completedAt: true,
          student: { select: { id: true, name: true, email: true } },
          lessonProgress: { select: { lessonId: true, completedAt: true } },
        },
        orderBy: { enrolledAt: "desc" },
      },
      certificates: {
        select: { studentId: true, issuedAt: true, verificationCode: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = courses.map((course) => {
    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const certMap = new Map(course.certificates.map((c) => [c.studentId, c]));

    const enrollments = course.enrollments.map((enr) => {
      const completedLessons = enr.lessonProgress.length;
      const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      const cert = certMap.get(enr.student.id);
      return {
        id: enr.id,
        enrolledAt: enr.enrolledAt.toISOString(),
        completedAt: enr.completedAt?.toISOString() ?? null,
        completedLessons,
        totalLessons,
        progress,
        hasCertificate: !!cert,
        certificateCode: cert?.verificationCode ?? null,
        certificateIssuedAt: cert?.issuedAt.toISOString() ?? null,
        student: enr.student,
      };
    });

    const completionCount = enrollments.filter((e) => e.completedAt).length;
    const avgProgress =
      enrollments.length > 0
        ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length)
        : 0;

    return {
      id: course.id,
      title: course.title,
      status: course.status as string,
      totalLessons,
      enrollmentCount: enrollments.length,
      completionCount,
      avgProgress,
      certCount: course.certificates.length,
      enrollments,
    };
  });

  const summary = {
    totalCourses: data.length,
    totalEnrollments: data.reduce((s, c) => s + c.enrollmentCount, 0),
    totalCompletions: data.reduce((s, c) => s + c.completionCount, 0),
    totalCertificates: data.reduce((s, c) => s + c.certCount, 0),
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{color:"#1a3d8f"}}>Analytics</h1>
        <p className="text-slate-500 mt-1">Course progression and certificate data across all students.</p>
      </div>
      <AnalyticsPanel summary={summary} courses={data} />
    </div>
  );
}

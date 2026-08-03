import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import { StudentDetailClient } from "@/components/instructor/student-detail-client";
import { RESOURCES } from "@/lib/resources";

type Params = { studentId: string };

export default async function StudentDetailPage({ params }: { params: Promise<Params> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const { studentId } = await params;

  const student = await db.user.findUnique({
    where: { id: studentId, role: "STAFF" },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  if (!student) notFound();

  const [enrollments, certificates, allCourses, resourceAccess] = await Promise.all([
    db.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            modules: {
              orderBy: { orderIndex: "asc" },
              include: {
                lessons: {
                  orderBy: { orderIndex: "asc" },
                  select: { id: true, title: true, contentType: true },
                },
              },
            },
          },
        },
        lessonProgress: { select: { lessonId: true } },
      },
      orderBy: { enrolledAt: "desc" },
    }),
    db.certificate.findMany({
      where: { studentId },
      select: { courseId: true, verificationCode: true, issuedAt: true },
    }),
    db.course.findMany({
      where: { instructorId: session.userId, status: "PUBLISHED" },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
    db.resourceAccess.findMany({
      where: { userId: studentId },
      select: { id: true, resource: true, grantedAt: true },
    }),
  ]);

  const certMap = new Map(certificates.map((c) => [c.courseId, c]));
  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));

  const courses = enrollments.map((enr) => {
    const allLessons = enr.course.modules.flatMap((m) => m.lessons);
    const completedIds = new Set(enr.lessonProgress.map((p) => p.lessonId));
    const cert = certMap.get(enr.courseId);
    return {
      enrollmentId: enr.id,
      courseId: enr.courseId,
      title: enr.course.title,
      enrolledAt: enr.enrolledAt.toISOString(),
      completedAt: enr.completedAt?.toISOString() ?? null,
      isCompleted: !!enr.completedAt,
      progress: allLessons.length > 0 ? Math.round((enr.lessonProgress.length / allLessons.length) * 100) : 0,
      completedLessons: enr.lessonProgress.length,
      totalLessons: allLessons.length,
      certificate: cert ? { code: cert.verificationCode, issuedAt: cert.issuedAt.toISOString() } : null,
      modules: enr.course.modules.map((m) => ({
        id: m.id,
        title: m.title,
        lessons: m.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          contentType: l.contentType,
          isCompleted: completedIds.has(l.id),
        })),
      })),
    };
  });

  const availableCourses = allCourses.filter((c) => !enrolledCourseIds.has(c.id));

  const grantedResourceKeys = new Set(resourceAccess.map((r) => r.resource));
  const grantedResources = resourceAccess.map((r) => {
    const def = RESOURCES.find((res) => res.key === r.resource)!;
    return { id: r.id, key: r.resource, label: def.label, grantedAt: r.grantedAt.toISOString() };
  });
  const availableResources = RESOURCES.filter((r) => !grantedResourceKeys.has(r.key)).map((r) => ({
    key: r.key,
    label: r.label,
  }));

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link
        href="/instructor/students"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Staff
      </Link>

      <StudentDetailClient
        student={{ ...student, createdAt: student.createdAt.toISOString() }}
        courses={courses}
        availableCourses={availableCourses}
        grantedResources={grantedResources}
        availableResources={availableResources}
      />
    </div>
  );
}

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await requireAuth("INSTRUCTOR");

    const courses = await db.course.findMany({
      where: { instructorId: session.userId },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        modules: {
          select: {
            lessons: { select: { id: true } },
          },
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
        _count: { select: { enrollments: true } },
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
          enrolledAt: enr.enrolledAt,
          completedAt: enr.completedAt,
          completedLessons,
          totalLessons,
          progress,
          hasCertificate: !!cert,
          certificateCode: cert?.verificationCode ?? null,
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
        status: course.status,
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

    return NextResponse.json({ summary, courses: data });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Analytics error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

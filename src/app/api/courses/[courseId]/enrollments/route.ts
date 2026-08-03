import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { grantCourseAccess } from "@/lib/access-grants";

type Params = { courseId: string };

export async function GET(_req: Request, { params }: { params: Promise<Params> }) {
  try {
    const session = await requireAuth("ADMIN");
    const { courseId } = await params;

    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course || course.instructorId !== session.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const enrollments = await db.enrollment.findMany({
      where: { courseId },
      include: {
        student: { select: { id: true, name: true, email: true } },
        lessonProgress: { select: { lessonId: true } },
      },
      orderBy: { enrolledAt: "desc" },
    });

    const totalLessons = await db.lesson.count({
      where: { module: { courseId } },
    });

    const result = enrollments.map((e) => ({
      id: e.id,
      enrolledAt: e.enrolledAt,
      completedAt: e.completedAt,
      student: e.student,
      progress:
        course.type === "SCORM"
          ? e.completedAt
            ? 100
            : 0
          : totalLessons > 0
            ? Math.round((e.lessonProgress.length / totalLessons) * 100)
            : 0,
      completedLessons: e.lessonProgress.length,
      totalLessons,
      scormStatus: e.scormStatus,
      scormScoreRaw: e.scormScoreRaw,
    }));

    return NextResponse.json({ data: result });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const session = await requireAuth("ADMIN");
    const { courseId } = await params;
    const body = await request.json();
    const { email } = body;

    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course || course.instructorId !== session.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const student = await db.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!student) {
      return NextResponse.json({ error: "No user found with that email" }, { status: 404 });
    }

    if (student.role !== "STAFF") {
      return NextResponse.json({ error: "That user is not a student" }, { status: 400 });
    }

    const existing = await db.enrollment.findUnique({
      where: { studentId_courseId: { studentId: student.id, courseId } },
    });
    if (existing) {
      return NextResponse.json({ error: "Staff member is already enrolled" }, { status: 409 });
    }

    const enrollment = await grantCourseAccess(courseId, student, course.title, { notify: true });

    return NextResponse.json({ data: { ...enrollment, student } }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

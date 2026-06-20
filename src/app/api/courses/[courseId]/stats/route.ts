import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { courseId: string };

export async function GET(_req: Request, { params }: { params: Promise<Params> }) {
  try {
    const session = await requireAuth("INSTRUCTOR");
    const { courseId } = await params;

    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course || course.instructorId !== session.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const enrollments = await db.enrollment.findMany({
      where: { courseId },
      select: { id: true, completedAt: true, enrolledAt: true },
    });

    const totalStudents = enrollments.length;
    const completedStudents = enrollments.filter((e) => e.completedAt).length;

    return NextResponse.json({
      data: {
        totalStudents,
        completedStudents,
        completionRate: totalStudents ? Math.round((completedStudents / totalStudents) * 100) : 0,
      },
    });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { courseId: string; enrollmentId: string };

export async function DELETE(_req: Request, { params }: { params: Promise<Params> }) {
  try {
    const session = await requireAuth("INSTRUCTOR");
    const { courseId, enrollmentId } = await params;

    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course || course.instructorId !== session.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const enrollment = await db.enrollment.findUnique({ where: { id: enrollmentId } });
    if (!enrollment || enrollment.courseId !== courseId) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    await db.enrollment.delete({ where: { id: enrollmentId } });

    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

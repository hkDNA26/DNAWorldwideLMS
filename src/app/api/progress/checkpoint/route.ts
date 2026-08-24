import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

// Records a sub-lesson checkpoint reached inside an EXTERNAL-content lesson (see
// Enrollment.externalCheckpoint). Ratchets forward only — an earlier or repeated
// checkpoint from the embedded app is a no-op.
export async function POST(request: Request) {
  try {
    const session = await requireAuth(["STAFF", "TENDER"]);
    const body = await request.json();
    const { lessonId, checkpoint } = body;

    if (!lessonId || typeof checkpoint !== "number" || checkpoint < 1) {
      return NextResponse.json({ error: "lessonId and a positive checkpoint number are required" }, { status: 400 });
    }

    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true },
    });
    if (!lesson || lesson.contentType !== "EXTERNAL") {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const enrollment = await db.enrollment.findFirst({
      where: { courseId: lesson.module.courseId, studentId: session.userId },
    });
    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
    }

    if (checkpoint <= enrollment.externalCheckpoint) {
      return NextResponse.json({ data: { externalCheckpoint: enrollment.externalCheckpoint } });
    }

    const updated = await db.enrollment.update({
      where: { id: enrollment.id },
      data: { externalCheckpoint: checkpoint },
      select: { externalCheckpoint: true },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Checkpoint error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

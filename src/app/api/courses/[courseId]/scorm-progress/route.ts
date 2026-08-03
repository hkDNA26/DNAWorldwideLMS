import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { markCourseComplete } from "@/lib/course-completion";

type Params = { courseId: string };

const SCORM_STATUS_VALUES = new Set(["NOT_ATTEMPTED", "INCOMPLETE", "COMPLETED", "PASSED", "FAILED", "BROWSED"]);

/** Seeds the SCORM runtime shim's Initialize call — lets a package resume
 * from where the learner left off (suspend_data/location) on relaunch. */
export async function GET(_req: Request, { params }: { params: Promise<Params> }) {
  try {
    const session = await requireAuth("STAFF");
    const { courseId } = await params;

    const enrollment = await db.enrollment.findFirst({
      where: { courseId, studentId: session.userId },
      select: {
        scormStatus: true,
        scormScoreRaw: true,
        scormScoreMin: true,
        scormScoreMax: true,
        scormSuspendData: true,
        scormLocation: true,
      },
    });
    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
    }

    return NextResponse.json({ data: enrollment });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("GET /api/courses/[courseId]/scorm-progress:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

/** Called by the SCORM runtime shim on Commit/LMSCommit and Terminate/LMSFinish. */
export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const session = await requireAuth("STAFF");
    const { courseId } = await params;
    const body = await request.json();

    const enrollment = await db.enrollment.findFirst({
      where: { courseId, studentId: session.userId },
    });
    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
    }

    const status = typeof body.status === "string" && SCORM_STATUS_VALUES.has(body.status) ? body.status : undefined;

    await db.enrollment.update({
      where: { id: enrollment.id },
      data: {
        ...(status !== undefined && { scormStatus: status }),
        ...(typeof body.scoreRaw === "number" && { scormScoreRaw: body.scoreRaw }),
        ...(typeof body.scoreMin === "number" && { scormScoreMin: body.scoreMin }),
        ...(typeof body.scoreMax === "number" && { scormScoreMax: body.scoreMax }),
        ...(typeof body.suspendData === "string" && { scormSuspendData: body.suspendData }),
        ...(typeof body.location === "string" && { scormLocation: body.location }),
        scormSessionUpdatedAt: new Date(),
      },
    });

    if ((status === "COMPLETED" || status === "PASSED") && !enrollment.completedAt) {
      await markCourseComplete(enrollment.id, session.userId, courseId);
    }

    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("POST /api/courses/[courseId]/scorm-progress:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

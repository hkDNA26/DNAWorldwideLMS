import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { extractScormPackage } from "@/lib/scorm/extract";

type Params = { courseId: string };

const MAX_SCORM_SIZE = 500 * 1024 * 1024;

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const session = await requireAuth("ADMIN");
    const { courseId } = await params;

    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course || course.instructorId !== session.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (course.type !== "SCORM") {
      return NextResponse.json({ error: "This course is not a SCORM course" }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith(".zip")) {
      return NextResponse.json({ error: "Please upload a .zip file" }, { status: 400 });
    }
    if (file.size > MAX_SCORM_SIZE) {
      return NextResponse.json({ error: "File too large (max 500MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extracted = await extractScormPackage(buffer, courseId);
    if (!extracted.success) {
      return NextResponse.json({ error: extracted.error }, { status: 400 });
    }

    const scormPackage = await db.scormPackage.upsert({
      where: { courseId },
      create: {
        courseId,
        version: extracted.data.version,
        entryPoint: extracted.data.entryPoint,
        extractedPath: extracted.data.extractedPath,
        originalFilename: file.name,
        manifestTitle: extracted.data.title,
      },
      update: {
        version: extracted.data.version,
        entryPoint: extracted.data.entryPoint,
        extractedPath: extracted.data.extractedPath,
        originalFilename: file.name,
        manifestTitle: extracted.data.title,
      },
    });

    return NextResponse.json({ data: scormPackage });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("POST /api/courses/[courseId]/scorm-package:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

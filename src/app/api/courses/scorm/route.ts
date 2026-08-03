import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { extractScormPackage, deleteScormFiles } from "@/lib/scorm/extract";

// SCORM exports are frequently video/image-heavy (Articulate/Captivate output),
// so this allows a much larger upload than the shared 100MB cap in storage.ts.
const MAX_SCORM_SIZE = 500 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const session = await requireAuth("ADMIN");

    const formData = await request.formData();
    const file = formData.get("file");
    const title = formData.get("title");
    const description = formData.get("description");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith(".zip")) {
      return NextResponse.json({ error: "Please upload a .zip file" }, { status: 400 });
    }
    if (file.size > MAX_SCORM_SIZE) {
      return NextResponse.json({ error: "File too large (max 500MB)" }, { status: 400 });
    }

    const course = await db.course.create({
      data: {
        title: title.trim(),
        description: typeof description === "string" ? description.trim() : "",
        type: "SCORM",
        instructorId: session.userId,
      },
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const extracted = await extractScormPackage(buffer, course.id);
    if (!extracted.success) {
      await deleteScormFiles(course.id);
      await db.course.delete({ where: { id: course.id } });
      return NextResponse.json({ error: extracted.error }, { status: 400 });
    }

    await db.scormPackage.create({
      data: {
        courseId: course.id,
        version: extracted.data.version,
        entryPoint: extracted.data.entryPoint,
        extractedPath: extracted.data.extractedPath,
        originalFilename: file.name,
        manifestTitle: extracted.data.title,
      },
    });

    return NextResponse.json({ data: { id: course.id } }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("POST /api/courses/scorm:", err);
    return NextResponse.json({ error: "Something went wrong while creating the course" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { buildCourseTemplateWorkbook } from "@/lib/course-import/template";

export async function GET() {
  try {
    await requireAuth("ADMIN");

    const buffer = await buildCourseTemplateWorkbook();

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="course-import-template.xlsx"',
      },
    });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Template download error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

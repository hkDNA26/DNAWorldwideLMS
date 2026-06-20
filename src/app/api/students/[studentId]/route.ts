import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { studentId: string };

export async function DELETE(_req: Request, { params }: { params: Promise<Params> }) {
  try {
    await requireAuth("INSTRUCTOR");
    const { studentId } = await params;

    const student = await db.user.findUnique({ where: { id: studentId } });
    if (!student || student.role !== "STUDENT") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    await db.user.delete({ where: { id: studentId } });

    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

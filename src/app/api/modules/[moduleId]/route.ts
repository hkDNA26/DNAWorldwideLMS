import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { moduleId: string };

export async function PATCH(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const session = await requireAuth("INSTRUCTOR");
    const { moduleId } = await params;
    const body = await request.json();

    const module = await db.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });
    if (!module || module.course.instructorId !== session.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await db.module.update({
      where: { id: moduleId },
      data: { ...(body.title !== undefined && { title: body.title }) },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<Params> }) {
  try {
    const session = await requireAuth("INSTRUCTOR");
    const { moduleId } = await params;

    const module = await db.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });
    if (!module || module.course.instructorId !== session.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.module.delete({ where: { id: moduleId } });

    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

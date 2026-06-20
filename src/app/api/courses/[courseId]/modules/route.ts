import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { courseId: string };

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const session = await requireAuth("INSTRUCTOR");
    const { courseId } = await params;
    const body = await request.json();

    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course || course.instructorId !== session.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const lastModule = await db.module.findFirst({
      where: { courseId },
      orderBy: { orderIndex: "desc" },
    });

    const module = await db.module.create({
      data: {
        courseId,
        title: body.title?.trim() || "New Module",
        orderIndex: (lastModule?.orderIndex ?? -1) + 1,
      },
    });

    return NextResponse.json({ data: module }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const session = await requireAuth("INSTRUCTOR");
    const { courseId } = await params;
    const body = await request.json(); // [{ id, orderIndex }]

    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course || course.instructorId !== session.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await Promise.all(
      body.map((m: { id: string; orderIndex: number }) =>
        db.module.update({ where: { id: m.id }, data: { orderIndex: m.orderIndex } })
      )
    );

    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

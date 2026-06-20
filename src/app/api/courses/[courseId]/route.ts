import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { courseId: string };

export async function GET(_req: Request, { params }: { params: Promise<Params> }) {
  try {
    const session = await requireAuth();
    const { courseId } = await params;

    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: { select: { name: true, email: true } },
        modules: {
          orderBy: { orderIndex: "asc" },
          include: {
            lessons: {
              orderBy: { orderIndex: "asc" },
              include: { quiz: { include: { questions: { include: { answerOptions: true }, orderBy: { orderIndex: "asc" } } } } },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (session.role === "STUDENT" && course.status === "DRAFT") {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (session.role === "INSTRUCTOR" && course.instructorId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ data: course });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const session = await requireAuth("INSTRUCTOR");
    const { courseId } = await params;
    const body = await request.json();

    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course || course.instructorId !== session.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await db.course.update({
      where: { id: courseId },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.coverImage !== undefined && { coverImage: body.coverImage }),
        ...(body.status !== undefined && { status: body.status }),
      },
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
    const { courseId } = await params;

    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course || course.instructorId !== session.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.course.delete({ where: { id: courseId } });

    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

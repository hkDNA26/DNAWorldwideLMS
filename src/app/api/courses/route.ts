import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    if (session.role === "INSTRUCTOR") {
      const courses = await db.course.findMany({
        where: {
          instructorId: session.userId,
          ...(status ? { status: status as "DRAFT" | "PUBLISHED" } : {}),
          ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
        },
        include: {
          _count: { select: { enrollments: true, modules: true } },
          modules: { include: { _count: { select: { lessons: true } } } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ data: courses });
    }

    // Students only see published courses
    const courses = await db.course.findMany({
      where: {
        status: "PUBLISHED",
        ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
      },
      include: {
        instructor: { select: { name: true } },
        _count: { select: { enrollments: true, modules: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: courses });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/courses:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth("INSTRUCTOR");
    const body = await request.json();
    const { title, description } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const course = await db.course.create({
      data: {
        title: title.trim(),
        description: description?.trim() || "",
        instructorId: session.userId,
      },
    });

    return NextResponse.json({ data: course }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("POST /api/courses:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

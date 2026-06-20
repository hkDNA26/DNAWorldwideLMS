import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DEFAULT_FIELDS } from "@/lib/certificate-defaults";

export async function GET() {
  try {
    const session = await requireAuth("INSTRUCTOR");
    const tpl = await db.certificateTemplate.findUnique({
      where: { instructorId: session.userId },
    });

    return NextResponse.json({
      data: tpl
        ? { imageUrl: tpl.imageUrl, fields: tpl.fields }
        : { imageUrl: null, fields: DEFAULT_FIELDS },
    });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAuth("INSTRUCTOR");
    const { imageUrl, fields } = await request.json();

    const tpl = await db.certificateTemplate.upsert({
      where: { instructorId: session.userId },
      create: { instructorId: session.userId, imageUrl: imageUrl ?? null, fields: fields ?? DEFAULT_FIELDS },
      update: { imageUrl: imageUrl ?? null, fields: fields ?? DEFAULT_FIELDS },
    });

    return NextResponse.json({ data: { imageUrl: tpl.imageUrl, fields: tpl.fields } });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

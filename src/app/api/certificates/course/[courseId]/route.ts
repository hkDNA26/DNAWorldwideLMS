import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { courseId: string };

export async function GET(_req: Request, { params }: { params: Promise<Params> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { courseId } = await params;

    const cert = await db.certificate.findUnique({
      where: { studentId_courseId: { studentId: session.userId, courseId } },
      select: { verificationCode: true, issuedAt: true },
    });

    if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ data: cert });
  } catch (err) {
    console.error("Certificate fetch error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

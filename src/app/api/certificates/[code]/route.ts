import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type Params = { code: string };

export async function GET(_req: Request, { params }: { params: Promise<Params> }) {
  try {
    const { code } = await params;

    const cert = await db.certificate.findUnique({
      where: { verificationCode: code },
      include: {
        student: { select: { name: true } },
        course: {
          select: {
            title: true,
            instructor: { select: { name: true } },
          },
        },
      },
    });

    if (!cert) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    return NextResponse.json({ data: cert });
  } catch (err) {
    console.error("Certificate lookup error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

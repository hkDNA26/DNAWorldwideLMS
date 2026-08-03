import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getResource } from "@/lib/resources";
import { grantResourceAccess } from "@/lib/access-grants";
import type { ResourceKey } from "@/generated/prisma/enums";

const VALID_KEYS: ResourceKey[] = ["DRUG_SEARCH", "ALCOHOL_CALCULATOR"];

export async function POST(request: Request) {
  try {
    await requireAuth("ADMIN");
    const body = await request.json();
    const { studentId, resource } = body as { studentId?: string; resource?: ResourceKey };

    if (!studentId || !resource || !VALID_KEYS.includes(resource)) {
      return NextResponse.json({ error: "studentId and a valid resource are required" }, { status: 400 });
    }

    const student = await db.user.findUnique({
      where: { id: studentId, role: "STAFF" },
      select: { id: true, name: true, email: true },
    });
    if (!student) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    const existing = await db.resourceAccess.findUnique({
      where: { userId_resource: { userId: studentId, resource } },
    });
    if (existing) {
      return NextResponse.json({ error: "Already has access to this resource" }, { status: 409 });
    }

    const access = await grantResourceAccess(resource, student, { notify: true });
    const def = getResource(resource);

    return NextResponse.json(
      { data: { id: access.id, key: access.resource, label: def.label, grantedAt: access.grantedAt } },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Grant resource access error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

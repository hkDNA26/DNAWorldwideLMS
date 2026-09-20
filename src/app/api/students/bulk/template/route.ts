import { requireAuth } from "@/lib/auth";
import { buildStaffTemplate } from "@/lib/staff-import/parse";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAuth("ADMIN");
    const buffer = await buildStaffTemplate();
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="staff-upload-template.xlsx"',
      },
    });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Staff template error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

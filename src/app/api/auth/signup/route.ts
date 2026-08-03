import { NextResponse } from "next/server";

// Disabled: this let anyone self-assign the ADMIN role with no approval step.
// Account creation now only happens via an admin, from the Staff section.
export async function POST() {
  return NextResponse.json(
    { error: "Open signup is disabled. Ask your admin to add your account." },
    { status: 410 }
  );
}

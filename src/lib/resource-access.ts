import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ResourceKey } from "@/generated/prisma/enums";

export type AccessState = "GRANTED" | "NONE";

export async function getResourceAccessMap(userId: string, role: "ADMIN" | "STAFF" | "TENDER") {
  if (role === "ADMIN") {
    return {
      DRUG_SEARCH: "GRANTED" as AccessState,
      ALCOHOL_CALCULATOR: "GRANTED" as AccessState,
    };
  }

  // Tender accounts get a fixed resource set (see the resources page) rather than
  // per-user grants — the Alcohol Unit Calculator is part of that set.
  if (role === "TENDER") {
    return {
      DRUG_SEARCH: "NONE" as AccessState,
      ALCOHOL_CALCULATOR: "GRANTED" as AccessState,
    };
  }

  const rows = await db.resourceAccess.findMany({
    where: { userId },
    select: { resource: true },
  });

  const map: Record<string, AccessState> = {
    DRUG_SEARCH: "NONE",
    ALCOHOL_CALCULATOR: "NONE",
  };
  for (const row of rows) {
    map[row.resource] = "GRANTED";
  }
  return map;
}

export async function requireResourceAccess(resource: ResourceKey) {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.role === "ADMIN") return session;

  // Tender accounts get a fixed resource set rather than per-user grants.
  if (session.role === "TENDER") {
    if (resource === "ALCOHOL_CALCULATOR") return session;
    redirect("/resources");
  }

  const access = await db.resourceAccess.findUnique({
    where: { userId_resource: { userId: session.userId, resource } },
  });

  if (!access) redirect("/resources");

  if (!access.firstAccessedAt) {
    await db.resourceAccess.update({
      where: { id: access.id },
      data: { firstAccessedAt: new Date() },
    });
  }

  return session;
}

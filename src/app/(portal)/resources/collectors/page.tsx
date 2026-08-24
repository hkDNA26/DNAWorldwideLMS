import { requireResourceAccess } from "@/lib/resource-access";
import { db } from "@/lib/db";
import { BackLink } from "@/components/portal/back-link";
import { CollectorsExplorer } from "@/components/portal/collectors-explorer";
import type { CollectorItem } from "@/lib/collectors";

export default async function CollectorsPage() {
  await requireResourceAccess("COLLECTORS");

  const rows = await db.collector.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      area: true,
      inTraining: true,
      employment: true,
      livesOutcode: true,
      covers: true,
      capabilities: true,
      avgAppTime: true,
      notes: true,
      photoUrl: true,
      lat: true,
      lng: true,
    },
  });
  const collectors = rows as CollectorItem[];

  return (
    <div>
      <BackLink href="/resources" label="Back to resources" />
      <div className="mb-8 animate-brand-fade-up">
        <h1 className="text-2xl font-bold text-ink">Collector Profiles</h1>
        <p className="text-ink-soft mt-1">
          Our sample collectors across the UK — filter by area or what they&apos;re trained in, or switch to the map.
        </p>
      </div>
      <CollectorsExplorer collectors={collectors} mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ""} />
    </div>
  );
}

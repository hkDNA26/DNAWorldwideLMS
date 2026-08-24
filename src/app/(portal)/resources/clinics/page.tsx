import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { BackLink } from "@/components/portal/back-link";
import { ClinicsExplorer } from "@/components/portal/clinics-explorer";
import type { ClinicItem } from "@/lib/clinics";

export default async function ClinicsPage() {
  const session = await getSession();
  if (!session) return null;

  const rows = await db.clinic.findMany({ orderBy: { sortOrder: "asc" } });
  const clinics: ClinicItem[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    city: r.city,
    country: r.country,
    region: r.region,
    address: r.address,
    contactName: r.contactName,
    email: r.email,
    phone: r.phone,
    whatsapp: r.whatsapp,
    photoUrl: r.photoUrl,
    lat: r.lat,
    lng: r.lng,
    additionalInfo: (r.additionalInfo as Record<string, string> | null) ?? null,
  }));

  return (
    <div>
      <BackLink href="/resources" label="Back to resources" />
      <div className="mb-8 animate-brand-fade-up">
        <h1 className="text-2xl font-bold text-ink">Global Clinic Locations</h1>
        <p className="text-ink-soft mt-1">
          Our partner clinics worldwide — filter by country or continent, or explore them on the map.
        </p>
      </div>
      <ClinicsExplorer clinics={clinics} mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ""} />
    </div>
  );
}

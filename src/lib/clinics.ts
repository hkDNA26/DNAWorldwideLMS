export interface ClinicItem {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  region: string | null;
  address: string | null;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  photoUrl: string | null;
  lat: number | null;
  lng: number | null;
  additionalInfo: Record<string, string> | null;
}

export type ClinicFilter = { type: "country" | "continent"; value: string } | null;

/** Build the autocomplete option list: every continent and country present, de-duped. */
export function buildFilterOptions(clinics: ClinicItem[]): { type: "continent" | "country"; value: string; count: number }[] {
  const continents = new Map<string, number>();
  const countries = new Map<string, number>();
  for (const c of clinics) {
    if (c.region) continents.set(c.region, (continents.get(c.region) ?? 0) + 1);
    if (c.country) countries.set(c.country, (countries.get(c.country) ?? 0) + 1);
  }
  const opts: { type: "continent" | "country"; value: string; count: number }[] = [];
  for (const [value, count] of [...continents].sort((a, b) => a[0].localeCompare(b[0]))) {
    opts.push({ type: "continent", value, count });
  }
  for (const [value, count] of [...countries].sort((a, b) => a[0].localeCompare(b[0]))) {
    opts.push({ type: "country", value, count });
  }
  return opts;
}

export function matchesFilter(clinic: ClinicItem, filter: ClinicFilter): boolean {
  if (!filter) return true;
  if (filter.type === "country") return clinic.country === filter.value;
  return clinic.region === filter.value;
}

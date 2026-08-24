import Link from "next/link";
import { ArrowRight, TestTubes } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getResourceAccessMap } from "@/lib/resource-access";
import { RESOURCES } from "@/lib/resources";
import { BackLink } from "@/components/portal/back-link";

interface Tile {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

export default async function ResourcesPage() {
  const session = await getSession();
  if (!session) return null;

  const access = await getResourceAccessMap(session.userId, session.role);
  const grantedTools = RESOURCES.filter((resource) => access[resource.key] === "GRANTED");

  // Sample Types is the one remaining always-on reference page; everything else in
  // RESOURCES (PDF libraries, Videos, Collectors, Clinics, Street Drug Search) is gated
  // and depends on per-user access grants.
  const libraryTiles: Tile[] = [
    {
      key: "SAMPLE_TYPES",
      label: "Suitable Sample Types for Alcohol Testing",
      description: "Which sample types suit excessive, abstinence and segmented testing when head hair isn't available.",
      icon: TestTubes,
      href: "/resources/sample-types",
    },
  ];
  const toolTiles: Tile[] = grantedTools.map((r) => ({
    key: r.key,
    label: r.label,
    description: r.description,
    icon: r.icon,
    href: r.href,
  }));
  // Tender accounts see a fixed, minimal resource set instead of the full staff library.
  const TENDER_TILE_KEYS = new Set(["VIDEOS", "STREET_DRUG_SEARCH", "ALCOHOL_CALCULATOR"]);
  const allTiles = [...libraryTiles, ...toolTiles];
  const tiles = session.role === "TENDER" ? allTiles.filter((t) => TENDER_TILE_KEYS.has(t.key)) : allTiles;

  return (
    <div>
      <BackLink href="/" label="Back to home" />
      <div className="mb-8 animate-brand-fade-up">
        <h1 className="text-2xl font-bold text-ink">Resources</h1>
        <p className="text-ink-soft mt-1">Staff booklets, newsletters and day-to-day tools.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {tiles.map((tile, i) => {
          const Icon = tile.icon;
          return (
            <Link
              key={tile.key}
              href={tile.href}
              className="group bg-white border border-line rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all animate-brand-card-in"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-brand-light flex items-center justify-center mb-4 group-hover:bg-brand group-hover:text-white text-brand transition-colors">
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="text-[15px] font-bold text-ink mb-1.5 flex items-center gap-2">
                {tile.label}
                <ArrowRight className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </h2>
              <p className="text-[13.5px] text-ink-soft leading-relaxed">{tile.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

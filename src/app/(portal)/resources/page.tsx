import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getResourceAccessMap } from "@/lib/resource-access";
import { RESOURCES } from "@/lib/resources";
import { PDF_CATEGORIES } from "@/lib/pdf-library";
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

  const access = await getResourceAccessMap(session.userId, session.role === "ADMIN");
  const grantedTools = RESOURCES.filter((resource) => access[resource.key] === "GRANTED");

  // PDF libraries (booklets, newsletters) are available to all staff; the gated
  // staff tools below them still depend on per-user access grants.
  const libraryTiles: Tile[] = PDF_CATEGORIES.map((c) => ({
    key: c.category,
    label: c.label,
    description: c.description,
    icon: c.icon,
    href: c.href,
  }));
  const toolTiles: Tile[] = grantedTools.map((r) => ({
    key: r.key,
    label: r.label,
    description: r.description,
    icon: r.icon,
    href: r.href,
  }));
  const tiles = [...libraryTiles, ...toolTiles];

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

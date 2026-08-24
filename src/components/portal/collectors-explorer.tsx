"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { LayoutGrid, Map as MapIcon, MapPin, Check } from "lucide-react";
import { FILTER_CAPABILITIES, capabilityLabel, type CollectorItem } from "@/lib/collectors";

const CollectorMap = dynamic(() => import("./collector-map").then((m) => m.CollectorMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-2xl border border-line bg-surface-2 flex items-center justify-center text-ink-faint text-sm">
      Loading map…
    </div>
  ),
});

export function CollectorsExplorer({
  collectors,
  mapboxToken,
}: {
  collectors: CollectorItem[];
  mapboxToken: string;
}) {
  const [view, setView] = useState<"tiles" | "map">("tiles");
  const [area, setArea] = useState<string>("all");
  const [caps, setCaps] = useState<Set<string>>(new Set());

  const areas = useMemo(() => {
    const seen: string[] = [];
    for (const c of collectors) if (!seen.includes(c.area)) seen.push(c.area);
    return seen;
  }, [collectors]);

  const filtered = useMemo(() => {
    return collectors.filter((c) => {
      if (area !== "all" && c.area !== area) return false;
      for (const cap of caps) if (!c.capabilities.includes(cap)) return false;
      return true;
    });
  }, [collectors, area, caps]);

  const mappedCount = filtered.filter((c) => c.lat != null).length;

  function toggleCap(cap: string) {
    setCaps((prev) => {
      const next = new Set(prev);
      if (next.has(cap)) next.delete(cap);
      else next.add(cap);
      return next;
    });
  }

  function clearAll() {
    setArea("all");
    setCaps(new Set());
  }

  const hasFilters = area !== "all" || caps.size > 0;

  return (
    <div>
      {/* View toggle + result count */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="inline-flex rounded-xl border border-line bg-surface p-1">
          <button
            type="button"
            onClick={() => setView("tiles")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              view === "tiles" ? "bg-brand text-white" : "text-ink-soft hover:text-ink"
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Tiles
          </button>
          <button
            type="button"
            onClick={() => setView("map")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              view === "map" ? "bg-brand text-white" : "text-ink-soft hover:text-ink"
            }`}
          >
            <MapIcon className="w-4 h-4" /> Map view
          </button>
        </div>
        <p className="text-[13px] text-ink-faint">
          {filtered.length} collector{filtered.length === 1 ? "" : "s"}
          {view === "map" && ` · ${mappedCount} on map`}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-line rounded-2xl p-4 mb-6 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-[13px] font-semibold text-ink-soft">Area</label>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="rounded-lg border border-line bg-surface text-ink text-[13px] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="all">All areas</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          {hasFilters && (
            <button type="button" onClick={clearAll} className="text-[12.5px] font-semibold text-brand hover:underline ml-auto">
              Clear filters
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] font-semibold text-ink-soft mr-1">Trained in</span>
          {FILTER_CAPABILITIES.map((cap) => {
            const on = caps.has(cap);
            return (
              <button
                key={cap}
                type="button"
                onClick={() => toggleCap(cap)}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12.5px] font-semibold border transition-colors ${
                  on ? "bg-brand text-white border-brand" : "bg-surface text-ink-soft border-line hover:border-brand hover:text-ink"
                }`}
              >
                {on && <Check className="w-3.5 h-3.5" />}
                {capabilityLabel(cap)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {view === "map" ? (
        <CollectorMap collectors={filtered} token={mapboxToken} />
      ) : filtered.length === 0 ? (
        <div className="bg-surface border border-line rounded-2xl p-8 text-center text-ink-faint text-sm">
          No collectors match those filters.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => (
            <CollectorCard key={c.id} c={c} delay={i * 40} />
          ))}
        </div>
      )}
    </div>
  );
}

function CollectorCard({ c, delay }: { c: CollectorItem; delay: number }) {
  return (
    <div
      className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm animate-brand-card-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="aspect-[4/3] bg-surface-2 relative">
        {c.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover object-top" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-dark to-brand" />
        )}
        {c.inTraining && (
          <span className="absolute top-2 left-2 text-[11px] font-semibold text-white bg-accent/90 rounded-full px-2 py-0.5">
            In training
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-[15px] font-bold text-ink leading-tight">{c.name}</p>
        <p className="text-[12.5px] text-ink-faint mt-1 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {c.area}
          {c.livesOutcode ? ` · ${c.livesOutcode}` : ""}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {c.capabilities.map((cap) => (
            <span key={cap} className="text-[11px] font-medium text-ink-soft bg-surface-2 border border-line rounded-full px-2 py-0.5">
              {capabilityLabel(cap)}
            </span>
          ))}
        </div>
        {c.covers && <p className="text-[12px] text-ink-faint mt-3 leading-relaxed">Covers: {c.covers}</p>}
      </div>
    </div>
  );
}

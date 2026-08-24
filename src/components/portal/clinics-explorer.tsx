"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { LayoutGrid, Map as MapIcon, MapPin, Search, X, ChevronDown, Globe2 } from "lucide-react";
import { buildFilterOptions, matchesFilter, type ClinicItem, type ClinicFilter } from "@/lib/clinics";

const ClinicMap = dynamic(() => import("./clinic-map").then((m) => m.ClinicMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-2xl border border-line bg-surface-2 flex items-center justify-center text-ink-faint text-sm">
      Loading map…
    </div>
  ),
});

export function ClinicsExplorer({ clinics, mapboxToken }: { clinics: ClinicItem[]; mapboxToken: string }) {
  const [view, setView] = useState<"tiles" | "map">("tiles");
  const [filter, setFilter] = useState<ClinicFilter>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const options = useMemo(() => buildFilterOptions(clinics), [clinics]);
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter((o) => !q || o.value.toLowerCase().includes(q)).slice(0, 40);
  }, [options, query]);

  const filtered = useMemo(() => clinics.filter((c) => matchesFilter(c, filter)), [clinics, filter]);
  const mappedCount = filtered.filter((c) => c.lat != null).length;

  // close the dropdown on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(o: { type: "continent" | "country"; value: string }) {
    setFilter({ type: o.type === "continent" ? "continent" : "country", value: o.value });
    setQuery(o.value);
    setOpen(false);
  }
  function clearFilter() {
    setFilter(null);
    setQuery("");
  }

  // when the map asks to view a clinic, switch to tiles and scroll/flash it
  function goToClinic(id: string) {
    setView("tiles");
    setHighlightId(id);
    setTimeout(() => setHighlightId(null), 2600);
  }

  // scroll to the highlighted card once the tile view has actually rendered
  useEffect(() => {
    if (view !== "tiles" || !highlightId) return;
    const el = document.getElementById(`clinic-${highlightId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [view, highlightId]);

  return (
    <div>
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
          {filtered.length} clinic{filtered.length === 1 ? "" : "s"}
          {view === "map" && ` · ${mappedCount} on map`}
        </p>
      </div>

      {/* Country / continent autocomplete */}
      <div className="bg-surface border border-line rounded-2xl p-4 mb-6">
        <div className="relative max-w-md" ref={boxRef}>
          <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 focus-within:ring-2 focus-within:ring-brand">
            <Search className="w-4 h-4 text-ink-faint shrink-0" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
                if (filter) setFilter(null);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Filter by country or continent…"
              className="w-full bg-transparent text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
            />
            {(filter || query) && (
              <button type="button" onClick={clearFilter} className="text-ink-faint hover:text-ink shrink-0" aria-label="Clear">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {open && suggestions.length > 0 && (
            <ul className="absolute z-20 mt-1 w-full max-h-72 overflow-auto rounded-xl border border-line bg-surface shadow-lg py-1">
              {suggestions.map((o) => (
                <li key={`${o.type}-${o.value}`}>
                  <button
                    type="button"
                    onClick={() => pick(o)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-[13.5px] text-ink hover:bg-surface-2"
                  >
                    {o.type === "continent" ? (
                      <Globe2 className="w-4 h-4 text-accent shrink-0" />
                    ) : (
                      <MapPin className="w-4 h-4 text-brand shrink-0" />
                    )}
                    <span className="flex-1">{o.value}</span>
                    <span className="text-[11px] uppercase tracking-wide text-ink-faint">{o.type}</span>
                    <span className="text-[11px] text-ink-faint">{o.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {view === "map" ? (
        <ClinicMap clinics={filtered} token={mapboxToken} onSelect={goToClinic} />
      ) : filtered.length === 0 ? (
        <div className="bg-surface border border-line rounded-2xl p-8 text-center text-ink-faint text-sm">
          No clinics match that filter.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => (
            <ClinicCard key={c.id} c={c} delay={i * 30} highlighted={highlightId === c.id} />
          ))}
        </div>
      )}
    </div>
  );
}

function ClinicCard({ c, delay, highlighted }: { c: ClinicItem; delay: number; highlighted: boolean }) {
  const info = c.additionalInfo ? Object.entries(c.additionalInfo).filter(([, v]) => v != null && String(v).trim()) : [];
  return (
    <div
      id={`clinic-${c.id}`}
      className={`bg-surface border rounded-2xl overflow-hidden shadow-sm animate-brand-card-in transition-shadow ${
        highlighted ? "border-brand ring-2 ring-brand" : "border-line"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="aspect-[3/2] bg-surface-2">
        {c.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-dark to-brand" />
        )}
      </div>
      <div className="p-4">
        <p className="text-[15px] font-bold text-ink leading-tight">{c.name}</p>
        <p className="text-[12.5px] text-ink-faint mt-1 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          {[c.city, c.country].filter(Boolean).join(", ") || "—"}
          {c.region ? ` · ${c.region}` : ""}
        </p>

        {(c.contactName || c.email || c.phone) && (
          <div className="mt-2.5 text-[12.5px] text-ink-soft space-y-0.5">
            {c.contactName && <p>{c.contactName}</p>}
            {c.email && <p className="truncate">{c.email}</p>}
            {c.phone && <p>{c.phone}</p>}
          </div>
        )}
        {c.address && <p className="text-[12px] text-ink-faint mt-2 whitespace-pre-line leading-relaxed">{c.address}</p>}

        {info.length > 0 && (
          <details className="mt-3 group">
            <summary className="flex items-center gap-1.5 cursor-pointer list-none text-[12.5px] font-semibold text-brand select-none">
              <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
              Additional info
            </summary>
            <dl className="mt-2 rounded-lg border border-line divide-y divide-line overflow-hidden">
              {info.map(([k, v]) => (
                <div key={k} className="px-3 py-1.5 grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-2">
                  <dt className="text-[11.5px] font-medium text-ink-faint break-words">{k}</dt>
                  <dd className="text-[11.5px] text-ink break-words whitespace-pre-line">{String(v)}</dd>
                </div>
              ))}
            </dl>
          </details>
        )}
      </div>
    </div>
  );
}

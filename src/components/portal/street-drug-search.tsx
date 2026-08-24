"use client";

import { useMemo, useState } from "react";
import { Search, AlertTriangle, Clock, PoundSterling, FlaskConical, Blend } from "lucide-react";
import { STREET_DRUGS, type StreetDrug } from "@/lib/street-drugs/data";

function matches(drug: StreetDrug, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return false;
  if (drug.clinicalName.toLowerCase().includes(needle)) return true;
  return drug.streetNames.some((s) => s.toLowerCase().includes(needle));
}

export function StreetDrugSearch() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<StreetDrug | null>(null);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return STREET_DRUGS.filter((d) => matches(d, query)).slice(0, 8);
  }, [query]);

  // Auto-select when there's exactly one unambiguous match.
  const active = selected ?? (suggestions.length === 1 ? suggestions[0] : null);

  function pick(d: StreetDrug) {
    setSelected(d);
    setQuery(d.streetNames[0]);
  }

  function onChange(v: string) {
    setQuery(v);
    setSelected(null);
  }

  return (
    <div>
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-faint" />
        <input
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type a street name — e.g. Monkey Dust, Charlie, Ket…"
          className="w-full h-14 rounded-2xl border border-line bg-white pl-12 pr-4 text-[16px] text-ink placeholder:text-ink-faint shadow-sm focus:outline-none focus:ring-2 focus:ring-brand"
          autoComplete="off"
        />
        {query && !selected && suggestions.length > 1 && (
          <ul className="absolute z-20 mt-2 w-full rounded-2xl border border-line bg-white shadow-lg py-1.5 max-h-80 overflow-auto">
            {suggestions.map((d) => (
              <li key={d.slug}>
                <button
                  type="button"
                  onClick={() => pick(d)}
                  className="w-full flex items-baseline gap-2 px-4 py-2.5 text-left hover:bg-paper transition-colors"
                >
                  <span className="text-[14px] font-semibold text-ink">
                    {d.streetNames.find((s) => s.toLowerCase().includes(query.trim().toLowerCase())) || d.streetNames[0]}
                  </span>
                  <span className="text-[12.5px] text-ink-faint">&rarr; {d.clinicalName}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {query && !selected && suggestions.length === 0 && (
          <div className="absolute z-20 mt-2 w-full rounded-2xl border border-line bg-white shadow-lg px-4 py-3 text-[13.5px] text-ink-faint">
            No match for &ldquo;{query}&rdquo;. Try a different spelling, or browse the full list below.
          </div>
        )}
      </div>

      {active && (
        <div className="mt-6 bg-white border border-line rounded-2xl shadow-sm overflow-hidden max-w-2xl animate-brand-card-in">
          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-56 aspect-video sm:aspect-auto shrink-0 bg-surface-2">
              {active.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={active.imageUrl} alt={active.clinicalName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand-dark to-brand grid place-items-center">
                  <FlaskConical className="w-10 h-10 text-white/60" />
                </div>
              )}
            </div>
            <div className="p-5 flex-1">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-brand">{active.classification}</p>
              <h2 className="text-[19px] font-bold text-ink mt-0.5">{active.clinicalName}</h2>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {active.streetNames.map((s) => (
                  <span key={s} className="text-[11.5px] font-medium text-ink-soft bg-surface-2 border border-line rounded-full px-2.5 py-0.5">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-line px-5 py-4 space-y-4">
            <div className="flex gap-2.5">
              <Clock className="w-4 h-4 text-ink-faint shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-semibold text-ink-faint uppercase tracking-wide">Duration of effects</p>
                <p className="text-[13.5px] text-ink mt-0.5">{active.durationOfEffects}</p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <AlertTriangle className="w-4 h-4 text-danger-ink shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-semibold text-danger-ink uppercase tracking-wide">Serious risks</p>
                <p className="text-[13.5px] text-ink mt-0.5 leading-relaxed">{active.risks}</p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <Blend className="w-4 h-4 text-ink-faint shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-semibold text-ink-faint uppercase tracking-wide">Commonly cut / mixed with</p>
                <p className="text-[13.5px] text-ink mt-0.5 leading-relaxed">{active.commonlyMixedWith}</p>
              </div>
            </div>
            {active.ukStreetPrice && (
              <div className="flex gap-2.5">
                <PoundSterling className="w-4 h-4 text-ink-faint shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12px] font-semibold text-ink-faint uppercase tracking-wide">Typical UK street price</p>
                  <p className="text-[13.5px] text-ink mt-0.5">{active.ukStreetPrice} (indicative — varies by region and purity)</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Browsable directory for when the exact street name isn't known */}
      <div className="mt-10">
        <h2 className="text-[13px] font-bold uppercase tracking-wide text-brand mb-3 flex items-center gap-2.5">
          <span className="inline-block w-[18px] h-[2px] bg-accent" />
          Browse all {STREET_DRUGS.length}
        </h2>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {STREET_DRUGS.map((d) => (
            <button
              key={d.slug}
              type="button"
              onClick={() => pick(d)}
              className={`text-left rounded-xl border p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                active?.slug === d.slug ? "border-brand bg-brand-light" : "border-line bg-white"
              }`}
            >
              <p className="text-[13.5px] font-bold text-ink truncate">{d.clinicalName}</p>
              <p className="text-[12px] text-ink-faint truncate mt-0.5">{d.streetNames.slice(0, 3).join(", ")}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

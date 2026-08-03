"use client";

import { useMemo, useState } from "react";
import { MEDICATIONS, type Medication } from "@/lib/drug-search/data";
import { includedInPanels } from "@/lib/drug-search/optimal-panels";
import { ToolCard } from "./panel-search";

function getSuggestions(query: string): Medication[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const starts: Medication[] = [];
  const contains: Medication[] = [];
  for (const m of MEDICATIONS) {
    const lower = m.brand.toLowerCase();
    const idx = lower.indexOf(q);
    if (idx === 0) starts.push(m);
    else if (idx > 0) contains.push(m);
  }
  starts.sort((a, b) => a.brand.length - b.brand.length);
  contains.sort((a, b) => a.brand.length - b.brand.length);
  return starts.concat(contains).slice(0, 8);
}

export function MedicationSearch() {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selected, setSelected] = useState<Medication | null>(null);

  const suggestions = useMemo(() => getSuggestions(query), [query]);
  const included = useMemo(() => (selected ? includedInPanels(selected.ingredient ?? "") : []), [selected]);

  function selectMedication(m: Medication) {
    setQuery(m.brand);
    setSelected(m);
    setShowSuggestions(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!showSuggestions) { setShowSuggestions(true); return; }
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) selectMedication(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  return (
    <ToolCard
      title="Medication Brand Search"
      hint="Start typing a brand name to find its active ingredient and which panels include it."
      footnote="If a medication isn't in the list, add it to your request notes for tox to review."
    >
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); setActiveIndex(-1); setSelected(null); }}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
          placeholder="e.g. Vyvanse, Subutex, Ambien…"
          className="w-full px-3.5 py-2.5 text-[14.5px] rounded-[9px] border-[1.5px] border-line bg-paper focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/15 focus:bg-white transition-colors"
        />
        {showSuggestions && query.trim() && (
          <ul className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border border-line rounded-[9px] shadow-lg list-none m-0 p-1.5 max-h-[280px] overflow-y-auto z-30">
            {suggestions.length === 0 && (
              <li className="text-ink-faint italic px-3 py-2 text-sm">No matching brand found</li>
            )}
            {suggestions.map((m, i) => (
              <li
                key={m.brand}
                onMouseDown={(e) => { e.preventDefault(); selectMedication(m); }}
                className={`px-3 py-2 rounded-lg text-sm cursor-pointer ${i === activeIndex ? "bg-brand-light" : "hover:bg-brand-light"}`}
              >
                {m.brand}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <div className="mt-3.5 bg-brand-light border border-brand-line rounded-[9px] p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide font-bold text-ink-faint mb-1">Active ingredient</p>
            <p className="text-[14px] font-semibold text-ink">{selected.ingredient || "Not found"}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide font-bold text-ink-faint mb-1">Included in</p>
            <p className="text-[14px] font-semibold text-ink">
              {included.length ? included.join(", ") : "No matching panels"}
            </p>
          </div>
        </div>
      )}
    </ToolCard>
  );
}

"use client";

import { useMemo, useRef, useState } from "react";
import { DRUG_LIST } from "@/lib/drug-search/data";
import { findCheapestCombo, type ActivePanel } from "@/lib/drug-search/optimal-panels";

function money(n: number) {
  return `£${n.toFixed(2)}`;
}

function titleCase(lowerToken: string) {
  const match = DRUG_LIST.find((d) => d.toLowerCase() === lowerToken);
  if (match) return match;
  return lowerToken.replace(/\b\w/g, (c) => c.toUpperCase());
}

function getSuggestions(query: string, already: Set<string>): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const starts: string[] = [];
  const contains: string[] = [];
  for (const d of DRUG_LIST) {
    const lower = d.toLowerCase();
    if (already.has(lower)) continue;
    const idx = lower.indexOf(q);
    if (idx === 0) starts.push(d);
    else if (idx > 0) contains.push(d);
  }
  starts.sort((a, b) => a.length - b.length);
  contains.sort((a, b) => a.length - b.length);
  return starts.concat(contains).slice(0, 8);
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-transparent text-brand font-bold">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function DrugChipSearch() {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const already = useMemo(() => new Set(selected.map((s) => s.toLowerCase())), [selected]);
  const suggestions = useMemo(() => getSuggestions(query, already), [query, already]);

  const result = useMemo(() => (selected.length > 0 ? findCheapestCombo(selected) : null), [selected]);

  function addDrug(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    if (!selected.some((s) => s.toLowerCase() === lower)) {
      setSelected((prev) => [...prev, trimmed]);
    }
    setQuery("");
    setShowSuggestions(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  function removeDrug(idx: number) {
    setSelected((prev) => prev.filter((_, i) => i !== idx));
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
      if (activeIndex >= 0 && suggestions[activeIndex]) addDrug(suggestions[activeIndex]);
      else if (query.trim()) addDrug(query);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    } else if (e.key === "Backspace" && query === "" && selected.length > 0) {
      setSelected((prev) => prev.slice(0, -1));
    } else if (e.key === ",") {
      if (query.trim()) { e.preventDefault(); addDrug(query); }
    }
  }

  return (
    <div>
      <section className="bg-white border border-line rounded-2xl p-6 shadow-sm">
        <label className="block text-[15px] font-bold text-ink mb-1">Which drugs need testing?</label>
        <p className="text-[13.5px] text-ink-soft leading-relaxed mb-4 max-w-[62ch]">
          Start typing a drug name and pick from the list, or press Enter to add it as-is. Add as many as you
          need — we&apos;ll find the cheapest way to cover them all.
        </p>

        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 p-2.5 border-[1.5px] border-line rounded-[9px] bg-paper focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/15 focus-within:bg-white transition-colors">
            {selected.map((drug, i) => (
              <span
                key={drug + i}
                className="inline-flex items-center gap-1.5 bg-brand-light text-brand-dark border border-brand-line rounded-full pl-3 pr-1.5 py-1 text-[13.5px] font-semibold"
              >
                {drug}
                <button
                  type="button"
                  onClick={() => removeDrug(i)}
                  aria-label={`Remove ${drug}`}
                  className="w-[18px] h-[18px] rounded-full bg-brand-dark/10 hover:bg-brand-dark/20 grid place-items-center text-[12px]"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); setActiveIndex(-1); }}
              onKeyDown={handleKeyDown}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
              placeholder="e.g. Cocaine, Ketamine, Diazepam…"
              className="flex-1 min-w-[160px] border-none outline-none bg-transparent text-[15px] px-1 py-1.5"
            />
          </div>

          {showSuggestions && query.trim() && (
            <ul className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border border-line rounded-[9px] shadow-lg list-none m-0 p-1.5 max-h-[280px] overflow-y-auto z-30">
              {suggestions.length === 0 && (
                <li className="text-ink-faint italic px-3 py-2 text-sm">
                  No matching drug — press Enter to search for &ldquo;{query.trim()}&rdquo; anyway
                </li>
              )}
              {suggestions.map((s, i) => (
                <li
                  key={s}
                  onMouseDown={(e) => { e.preventDefault(); addDrug(s); }}
                  className={`px-3 py-2 rounded-lg text-sm cursor-pointer ${i === activeIndex ? "bg-brand-light" : "hover:bg-brand-light"}`}
                >
                  <HighlightMatch text={s} query={query} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 min-h-[20px]">
          {selected.length > 0 ? (
            <button
              type="button"
              onClick={() => setSelected([])}
              className="text-ink-soft hover:text-danger-ink text-[13px] font-semibold underline underline-offset-2"
            >
              Clear all drugs
            </button>
          ) : <span />}
          <span className="text-xs text-ink-faint ml-auto">
            {selected.length > 0 ? `${selected.length} drug${selected.length === 1 ? "" : "s"} selected` : ""}
          </span>
        </div>
      </section>

      {!result && (
        <div className="text-center py-14 text-ink-faint">
          <div className="text-[34px] mb-2.5">🧪</div>
          <h2 className="text-[16px] text-ink-soft mb-1.5">No drugs added yet</h2>
          <p className="text-[13.5px]">Add one or more drugs above to see the cheapest panel combination and price.</p>
        </div>
      )}

      {result && <ResultsPanel result={result} />}

      <p className="mt-8 text-xs text-ink-faint text-center leading-relaxed">
        Prices shown are overview costs (inc. VAT). The cheapest full panel will still remain the cheapest
        option even when a request is segmented across multiple drugs.
      </p>
    </div>
  );
}

function ResultsPanel({ result }: { result: ReturnType<typeof findCheapestCombo> }) {
  const key = result.status === "ok" ? `ok-${result.price}-${result.combo.map((c) => c.name).join(",")}` : result.status;

  if (result.status === "missing" || result.status === "empty") {
    const missing = result.status === "missing" ? result.missing : [];
    return (
      <div className="mt-5">
        <div className="rounded-2xl p-5 md:p-6 text-white shadow-md" style={{ background: "linear-gradient(135deg, #7a231a, var(--color-danger-ink))" }}>
          <p className="text-xs uppercase tracking-wide opacity-80 mb-1">No coverage found</p>
          <p className="text-[28px] md:text-[34px] font-extrabold tracking-tight">—</p>
          <p className="text-sm opacity-90 mt-1.5 max-w-[46ch]">None of our panels test for these drugs.</p>
        </div>
        <div className="mt-3.5 bg-danger-bg border border-danger-line text-danger-ink rounded-[9px] px-4 py-3 text-[13.5px] leading-relaxed">
          <strong>Missing panels for:</strong> {missing.map(titleCase).join(", ")}
        </div>
      </div>
    );
  }

  const { combo, price, targetDrugs } = result;
  const coveredAnywhere = new Set<string>();
  combo.forEach((c) => c.covered.forEach((d) => coveredAnywhere.add(d)));
  const stillMissing = targetDrugs.filter((d) => !coveredAnywhere.has(d));
  const isWarn = stillMissing.length > 0;

  return (
    <div className="mt-5">
      <div
        key={key}
        className="rounded-2xl p-5 md:p-6 text-white shadow-md flex flex-wrap items-center justify-between gap-5 animate-summary-pulse"
        style={{
          background: isWarn
            ? "linear-gradient(135deg, #8a5a00, #b3781a)"
            : "linear-gradient(135deg, var(--color-brand-dark), var(--color-brand))",
        }}
      >
        <div>
          <p className="text-xs uppercase tracking-wide opacity-80 mb-1">Cheapest way to cover your search</p>
          <AnimatedPrice price={price} />
          <p className="text-sm opacity-90 mt-1.5">
            {combo.length} panel{combo.length === 1 ? "" : "s"} needed &middot; inc. VAT
          </p>
        </div>
        <div className="text-sm opacity-90 text-right leading-relaxed">
          {combo.map((c) => c.name).join(" + ")}
        </div>
      </div>

      <div className="grid gap-3 mt-4">
        {combo.map((c) => (
          <PanelResultCard key={c.name} panel={c} />
        ))}
        {isWarn && (
          <div className="bg-danger-bg border border-danger-line text-danger-ink rounded-[9px] px-4 py-3 text-[13.5px] leading-relaxed">
            <strong>Not covered by any panel:</strong> {stillMissing.map(titleCase).join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}

function AnimatedPrice({ price }: { price: number }) {
  // Renders the correct value immediately (never depends on requestAnimationFrame
  // actually firing, e.g. on a throttled/backgrounded tab) — the "pop in" is a
  // pure CSS animation on mount, keyed by parent so each new result restarts it.
  return (
    <p className="text-[28px] md:text-[34px] font-extrabold tracking-tight animate-price-in">
      {money(price)}
    </p>
  );
}

function PanelResultCard({ panel }: { panel: ActivePanel }) {
  return (
    <div className="bg-white border border-line rounded-[9px] p-4 md:p-[18px] shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15.5px] font-bold text-ink">{panel.name}</h3>
          {panel.isPerDrug && (
            <span className="inline-block text-[11px] font-bold uppercase tracking-wide text-brand bg-brand-light border border-brand-line rounded-full px-2 py-0.5 mt-0.5">
              Per-drug pricing
            </span>
          )}
        </div>
        <div className="text-[15px] font-bold text-brand-dark whitespace-nowrap">
          {panel.isPerDrug ? `${money(panel.price)} / drug` : money(panel.price)}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2.5">
        {panel.covered.map((d) => (
          <span key={d} className="text-[12.5px] font-semibold bg-line-soft text-ink-soft rounded-full px-2.5 py-1">
            {titleCase(d)}
          </span>
        ))}
      </div>
    </div>
  );
}

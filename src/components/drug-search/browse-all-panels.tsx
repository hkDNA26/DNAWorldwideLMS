"use client";

import { useState } from "react";
import { PANELS } from "@/lib/drug-search/data";

function money(n: number) {
  return `£${n.toFixed(2)}`;
}

export function BrowseAllPanels() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="mt-8">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-brand font-bold text-[13.5px] underline underline-offset-2 mb-4"
      >
        {open ? "Hide all panels" : "Browse all panels"}
      </button>

      {open && (
        <div className="grid gap-2.5">
          {PANELS.map((p) => {
            const isOpen = expanded === p.name;
            return (
              <div key={p.name} className="bg-white border border-line rounded-[9px] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : p.name)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-line-soft transition-colors text-left"
                >
                  <span className="text-[14.5px] font-bold text-ink">{p.name}</span>
                  <span className="flex items-center gap-2.5">
                    <span className="text-[13.5px] font-bold text-brand-dark whitespace-nowrap">
                      {money(p.price)}{p.isPerDrug ? " / drug" : ""}
                    </span>
                    <span className={`text-ink-faint text-xs transition-transform ${isOpen ? "rotate-90" : ""}`}>▶</span>
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-[13.5px] text-ink-soft leading-relaxed">
                    {p.groups.map((g, i) => (
                      <div key={i} className="mb-1.5">
                        {g.label && <span className="font-bold text-ink">{g.label}: </span>}
                        {g.drugs.join(", ")}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

"use client";

import { useState } from "react";
import { PANELS } from "@/lib/drug-search/data";

function money(n: number) {
  return `£${n.toFixed(2)}`;
}

export function PanelSearch() {
  const [selected, setSelected] = useState(PANELS[0]?.name ?? "");
  const panel = PANELS.find((p) => p.name === selected);

  return (
    <ToolCard title="Panel Search" titleSub="(Hair)" hint="Pick a panel to see exactly which drug groups it covers.">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="select-input"
      >
        {PANELS.map((p) => (
          <option key={p.name} value={p.name}>{p.name}</option>
        ))}
      </select>

      {panel && (
        <div className="mt-3.5 bg-brand-light border border-brand-line rounded-[9px] p-4">
          <p className="font-bold text-[14.5px] text-ink mb-2 flex items-center justify-between">
            {panel.name}
            <span className="text-brand-dark text-sm font-bold">
              {money(panel.price)}{panel.isPerDrug ? " / drug" : ""}
            </span>
          </p>
          <div className="space-y-1.5 text-[13.5px] text-ink-soft leading-relaxed">
            {panel.groups.map((g, i) => (
              <div key={i}>
                {g.label && <span className="font-bold text-ink">{g.label}: </span>}
                {g.drugs.join(", ")}
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolCard>
  );
}

export function ToolCard({
  title,
  titleSub,
  hint,
  footnote,
  children,
}: {
  title: string;
  titleSub?: string;
  hint: string;
  footnote?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-line rounded-2xl p-5 md:p-[22px] shadow-sm mb-4">
      <h2 className="text-[16px] font-bold text-ink mb-1">
        {title} {titleSub && <span className="font-medium text-ink-faint text-[13.5px]">{titleSub}</span>}
      </h2>
      <p className="text-[13.5px] text-ink-soft leading-relaxed mb-3.5">{hint}</p>
      {children}
      {footnote && <p className="mt-3 text-xs text-ink-faint">{footnote}</p>}
    </section>
  );
}

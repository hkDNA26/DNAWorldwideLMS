"use client";

import { useState } from "react";
import { BLOOD_PANELS, URINE_PANELS, QUESTION_SETS } from "@/lib/drug-search/data";
import { ToolCard } from "./panel-search";

export function BloodSearch() {
  const [selected, setSelected] = useState(BLOOD_PANELS[0]?.name ?? "");
  const item = BLOOD_PANELS.find((p) => p.name === selected);

  return (
    <ToolCard title="Blood Search" hint="Pick a blood test to see what it measures.">
      <select value={selected} onChange={(e) => setSelected(e.target.value)} className="select-input">
        {BLOOD_PANELS.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
      </select>
      {item && (
        <div className="mt-3.5 bg-brand-light border border-brand-line rounded-[9px] p-4">
          <p className="font-bold text-[14.5px] text-ink mb-1.5">{item.name}</p>
          <p className="text-[13.5px] text-ink-soft leading-relaxed whitespace-pre-line">{item.desc}</p>
        </div>
      )}
    </ToolCard>
  );
}

export function UrineSearch() {
  const [selected, setSelected] = useState(URINE_PANELS[0]?.name ?? "");
  const item = URINE_PANELS.find((p) => p.name === selected);

  return (
    <ToolCard title="Urine / Oral Fluid / Unknown Substance Search" hint="Pick a panel to see which drugs it covers.">
      <select value={selected} onChange={(e) => setSelected(e.target.value)} className="select-input">
        {URINE_PANELS.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
      </select>
      {item && (
        <div className="mt-3.5 bg-brand-light border border-brand-line rounded-[9px] p-4">
          <p className="font-bold text-[14.5px] text-ink mb-1.5">{item.name}</p>
          <p className="text-[13.5px] text-ink-soft leading-relaxed whitespace-pre-line">{item.desc}</p>
        </div>
      )}
    </ToolCard>
  );
}

export function QuestionSetSearch() {
  const [selected, setSelected] = useState(QUESTION_SETS[0]?.question ?? "");
  const item = QUESTION_SETS.find((q) => q.question === selected);

  return (
    <ToolCard title="Question Set Selection" hint="Pick a topic to see the standard guidance text.">
      <select value={selected} onChange={(e) => setSelected(e.target.value)} className="select-input">
        {QUESTION_SETS.map((q) => <option key={q.question} value={q.question}>{q.question}</option>)}
      </select>
      {item && (
        <div className="mt-3.5 bg-brand-light border border-brand-line rounded-[9px] p-4">
          <p className="text-[13.5px] text-ink-soft leading-relaxed whitespace-pre-line">{item.answer}</p>
        </div>
      )}
    </ToolCard>
  );
}

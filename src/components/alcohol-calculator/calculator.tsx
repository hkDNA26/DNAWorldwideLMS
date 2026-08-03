"use client";

import { useState } from "react";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { DRINK_TYPES, calculateUnits, WEEKLY_UNIT_GUIDELINE, type DrinkType } from "@/lib/alcohol-calculator/data";

interface LogEntry {
  id: string;
  drinkLabel: string;
  servingLabel: string;
  ml: number;
  abv: number;
  units: number;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function AlcoholCalculator() {
  const [selected, setSelected] = useState<DrinkType>(DRINK_TYPES[0]);
  const [servingIdx, setServingIdx] = useState(0);
  const [customMl, setCustomMl] = useState<number | null>(null);
  const [abv, setAbv] = useState(DRINK_TYPES[0].defaultAbv);
  const [log, setLog] = useState<LogEntry[]>([]);

  const ml = customMl ?? selected.servings[servingIdx]?.ml ?? selected.servings[0].ml;
  const units = calculateUnits(abv, ml);
  const sessionTotal = log.reduce((sum, e) => sum + e.units, 0);
  const guidelinePct = Math.min(100, (sessionTotal / WEEKLY_UNIT_GUIDELINE) * 100);
  const overGuideline = sessionTotal > WEEKLY_UNIT_GUIDELINE;

  function selectDrink(drink: DrinkType) {
    setSelected(drink);
    setServingIdx(0);
    setCustomMl(null);
    setAbv(drink.defaultAbv);
  }

  function addToLog() {
    const servingLabel = customMl != null ? `Custom (${customMl}ml)` : selected.servings[servingIdx].label;
    setLog((prev) => [
      { id: crypto.randomUUID(), drinkLabel: selected.label, servingLabel, ml, abv, units },
      ...prev,
    ]);
  }

  function removeFromLog(id: string) {
    setLog((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <h2 className="text-[13px] font-bold uppercase tracking-wide text-brand mb-3 flex items-center gap-2.5">
          <span className="inline-block w-[18px] h-[2px] bg-accent" />
          Choose a drink
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {DRINK_TYPES.map((drink, i) => {
            const Icon = drink.icon;
            const active = drink.key === selected.key;
            return (
              <button
                key={drink.key}
                type="button"
                onClick={() => selectDrink(drink)}
                className={`group flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all animate-brand-card-in ${
                  active
                    ? "border-brand bg-brand-light shadow-md -translate-y-0.5"
                    : "border-line bg-white hover:shadow-sm hover:-translate-y-0.5"
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span
                  className="grid place-items-center w-11 h-11 rounded-xl transition-transform group-hover:scale-105"
                  style={{ background: `${drink.color}22`, color: drink.color }}
                >
                  <Icon className="w-6 h-6" />
                </span>
                <span className="text-[12.5px] font-bold text-ink leading-tight">{drink.label}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-white border border-line rounded-2xl p-5 shadow-sm">
          <h3 className="text-[13px] font-bold uppercase tracking-wide text-brand mb-3">Serving size</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {selected.servings.map((serving, i) => (
              <button
                key={serving.label}
                type="button"
                onClick={() => {
                  setServingIdx(i);
                  setCustomMl(null);
                }}
                className={`text-[12.5px] font-semibold rounded-full px-3.5 py-1.5 border transition-colors ${
                  customMl == null && servingIdx === i
                    ? "bg-brand text-white border-brand"
                    : "bg-paper text-ink-soft border-line hover:border-brand-line"
                }`}
              >
                {serving.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <label className="block">
              <span className="block text-[12px] font-semibold text-ink-faint mb-1.5">Volume (ml)</span>
              <input
                type="number"
                min={1}
                value={ml}
                onChange={(e) => setCustomMl(Number(e.target.value) || 0)}
                className="w-full h-10 rounded-lg border border-line bg-paper px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </label>
            <label className="block">
              <span className="block text-[12px] font-semibold text-ink-faint mb-1.5">Strength (% ABV)</span>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={abv}
                onChange={(e) => setAbv(Number(e.target.value) || 0)}
                className="w-full h-10 rounded-lg border border-line bg-paper px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </label>
          </div>

          <div className="flex items-center justify-between gap-4 pt-4 border-t border-line-soft">
            <div>
              <p className="text-[12px] font-semibold text-ink-faint uppercase tracking-wide">Units</p>
              <p key={units} className="text-[28px] font-extrabold tracking-tight text-brand animate-price-in">
                {round1(units)}
              </p>
            </div>
            <button
              type="button"
              onClick={addToLog}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-accent hover:brightness-95 rounded-lg px-4 py-2.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add to log
            </button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-[13px] font-bold uppercase tracking-wide text-brand mb-3 flex items-center gap-2.5">
          <span className="inline-block w-[18px] h-[2px] bg-accent" />
          Session log
        </h2>

        <div className="bg-white border border-line rounded-2xl p-5 shadow-sm mb-4">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm font-semibold text-ink-soft">Total units</span>
            <span key={sessionTotal} className="text-2xl font-extrabold text-ink animate-price-in">
              {round1(sessionTotal)}
            </span>
          </div>
          <div className="h-2.5 bg-line-soft rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${overGuideline ? "bg-danger-ink" : "bg-accent"}`}
              style={{ width: `${guidelinePct}%` }}
            />
          </div>
          <p className="text-[12px] text-ink-faint">
            UK guideline: no more than {WEEKLY_UNIT_GUIDELINE} units a week, spread across 3+ days.
          </p>
          {overGuideline && (
            <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-danger-ink">
              <AlertTriangle className="w-3.5 h-3.5" />
              This session is over the weekly guideline.
            </p>
          )}
        </div>

        {log.length === 0 ? (
          <div className="bg-white border border-line rounded-2xl p-8 text-center text-ink-faint text-sm">
            No drinks logged yet — add one to start tracking.
          </div>
        ) : (
          <div className="grid gap-2">
            {log.map((entry) => (
              <div
                key={entry.id}
                className="bg-white border border-line rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm animate-brand-fade-up"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink text-sm truncate">{entry.drinkLabel}</p>
                  <p className="text-ink-faint text-xs">
                    {entry.servingLabel} &middot; {entry.abv}% ABV
                  </p>
                </div>
                <span className="text-sm font-bold text-brand shrink-0">{round1(entry.units)}u</span>
                <button
                  type="button"
                  onClick={() => removeFromLog(entry.id)}
                  className="shrink-0 text-ink-faint hover:text-danger-ink transition-colors"
                  aria-label="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

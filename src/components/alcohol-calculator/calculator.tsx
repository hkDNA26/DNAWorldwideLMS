"use client";

import { useState } from "react";
import { Plus, Minus, Trash2, AlertTriangle, Info, CheckCircle2, Mars, Venus, Sparkles } from "lucide-react";
import {
  DRINK_TYPES,
  calculateUnits,
  WEEKLY_UNIT_GUIDELINE,
  WHO_THRESHOLDS,
  WHO_MONTHLY_THRESHOLDS,
  MONTHLY_DAYS,
  whoLevel,
  type DrinkType,
  type Sex,
  type WhoLevel,
} from "@/lib/alcohol-calculator/data";

interface LogEntry {
  id: string;
  drinkLabel: string;
  servingLabel: string;
  ml: number;
  abv: number;
  quantity: number;
  units: number; // total units for the whole quantity
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function AlcoholCalculator() {
  const [selected, setSelected] = useState<DrinkType>(DRINK_TYPES[0]);
  const [servingIdx, setServingIdx] = useState(0);
  const [customMl, setCustomMl] = useState<number | null>(null);
  const [abv, setAbv] = useState(DRINK_TYPES[0].defaultAbv);
  const [quantity, setQuantity] = useState(1);
  const [log, setLog] = useState<LogEntry[]>([]);
  // Required before the calculator can be used; drives the WHO thresholds.
  const [sex, setSex] = useState<Sex | null>(null);

  const ml = customMl ?? selected.servings[servingIdx]?.ml ?? selected.servings[0].ml;
  const unitsEach = calculateUnits(abv, ml);
  const units = unitsEach * quantity; // total for the chosen quantity
  const sessionTotal = log.reduce((sum, e) => sum + e.units, 0);
  const guidelinePct = Math.min(100, (sessionTotal / WEEKLY_UNIT_GUIDELINE) * 100);
  const overGuideline = sessionTotal > WEEKLY_UNIT_GUIDELINE;

  // WHO daily consumption level for the logged total, by selected sex.
  const level = sex ? whoLevel(sessionTotal, sex) : "abstinence";
  const threshold = sex ? WHO_THRESHOLDS[sex] : WHO_THRESHOLDS.men;
  const sexLabel = sex === "women" ? "Female" : "Male";

  function selectDrink(drink: DrinkType) {
    setSelected(drink);
    setServingIdx(0);
    setCustomMl(null);
    setAbv(drink.defaultAbv);
    setQuantity(1);
  }

  function addToLog() {
    const servingLabel = customMl != null ? `Custom (${customMl}ml)` : selected.servings[servingIdx].label;
    setLog((prev) => [
      { id: crypto.randomUUID(), drinkLabel: selected.label, servingLabel, ml, abv, quantity, units },
      ...prev,
    ]);
    setQuantity(1);
  }

  function removeFromLog(id: string) {
    setLog((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <>
      {!sex ? (
        <div className="relative overflow-hidden rounded-3xl border border-line shadow-sm mb-6 bg-gradient-to-br from-brand-dark to-brand animate-brand-card-in">
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-14 w-72 h-72 rounded-full bg-accent/25 blur-3xl pointer-events-none" />
          <div className="relative px-6 py-12 sm:py-16 text-center">
            <div className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-white/70 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              UK Alcohol Unit Calculator
            </div>
            <h2 className="text-2xl sm:text-[28px] font-extrabold text-white mb-2">Who are you calculating for?</h2>
            <p className="text-white/70 text-[13.5px] mb-3 max-w-sm mx-auto leading-relaxed">
              WHO daily and monthly &ldquo;excessive&rdquo; thresholds differ by gender — select one to unlock the calculator.
            </p>
            <p className="text-white/50 text-[11.5px] mb-9 max-w-sm mx-auto leading-relaxed">
              Gender here means sex assigned at birth, used only as a population-level generalisation to narrow the
              applicable WHO thresholds — not a judgement about gender identity.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {(["men", "women"] as Sex[]).map((s) => {
                const Icon = s === "men" ? Mars : Venus;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSex(s)}
                    className="group w-full sm:w-52 rounded-2xl border-2 border-white/25 bg-white/10 backdrop-blur-sm p-7 flex flex-col items-center gap-3.5 transition-all duration-300 hover:bg-white hover:border-white hover:-translate-y-1.5 hover:shadow-2xl"
                  >
                    <span className="grid place-items-center w-16 h-16 rounded-full bg-white/15 text-white transition-all duration-300 group-hover:bg-brand-light group-hover:text-brand group-hover:scale-110">
                      <Icon className="w-8 h-8" />
                    </span>
                    <span className="text-white font-bold text-[16px] transition-colors group-hover:text-ink">
                      {s === "women" ? "Female" : "Male"}
                    </span>
                    <span className="text-white/60 text-[11.5px] transition-colors group-hover:text-ink-faint">
                      {WHO_THRESHOLDS[s].excessiveUnits} units/day threshold
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Compact confirmation bar — the sex can still be changed without losing the hero on first load */}
          <div className="mb-6 bg-white border border-line rounded-2xl p-4 flex items-center justify-between gap-3 animate-brand-fade-up">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-brand-light text-brand">
                {sex === "men" ? <Mars className="w-5 h-5" /> : <Venus className="w-5 h-5" />}
              </span>
              <div>
                <p className="text-[13.5px] font-bold text-ink">Calculating for {sexLabel}</p>
                <p className="text-[11.5px] text-ink-faint">
                  WHO excessive threshold: {threshold.excessiveUnits} units/day &middot;{" "}
                  {WHO_MONTHLY_THRESHOLDS[sex].excessiveUnits} units/month
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSex(null)}
              className="text-[12.5px] font-semibold text-brand hover:underline shrink-0"
            >
              Change
            </button>
          </div>

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

          <div className="flex items-end justify-between gap-4 pt-4 border-t border-line-soft flex-wrap">
            <div>
              <p className="text-[12px] font-semibold text-ink-faint uppercase tracking-wide">Units</p>
              <p key={units} className="text-[28px] font-extrabold tracking-tight text-brand animate-price-in leading-none">
                {round1(units)}
              </p>
              {quantity > 1 && (
                <p className="text-[11px] text-ink-faint mt-1">
                  {round1(unitsEach)} each &times; {quantity}
                </p>
              )}
            </div>
            <div className="flex items-end gap-3">
              <div>
                <span className="block text-[12px] font-semibold text-ink-faint mb-1.5">Quantity</span>
                <div className="flex items-center rounded-lg border border-line overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-10 grid place-items-center text-ink-soft hover:bg-paper transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                    className="w-12 h-10 text-center text-sm font-semibold bg-paper border-x border-line focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-10 grid place-items-center text-ink-soft hover:bg-paper transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={addToLog}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-accent hover:brightness-95 rounded-lg px-4 h-10 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
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

        {/* WHO daily consumption level for the logged total */}
        <div className="bg-white border border-line rounded-2xl p-5 shadow-sm mb-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-sm font-semibold text-ink-soft">WHO daily level</span>
            <span className="text-[12px] font-semibold text-ink-faint">{sexLabel} thresholds</span>
          </div>

          {level === "excessive" && (
            <div className="rounded-xl border border-danger-line bg-danger-bg px-4 py-3">
              <p className="flex items-center gap-2 text-[13.5px] font-bold text-danger-ink">
                <AlertTriangle className="w-4 h-4" /> Excessive
              </p>
              <p className="text-[12.5px] text-danger-ink mt-1">
                {round1(sessionTotal)} units reaches the WHO &ldquo;excessive&rdquo; level for {sex} ({threshold.excessiveUnits}{" "}
                units / {threshold.excessiveGrams}g ethanol per day).
              </p>
            </div>
          )}
          {level === "occasional" && (
            <div className="rounded-xl border border-warn-line bg-warn-bg px-4 py-3">
              <p className="flex items-center gap-2 text-[13.5px] font-bold text-warn-ink">
                <Info className="w-4 h-4" /> Occasional / social
              </p>
              <p className="text-[12.5px] text-warn-ink mt-1">
                {round1(sessionTotal)} units — below the WHO &ldquo;excessive&rdquo; level for {sex} ({threshold.excessiveUnits}{" "}
                units / {threshold.excessiveGrams}g per day).
              </p>
            </div>
          )}
          {level === "abstinence" && (
            <div className="rounded-xl border border-line bg-paper px-4 py-3">
              <p className="flex items-center gap-2 text-[13.5px] font-bold text-accent">
                <CheckCircle2 className="w-4 h-4" /> Abstinence
              </p>
              <p className="text-[12.5px] text-ink-faint mt-1">No alcohol logged.</p>
            </div>
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
                  <p className="font-semibold text-ink text-sm truncate">
                    {entry.quantity > 1 && <span className="text-brand">{entry.quantity} &times; </span>}
                    {entry.drinkLabel}
                  </p>
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

          <WhoGuidelinesTable level={level} sex={sex} />
        </>
      )}
    </>
  );
}

function WhoGuidelinesTable({ level, sex }: { level: WhoLevel; sex: Sex }) {
  const rows: { key: WhoLevel; label: string; men: string; women: string; period?: boolean }[] = [
    {
      key: "excessive",
      label: "Excessive (daily)",
      men: `${WHO_THRESHOLDS.men.excessiveGrams}g ethanol per day (${WHO_THRESHOLDS.men.excessiveUnits} units)`,
      women: `${WHO_THRESHOLDS.women.excessiveGrams}g ethanol per day (${WHO_THRESHOLDS.women.excessiveUnits} units)`,
    },
    {
      key: "occasional",
      label: "Occasional / Social (daily)",
      men: `<${WHO_THRESHOLDS.men.excessiveGrams}g ethanol per day (<${WHO_THRESHOLDS.men.excessiveUnits} units)`,
      women: `<${WHO_THRESHOLDS.women.excessiveGrams}g ethanol per day (<${WHO_THRESHOLDS.women.excessiveUnits} units)`,
    },
    {
      key: "excessive",
      label: `Excessive (monthly, ${MONTHLY_DAYS} days)`,
      men: `${WHO_MONTHLY_THRESHOLDS.men.excessiveGrams.toLocaleString()}g ethanol per month (${WHO_MONTHLY_THRESHOLDS.men.excessiveUnits} units)`,
      women: `${WHO_MONTHLY_THRESHOLDS.women.excessiveGrams.toLocaleString()}g ethanol per month (${WHO_MONTHLY_THRESHOLDS.women.excessiveUnits} units)`,
      period: true,
    },
    { key: "abstinence", label: "Abstinence", men: "No alcohol consumption", women: "No alcohol consumption" },
  ];
  return (
    <div className="mt-10">
      <h2 className="text-[15px] font-bold text-ink mb-3">WHO guidelines regarding alcohol consumption</h2>
      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="bg-accent text-white text-left">
              <th className="px-4 py-2.5 font-semibold">Consumption Level</th>
              <th className="px-4 py-2.5 font-semibold">Men</th>
              <th className="px-4 py-2.5 font-semibold">Women</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const active = r.key === level && !r.period;
              return (
                <tr key={r.label} className={`border-t border-line ${active ? "bg-brand-light" : "bg-surface"}`}>
                  <th className={`px-4 py-2.5 text-left font-semibold ${active ? "text-brand" : "text-ink"}`}>{r.label}</th>
                  <td className={`px-4 py-2.5 ${sex === "men" && active ? "font-bold text-ink" : "text-ink-soft"}`}>{r.men}</td>
                  <td className={`px-4 py-2.5 ${sex === "women" && active ? "font-bold text-ink" : "text-ink-soft"}`}>{r.women}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[12px] text-ink-faint mt-2">*According to the World Health Organization survey</p>
      <p className="text-[12px] text-ink-faint mt-1">
        &ldquo;Men&rdquo; and &ldquo;women&rdquo; here refer to sex assigned at birth, used only as a population-level
        generalisation to narrow the applicable WHO thresholds — not a judgement about gender identity.
      </p>
    </div>
  );
}

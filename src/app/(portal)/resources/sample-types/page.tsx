import { Check, X } from "lucide-react";
import { getSession } from "@/lib/auth";
import { BackLink } from "@/components/portal/back-link";

type Cell = { ok: boolean; note?: "*" | "**" };

const COLUMNS = ["Excessive", "Abstinence", "Segmented"] as const;

const ROWS: { sample: string; cells: [Cell, Cell, Cell] }[] = [
  { sample: "Head Hair", cells: [{ ok: true }, { ok: true }, { ok: true, note: "*" }] },
  { sample: "Beard Hair", cells: [{ ok: true }, { ok: true }, { ok: false }] },
  { sample: "Chest/Back Hair", cells: [{ ok: true }, { ok: true }, { ok: false }] },
  { sample: "Forearm Hair", cells: [{ ok: true }, { ok: true }, { ok: false }] },
  { sample: "Leg Hair", cells: [{ ok: true, note: "**" }, { ok: true }, { ok: false }] },
  { sample: "Pubic Hair", cells: [{ ok: false }, { ok: true }, { ok: false }] },
  { sample: "Underarm Hair", cells: [{ ok: false }, { ok: false }, { ok: false }] },
  { sample: "Fingernail Clippings", cells: [{ ok: true, note: "**" }, { ok: false }, { ok: false }] },
  { sample: "Toenail Clippings", cells: [{ ok: true, note: "**" }, { ok: false }, { ok: false }] },
];

function Mark({ cell }: { cell: Cell }) {
  return (
    <span className="inline-flex items-center gap-1">
      {cell.ok ? (
        <span className="grid place-items-center w-6 h-6 rounded-md bg-accent text-white">
          <Check className="w-4 h-4" strokeWidth={3} />
        </span>
      ) : (
        <X className="w-5 h-5 text-danger-ink" strokeWidth={3} />
      )}
      {cell.note && <span className="text-[12px] font-semibold text-ink-soft">{cell.note}</span>}
    </span>
  );
}

export default async function SampleTypesPage() {
  const session = await getSession();
  if (!session) return null;

  return (
    <div>
      <BackLink href="/resources" label="Back to resources" />
      <div className="mb-8 animate-brand-fade-up max-w-3xl">
        <h1 className="text-2xl font-bold text-ink">Suitable Sample Types for Alcohol Testing</h1>
        <p className="text-ink-soft mt-2 leading-relaxed">
          The following lists sample types that can be tested for excessive/abstinence alcohol consumption, as well as which
          samples should be considered a last resort. The aim of this is to give a clear recommendation to the collector or
          solicitor should head hair analysis not be available.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full text-[13.5px] border-collapse min-w-[560px]">
          <thead>
            <tr className="bg-accent text-white text-left">
              <th className="px-4 py-3 font-semibold">Sample Type / Alcohol Testing</th>
              {COLUMNS.map((c) => (
                <th key={c} className="px-4 py-3 font-semibold text-center">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={row.sample} className={`border-t border-line ${i % 2 === 0 ? "bg-surface" : "bg-surface-2"}`}>
                <th className="px-4 py-2.5 text-left font-bold text-ink">{row.sample}</th>
                {row.cells.map((cell, j) => (
                  <td key={j} className="px-4 py-2.5 text-center">
                    <span className="inline-flex justify-center w-full">
                      <Mark cell={cell} />
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-[13px] text-ink-soft italic space-y-0.5">
        <p>*Overview testing must be done alongside</p>
        <p>**Other samples preferred</p>
      </div>
    </div>
  );
}

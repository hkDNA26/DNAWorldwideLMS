"use client";

import { useState } from "react";
import { Wrench, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";

interface ResourceUsage {
  key: string;
  label: string;
  granted: number;
  opened: number;
  totalOpens: number;
  lastAccessedAt: string | null;
  neverOpened: { name: string; email: string }[];
}

function formatDate(iso: string | null) {
  if (!iso) return "never";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function ResourceUsagePanel({ resources }: { resources: ResourceUsage[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (resources.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-ink">Resource usage</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Who has been given each staff resource, and whether they&rsquo;ve actually opened it.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="hidden sm:grid grid-cols-12 gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          <div className="col-span-5">Resource</div>
          <div className="col-span-2 text-center">Granted</div>
          <div className="col-span-2 text-center">Opened it</div>
          <div className="col-span-1 text-center">Opens</div>
          <div className="col-span-2 text-right">Last used</div>
        </div>

        <div className="divide-y divide-slate-100">
          {resources.map((r) => {
            const pct = r.granted > 0 ? Math.round((r.opened / r.granted) * 100) : 0;
            const isOpen = expanded === r.key;
            const hasUnused = r.neverOpened.length > 0;

            return (
              <div key={r.key}>
                <div className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center">
                  <div className="col-span-12 sm:col-span-5 flex items-center gap-2.5 min-w-0">
                    <Wrench className="h-4 w-4 text-slate-300 shrink-0" />
                    <span className="text-sm font-medium text-slate-900 truncate">{r.label}</span>
                  </div>

                  <div className="col-span-4 sm:col-span-2 sm:text-center">
                    <span className="text-sm text-slate-700">{r.granted}</span>
                    <span className="sm:hidden text-xs text-slate-400"> granted</span>
                  </div>

                  <div className="col-span-4 sm:col-span-2 sm:text-center">
                    <span className={`text-sm font-semibold ${pct === 0 ? "text-amber-600" : "text-slate-900"}`}>
                      {r.opened}
                    </span>
                    <span className="text-xs text-slate-400"> ({pct}%)</span>
                  </div>

                  <div className="col-span-4 sm:col-span-1 sm:text-center text-sm text-slate-600">
                    {r.totalOpens}
                  </div>

                  <div className="col-span-12 sm:col-span-2 sm:text-right text-xs text-slate-500">
                    {formatDate(r.lastAccessedAt)}
                  </div>
                </div>

                {hasUnused && (
                  <div className="px-5 pb-3 -mt-1">
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : r.key)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-800"
                    >
                      {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {r.neverOpened.length} {r.neverOpened.length === 1 ? "person has" : "people have"} never opened this
                    </button>
                    {isOpen && (
                      <ul className="mt-2 ml-6 space-y-1">
                        {r.neverOpened.map((p) => (
                          <li key={p.email} className="text-xs text-slate-600">
                            {p.name} <span className="text-slate-400">· {p.email}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-2">
        Counts opens by staff with an explicit grant. Admin and tender accounts reach resources through their role
        rather than a grant, so they aren&rsquo;t counted here.
      </p>
    </div>
  );
}

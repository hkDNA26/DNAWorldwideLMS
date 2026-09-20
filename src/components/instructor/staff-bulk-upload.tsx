"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { RESOURCES } from "@/lib/resources";
import type { ResourceKey } from "@/generated/prisma/enums";
import {
  FileSpreadsheet, Download, Upload, X, CheckCircle2, AlertTriangle, Users,
} from "lucide-react";

interface Course { id: string; title: string; status: string }
interface Organization { id: string; name: string }

interface Person { name: string; email: string }
interface Skipped extends Person { reason: string }
interface Problem { row: number; value: string; reason: string }

interface Summary {
  preview: boolean;
  willCreate: Person[];
  skipped: Skipped[];
  problems: Problem[];
  courses: string[];
  resources: string[];
  sendInvites: boolean;
  role: string;
  created?: Person[];
  failed?: Skipped[];
}

export function StaffBulkUpload({
  courses,
  organizations,
  onDone,
}: {
  courses: Course[];
  organizations: Organization[];
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState<"STAFF" | "TENDER">("STAFF");
  const [organizationId, setOrganizationId] = useState("");
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [resourceKeys, setResourceKeys] = useState<ResourceKey[]>([]);
  const [sendInvites, setSendInvites] = useState(true);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const reset = () => {
    setFile(null);
    setSummary(null);
    setErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const close = () => { setOpen(false); reset(); };

  const toggle = <T,>(list: T[], value: T, set: (v: T[]) => void) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  async function submit(commit: boolean) {
    if (!file) return;
    setBusy(true);
    setErrors([]);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("commit", String(commit));
      form.append("sendInvites", String(sendInvites));
      form.append("role", role);
      form.append("organizationId", organizationId);
      form.append("courseIds", JSON.stringify(courseIds));
      form.append("resourceKeys", JSON.stringify(resourceKeys));

      const res = await fetch("/api/students/bulk", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setErrors(data.errors || ["Upload failed"]); return; }

      setSummary(data.data);
      if (commit) {
        addToast(`${data.data.created?.length ?? 0} account(s) created`, "success");
        onDone();
      }
    } catch {
      setErrors(["Network error — please try again."]);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Users className="h-4 w-4 mr-2" />
        Bulk Upload
      </Button>
    );
  }

  const done = summary && !summary.preview;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="text-[15px] font-bold text-ink">Bulk upload staff</h2>
          <button onClick={close} className="p-1.5 rounded-lg text-ink-soft hover:bg-paper">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {!done && (
            <>
              <div className="flex items-center justify-between bg-paper/60 border border-line rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink">1. Get the template</p>
                  <p className="text-[13px] text-ink-faint">Two columns: Name and Email.</p>
                </div>
                <a href="/api/students/bulk/template" download>
                  <Button variant="outline" type="button">
                    <Download className="h-4 w-4 mr-2" />Template
                  </Button>
                </a>
              </div>

              <div>
                <p className="text-sm font-semibold text-ink mb-1.5">2. Choose your file</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  onChange={(e) => { setFile(e.target.files?.[0] ?? null); setSummary(null); }}
                  className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-brand-light file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand"
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-ink">3. Access for everyone in this file</p>

                <div className="flex gap-2">
                  {(["STAFF", "TENDER"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold border ${role === r ? "bg-brand text-white border-brand" : "border-line text-ink-soft hover:bg-paper"}`}
                    >
                      {r === "STAFF" ? "Staff" : "Tender"}
                    </button>
                  ))}
                </div>

                {role === "TENDER" && (
                  <select
                    value={organizationId}
                    onChange={(e) => setOrganizationId(e.target.value)}
                    className="w-full border border-line rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Select an organization…</option>
                    {organizations.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                )}

                <details className="border border-line rounded-lg px-3 py-2">
                  <summary className="text-[13px] font-semibold text-ink cursor-pointer">
                    Courses ({courseIds.length} selected)
                  </summary>
                  <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
                    {courses.map((c) => (
                      <label key={c.id} className="flex items-center gap-2 text-[13px] text-ink-soft">
                        <input type="checkbox" checked={courseIds.includes(c.id)}
                          onChange={() => toggle(courseIds, c.id, setCourseIds)} />
                        {c.title}
                      </label>
                    ))}
                  </div>
                </details>

                {role === "STAFF" && (
                  <details className="border border-line rounded-lg px-3 py-2">
                    <summary className="text-[13px] font-semibold text-ink cursor-pointer">
                      Resources ({resourceKeys.length} selected)
                    </summary>
                    <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
                      {RESOURCES.map((r) => (
                        <label key={r.key} className="flex items-center gap-2 text-[13px] text-ink-soft">
                          <input type="checkbox" checked={resourceKeys.includes(r.key)}
                            onChange={() => toggle(resourceKeys, r.key, setResourceKeys)} />
                          {r.label}
                        </label>
                      ))}
                    </div>
                  </details>
                )}

                <label className="flex items-start gap-2 text-[13px] text-ink-soft">
                  <input type="checkbox" checked={sendInvites} className="mt-0.5"
                    onChange={(e) => setSendInvites(e.target.checked)} />
                  <span>
                    Send invite emails
                    <span className="block text-ink-faint">
                      Spaced out to protect deliverability. Each link expires after 72 hours.
                    </span>
                  </span>
                </label>
              </div>
            </>
          )}

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
              {errors.map((e, i) => (
                <p key={i} className="text-[13px] text-red-700 flex gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />{e}
                </p>
              ))}
            </div>
          )}

          {summary && (
            <div className="border border-line rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-paper/60 border-b border-line">
                <p className="text-sm font-semibold text-ink">
                  {done ? "Done" : "Preview — nothing has been created yet"}
                </p>
              </div>
              <div className="px-4 py-3 space-y-2 text-[13px] max-h-72 overflow-y-auto">
                <Row icon="ok" label={done ? `${summary.created?.length ?? 0} created` : `${summary.willCreate.length} will be created`} />
                {summary.skipped.length > 0 && (
                  <Row icon="warn" label={`${summary.skipped.length} skipped — already have accounts`}
                    detail={summary.skipped.map((s) => s.email).join(", ")} />
                )}
                {summary.problems.length > 0 && (
                  <Row icon="warn" label={`${summary.problems.length} row(s) couldn't be read`}
                    detail={summary.problems.map((p) => `row ${p.row}: ${p.reason}`).join("; ")} />
                )}
                {summary.failed && summary.failed.length > 0 && (
                  <Row icon="warn" label={`${summary.failed.length} failed to create`}
                    detail={summary.failed.map((f) => `${f.email}: ${f.reason}`).join("; ")} />
                )}
                <p className="text-ink-faint pt-1">
                  Everyone gets: <strong>{summary.role === "STAFF" ? "Staff" : "Tender"}</strong>
                  {summary.courses.length > 0 && <> · {summary.courses.join(", ")}</>}
                  {summary.resources.length > 0 && <> · {summary.resources.join(", ")}</>}
                  {summary.sendInvites ? " · invites sent" : " · no invites"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-line flex justify-end gap-2">
          {done ? (
            <Button onClick={close}>Close</Button>
          ) : (
            <>
              <Button variant="outline" onClick={close} type="button">Cancel</Button>
              <Button onClick={() => submit(false)} loading={busy} disabled={!file} variant="outline" type="button">
                <Upload className="h-4 w-4 mr-2" />Preview
              </Button>
              <Button
                onClick={() => submit(true)}
                loading={busy}
                disabled={!summary || summary.willCreate.length === 0}
                type="button"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Create {summary?.willCreate.length ?? 0} account{summary?.willCreate.length === 1 ? "" : "s"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, detail }: { icon: "ok" | "warn"; label: string; detail?: string }) {
  return (
    <div className="flex gap-2">
      {icon === "ok"
        ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
        : <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />}
      <div className="min-w-0">
        <p className="text-ink font-medium">{label}</p>
        {detail && <p className="text-ink-faint break-words">{detail}</p>}
      </div>
    </div>
  );
}

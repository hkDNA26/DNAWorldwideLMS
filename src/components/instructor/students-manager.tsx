"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import { UserPlus, Trash2, Users, BookOpen, X, Mail, Lock, ChevronDown, ChevronRight, Building2, Upload } from "lucide-react";
import { formatDateShort } from "@/lib/utils";
import { RESOURCES } from "@/lib/resources";
import { StaffBulkUpload } from "./staff-bulk-upload";
import { TENDER_FIXED_ACCESS_SUMMARY } from "@/lib/tender";
import type { ResourceKey } from "@/generated/prisma/enums";

type Role = "STAFF" | "TENDER";

interface Organization {
  id: string;
  name: string;
  logoUrl: string | null;
}

interface Student {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string | null;
  organization: Organization | null;
  createdAt: string;
  _count: { enrollments: number };
}

interface Course {
  id: string;
  title: string;
  status: string;
}

interface StudentsManagerProps {
  initialStudents: Student[];
  courses: Course[];
  initialOrganizations: Organization[];
}

const emptyForm = { name: "", email: "", password: "" };

export function StudentsManager({ initialStudents, courses, initialOrganizations }: StudentsManagerProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});
  const [sendInvite, setSendInvite] = useState(true);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [selectedResourceKeys, setSelectedResourceKeys] = useState<ResourceKey[]>([]);
  const [role, setRole] = useState<Role>("STAFF");
  const [organizationId, setOrganizationId] = useState<string>("");
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgLogo, setNewOrgLogo] = useState<File | null>(null);
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [listFilter, setListFilter] = useState<"ALL" | Role>("ALL");
  const { addToast } = useToast();

  const validate = () => {
    const e: Partial<typeof emptyForm> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!sendInvite) {
      if (!form.password) e.password = "Password is required";
      else if (form.password.length < 8) e.password = "Must be at least 8 characters";
    }
    if (role === "TENDER" && !organizationId) {
      addToast("Pick or create an organization for this Tender account", "error");
      return false;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreateOrg = async () => {
    if (!newOrgName.trim()) {
      addToast("Organization name is required", "error");
      return;
    }
    setCreatingOrg(true);
    try {
      let logoUrl: string | undefined;
      if (newOrgLogo) {
        const fd = new FormData();
        fd.append("file", newOrgLogo);
        const uploadRes = await fetch("/api/upload?type=logo", { method: "POST", body: fd });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          addToast(uploadData.error || "Logo upload failed", "error");
          return;
        }
        logoUrl = uploadData.data.url;
      }
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newOrgName, logoUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || "Failed to create organization", "error");
        return;
      }
      setOrganizations((prev) => [...prev, data.data].sort((a, b) => a.name.localeCompare(b.name)));
      setOrganizationId(data.data.id);
      setNewOrgName("");
      setNewOrgLogo(null);
      addToast(`${data.data.name} created`, "success");
    } finally {
      setCreatingOrg(false);
    }
  };

  const toggleCourse = (id: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleResource = (key: ResourceKey) => {
    setSelectedResourceKeys((prev) =>
      prev.includes(key) ? prev.filter((r) => r !== key) : [...prev, key]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: sendInvite ? undefined : form.password,
          sendInvite,
          courseIds: selectedCourseIds,
          resourceKeys: selectedResourceKeys,
          role,
          organizationId: role === "TENDER" ? organizationId : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) setErrors({ email: data.error });
        else addToast(data.error || "Failed to create staff account", "error");
        return;
      }
      setStudents((prev) => [data.data, ...prev]);
      resetForm();
      if (data.warning) {
        addToast(data.warning, "error");
      } else {
        addToast(
          sendInvite
            ? `Invite sent to ${data.data.email}`
            : `Account created for ${data.data.name}`,
          "success"
        );
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (!res.ok) { addToast("Failed to delete staff account", "error"); return; }
      setStudents((prev) => prev.filter((s) => s.id !== id));
      addToast(`${name} deleted`, "success");
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setForm(emptyForm);
    setErrors({});
    setSelectedCourseIds([]);
    setSelectedResourceKeys([]);
    setSendInvite(true);
    setCourseDropdownOpen(false);
    setRole("STAFF");
    setOrganizationId("");
    setNewOrgName("");
    setNewOrgLogo(null);
  };

  const selectedCourseNames = courses
    .filter((c) => selectedCourseIds.includes(c.id))
    .map((c) => c.title);

  const filteredStudents = listFilter === "ALL" ? students : students.filter((s) => s.role === listFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {students.length} {students.length === 1 ? "account" : "accounts"} registered
        </p>
        <div className="flex items-center gap-2">
          <StaffBulkUpload
            courses={courses}
            organizations={organizations}
            // The list is held in local state seeded from server props, so a soft
            // refresh wouldn't repopulate it after a bulk create. A reload is the
            // predictable option for an action that can add fifty rows at once.
            onDone={() => window.location.reload()}
          />
          <Button onClick={() => { setShowForm((v) => !v); if (showForm) resetForm(); }}>
            {showForm ? <X className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
            {showForm ? "Cancel" : "Add Account"}
          </Button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-700">New Account</h2>

          <form onSubmit={handleCreate} className="space-y-4">
            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
              <div className="flex gap-2">
                {(["STAFF", "TENDER"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                      role === r
                        ? "border-brand bg-brand-light text-brand"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {r === "STAFF" ? "Staff" : "Tender"}
                  </button>
                ))}
              </div>
              {role === "TENDER" && (
                <p className="text-xs text-slate-500 mt-1.5">
                  Tender accounts automatically get: {TENDER_FIXED_ACCESS_SUMMARY.join(", ")}.
                </p>
              )}
            </div>

            {/* Name + Email */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Full name"
                placeholder="Jane Smith"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                error={errors.name}
              />
              <Input
                label="Email address"
                type="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                error={errors.email}
              />
            </div>

            {/* Invite toggle */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
              <button
                type="button"
                role="switch"
                aria-checked={sendInvite}
                onClick={() => { setSendInvite((v) => !v); setErrors((p) => ({ ...p, password: undefined })); }}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 mt-0.5 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                  sendInvite ? "bg-brand" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
                    sendInvite ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
              <div>
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5 cursor-pointer" onClick={() => setSendInvite((v) => !v)}>
                  <Mail className="h-3.5 w-3.5 text-brand" />
                  Send invitation email
                </label>
                <p className="text-xs text-slate-500 mt-0.5">
                  {sendInvite
                    ? "They will receive an email with a link to set their own password (expires in 72 hours)."
                    : "Set the password manually — they can change it after logging in."}
                </p>
              </div>
            </div>

            {/* Manual password (only when invite is off) */}
            {!sendInvite && (
              <div className="flex items-start gap-2">
                <Lock className="h-4 w-4 text-slate-400 mt-2.5 flex-shrink-0" />
                <div className="flex-1">
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    error={errors.password}
                  />
                </div>
              </div>
            )}

            {/* Course enrolment */}
            {role === "STAFF" && courses.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Enrol in courses <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCourseDropdownOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-left hover:border-brand transition-colors"
                  >
                    <span className={selectedCourseIds.length === 0 ? "text-slate-400" : "text-slate-900"}>
                      {selectedCourseIds.length === 0
                        ? "Select courses…"
                        : `${selectedCourseIds.length} course${selectedCourseIds.length > 1 ? "s" : ""} selected`}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${courseDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {courseDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                      {courses.map((course) => (
                        <label
                          key={course.id}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCourseIds.includes(course.id)}
                            onChange={() => toggleCourse(course.id)}
                            className="rounded accent-brand h-4 w-4 flex-shrink-0"
                          />
                          <span className="text-sm text-slate-700 flex-1 truncate">{course.title}</span>
                          {course.status === "DRAFT" && (
                            <span className="text-xs text-slate-400 flex-shrink-0">Draft</span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {selectedCourseNames.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedCourseNames.map((name) => (
                      <span key={name} className="inline-flex items-center gap-1 text-xs bg-brand/10 text-brand rounded-full px-2.5 py-0.5">
                        {name}
                        <button
                          type="button"
                          onClick={() => {
                            const id = courses.find((c) => c.title === name)?.id;
                            if (id) toggleCourse(id);
                          }}
                          className="hover:text-red-500 ml-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Resource access */}
            {role === "STAFF" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Grant resource access <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <div className="space-y-1.5">
                  {RESOURCES.map((resource) => (
                    <label
                      key={resource.key}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={selectedResourceKeys.includes(resource.key)}
                        onChange={() => toggleResource(resource.key)}
                        className="rounded accent-brand h-4 w-4 flex-shrink-0"
                      />
                      <span className="text-sm text-slate-700 flex-1 truncate">{resource.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Tender organization */}
            {role === "TENDER" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Organization</label>
                <select
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900"
                >
                  <option value="">Select an organization…</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>

                <div className="mt-3 p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
                  <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> Or create a new organization
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Organization name, e.g. Swansea Council"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    {newOrgLogo ? newOrgLogo.name : "Upload logo (optional, SVG/PNG/JPG)"}
                    <input
                      type="file"
                      accept="image/svg+xml,image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => setNewOrgLogo(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  <Button type="button" variant="outline" loading={creatingOrg} onClick={handleCreateOrg}>
                    Create organization
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button type="submit" loading={creating}>
                {sendInvite ? (
                  <><Mail className="h-4 w-4 mr-2" />Send Invite</>
                ) : (
                  <><UserPlus className="h-4 w-4 mr-2" />Create Account</>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Role filter */}
      <div className="flex gap-2">
        {(["ALL", "STAFF", "TENDER"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setListFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              listFilter === f ? "bg-brand text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {f === "ALL" ? `All (${students.length})` : f === "STAFF" ? "Staff" : "Tender"}
            {f !== "ALL" && ` (${students.filter((s) => s.role === f).length})`}
          </button>
        ))}
      </div>

      {/* Student list */}
      <div className="bg-white rounded-xl border border-slate-200">
        {filteredStudents.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No accounts yet.</p>
            <p className="text-xs text-slate-300 mt-1">Click "Add Staff" to create the first account.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredStudents.map((student, i) => (
              <li
                key={student.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-brand-light/40 transition-colors animate-brand-fade-up"
                style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
              >
                <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {student.role === "TENDER" && student.organization?.logoUrl ? (
                    <img src={student.organization.logoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-brand">
                      {student.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <Link href={`/instructor/students/${student.id}`} className="flex-1 min-w-0 group">
                  <p className="text-sm font-medium text-slate-900 truncate group-hover:text-brand transition-colors flex items-center gap-2">
                    {student.name}
                    {student.role === "TENDER" && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-700 bg-amber-100 rounded-full px-2 py-0.5 shrink-0">
                        Tender
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {student.email}
                    {student.organization && ` · ${student.organization.name}`}
                  </p>
                </Link>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
                    <BookOpen className="h-3.5 w-3.5" />
                    {student._count.enrollments} {student._count.enrollments === 1 ? "course" : "courses"}
                  </span>
                  <span className="hidden sm:block text-xs text-slate-300">
                    {formatDateShort(student.createdAt)}
                  </span>
                  <Link href={`/instructor/students/${student.id}`} className="text-slate-300 hover:text-brand transition-colors" title="View account">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(student.id, student.name)}
                    disabled={deletingId === student.id}
                    className="text-slate-300 hover:text-red-500 disabled:opacity-40 transition-colors"
                    title="Delete account"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

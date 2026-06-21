"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import { UserPlus, Trash2, Users, BookOpen, X, Mail, Lock, ChevronDown, ChevronRight } from "lucide-react";
import { formatDateShort } from "@/lib/utils";

interface Student {
  id: string;
  name: string;
  email: string;
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
}

const emptyForm = { name: "", email: "", password: "" };

export function StudentsManager({ initialStudents, courses }: StudentsManagerProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});
  const [sendInvite, setSendInvite] = useState(true);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
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
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const toggleCourse = (id: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
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
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) setErrors({ email: data.error });
        else addToast(data.error || "Failed to create student", "error");
        return;
      }
      setStudents((prev) => [data.data, ...prev]);
      setForm(emptyForm);
      setErrors({});
      setSelectedCourseIds([]);
      setShowForm(false);
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
      if (!res.ok) { addToast("Failed to delete student", "error"); return; }
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
    setSendInvite(true);
    setCourseDropdownOpen(false);
  };

  const selectedCourseNames = courses
    .filter((c) => selectedCourseIds.includes(c.id))
    .map((c) => c.title);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {students.length} {students.length === 1 ? "student" : "students"} registered
        </p>
        <Button onClick={() => { setShowForm((v) => !v); if (showForm) resetForm(); }}>
          {showForm ? <X className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
          {showForm ? "Cancel" : "Add Student"}
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-700">New Student Account</h2>

          <form onSubmit={handleCreate} className="space-y-4">
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
                  sendInvite ? "bg-[#1a3d8f]" : "bg-slate-300"
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
                  <Mail className="h-3.5 w-3.5 text-[#1a3d8f]" />
                  Send invitation email
                </label>
                <p className="text-xs text-slate-500 mt-0.5">
                  {sendInvite
                    ? "Student will receive an email with a link to set their own password (expires in 72 hours)."
                    : "Set the password manually — the student can change it after logging in."}
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
            {courses.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Enrol in courses <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCourseDropdownOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-left hover:border-[#1a3d8f] transition-colors"
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
                            className="rounded accent-[#1a3d8f] h-4 w-4 flex-shrink-0"
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
                      <span key={name} className="inline-flex items-center gap-1 text-xs bg-[#1a3d8f]/10 text-[#1a3d8f] rounded-full px-2.5 py-0.5">
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

      {/* Student list */}
      <div className="bg-white rounded-xl border border-slate-200">
        {students.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No students yet.</p>
            <p className="text-xs text-slate-300 mt-1">Click "Add Student" to create the first account.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {students.map((student) => (
              <li key={student.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-[#1a3d8f]">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <Link href={`/instructor/students/${student.id}`} className="flex-1 min-w-0 group">
                  <p className="text-sm font-medium text-slate-900 truncate group-hover:text-[#1a3d8f] transition-colors">{student.name}</p>
                  <p className="text-xs text-slate-400 truncate">{student.email}</p>
                </Link>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
                    <BookOpen className="h-3.5 w-3.5" />
                    {student._count.enrollments} {student._count.enrollments === 1 ? "course" : "courses"}
                  </span>
                  <span className="hidden sm:block text-xs text-slate-300">
                    {formatDateShort(student.createdAt)}
                  </span>
                  <Link href={`/instructor/students/${student.id}`} className="text-slate-300 hover:text-[#1a3d8f] transition-colors" title="View student">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(student.id, student.name)}
                    disabled={deletingId === student.id}
                    className="text-slate-300 hover:text-red-500 disabled:opacity-40 transition-colors"
                    title="Delete student"
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

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { UserPlus, Trash2, Users, BookOpen, X } from "lucide-react";
import { formatDateShort } from "@/lib/utils";

interface Student {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  _count: { enrollments: number };
}

interface StudentsManagerProps {
  initialStudents: Student[];
}

const emptyForm = { name: "", email: "", password: "" };

export function StudentsManager({ initialStudents }: StudentsManagerProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});
  const { addToast } = useToast();

  const validate = () => {
    const e: Partial<typeof emptyForm> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Must be at least 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
      setShowForm(false);
      addToast(`Account created for ${data.data.name}`, "success");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (!res.ok) {
        addToast("Failed to delete student", "error");
        return;
      }
      setStudents((prev) => prev.filter((s) => s.id !== id));
      addToast(`${name} deleted`, "success");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header action */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {students.length} {students.length === 1 ? "student" : "students"} registered
        </p>
        <Button onClick={() => { setShowForm((v) => !v); setErrors({}); setForm(emptyForm); }}>
          {showForm ? <X className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
          {showForm ? "Cancel" : "Add Student"}
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-5">New Student Account</h2>
          <form onSubmit={handleCreate} className="space-y-4">
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
            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              error={errors.password}
            />
            <div className="flex gap-3 pt-1">
              <Button type="submit" loading={creating}>
                Create Account
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setErrors({}); }}>
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
              <li key={student.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-indigo-600">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{student.name}</p>
                  <p className="text-xs text-slate-400 truncate">{student.email}</p>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
                    <BookOpen className="h-3.5 w-3.5" />
                    {student._count.enrollments} {student._count.enrollments === 1 ? "course" : "courses"}
                  </span>
                  <span className="hidden sm:block text-xs text-slate-300">
                    {formatDateShort(student.createdAt)}
                  </span>
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

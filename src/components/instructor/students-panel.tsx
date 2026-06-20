"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { UserPlus, Trash2, CheckCircle, Clock, Users } from "lucide-react";
import { formatDateShort } from "@/lib/utils";

interface EnrolledStudent {
  id: string;
  enrolledAt: string;
  completedAt: string | null;
  student: { id: string; name: string; email: string };
  progress: number;
  completedLessons: number;
  totalLessons: number;
}

interface StudentsPanelProps {
  courseId: string;
  initialEnrollments: EnrolledStudent[];
}

export function StudentsPanel({ courseId, initialEnrollments }: StudentsPanelProps) {
  const [enrollments, setEnrollments] = useState<EnrolledStudent[]>(initialEnrollments);
  const [email, setEmail] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setEnrolling(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || "Failed to enroll student", "error");
        return;
      }
      const newEnrollment: EnrolledStudent = {
        id: data.data.id,
        enrolledAt: data.data.enrolledAt,
        completedAt: null,
        student: data.data.student,
        progress: 0,
        completedLessons: 0,
        totalLessons: enrollments[0]?.totalLessons ?? 0,
      };
      setEnrollments((prev) => [newEnrollment, ...prev]);
      setEmail("");
      addToast(`${data.data.student.name} enrolled successfully`, "success");
    } finally {
      setEnrolling(false);
    }
  };

  const handleRemove = async (enrollmentId: string, studentName: string) => {
    setRemovingId(enrollmentId);
    try {
      const res = await fetch(`/api/courses/${courseId}/enrollments/${enrollmentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        addToast("Failed to remove student", "error");
        return;
      }
      setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
      addToast(`${studentName} removed from course`, "success");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Enroll form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-indigo-500" />
          Enroll a Student
        </h2>
        <form onSubmit={handleEnroll} className="flex gap-3">
          <div className="flex-1">
            <Input
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" loading={enrolling} className="flex-shrink-0">
            Enroll
          </Button>
        </form>
        <p className="text-xs text-slate-400 mt-2">
          The student must already have an account with this email.
        </p>
      </div>

      {/* Enrolled students list */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400" />
            Enrolled Students
          </h2>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {enrollments.length} {enrollments.length === 1 ? "student" : "students"}
          </span>
        </div>

        {enrollments.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No students enrolled yet.</p>
            <p className="text-xs text-slate-300 mt-1">Use the form above to add students.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {enrollments.map((enrollment) => (
              <li key={enrollment.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-indigo-600">
                    {enrollment.student.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {enrollment.student.name}
                    </p>
                    {enrollment.completedAt ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                        <CheckCircle className="h-3 w-3" />
                        Completed
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{enrollment.student.email}</p>

                  {enrollment.totalLessons > 0 && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 max-w-[120px]">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400">
                        {enrollment.completedLessons}/{enrollment.totalLessons} lessons
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    {formatDateShort(enrollment.enrolledAt)}
                  </span>
                  <button
                    onClick={() => handleRemove(enrollment.id, enrollment.student.name)}
                    disabled={removingId === enrollment.id}
                    className="text-slate-300 hover:text-red-500 disabled:opacity-40 transition-colors"
                    title="Remove student"
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

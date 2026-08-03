"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award, CheckCircle, Circle, ChevronDown, ChevronRight,
  Download, Mail, Trash2, Plus, BookOpen, User, X, Clock, Wrench, ShieldOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatDateShort } from "@/lib/utils";
import type { ResourceKey } from "@/generated/prisma/enums";

interface Lesson {
  id: string;
  title: string;
  contentType: string;
  isCompleted: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CourseEntry {
  enrollmentId: string;
  courseId: string;
  title: string;
  enrolledAt: string;
  completedAt: string | null;
  isCompleted: boolean;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  certificate: { code: string; issuedAt: string } | null;
  modules: Module[];
}

interface GrantedResource {
  id: string;
  key: ResourceKey;
  label: string;
  grantedAt: string;
}

interface Props {
  student: { id: string; name: string; email: string; createdAt: string };
  courses: CourseEntry[];
  availableCourses: { id: string; title: string }[];
  grantedResources: GrantedResource[];
  availableResources: { key: ResourceKey; label: string }[];
}

function ProgressRing({ pct, color }: { pct: number; color: string }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r={r} fill="none" stroke="#e2e8f0" strokeWidth="4" />
      <circle
        cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        strokeDashoffset={circ / 4}
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
      <text x="24" y="28" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1e293b">{pct}%</text>
    </svg>
  );
}

function CourseCard({
  course,
  onUnenroll,
}: {
  course: CourseEntry;
  onUnenroll: (enrollmentId: string, courseId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const ringColor = course.isCompleted ? "#10b981" : course.progress > 50 ? "var(--color-brand)" : "#f59e0b";

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-4">
        <ProgressRing pct={course.progress} color={ringColor} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-900 text-sm truncate">{course.title}</h3>
            {course.isCompleted && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                <CheckCircle className="h-3 w-3" />Completed
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-slate-400">
              {course.completedLessons}/{course.totalLessons} lessons
            </span>
            <span className="text-xs text-slate-300">·</span>
            <span className="text-xs text-slate-400">Enrolled {formatDateShort(course.enrolledAt)}</span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden w-48">
            <div
              className="h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${course.progress}%`, backgroundColor: ringColor }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {course.certificate && (
            <Link
              href={`/certificates/${course.certificate.code}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <Award className="h-3.5 w-3.5" />
              Certificate
            </Link>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Show lessons"
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          {confirming ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { onUnenroll(course.enrollmentId, course.courseId); setConfirming(false); }}
                className="text-xs font-medium text-red-600 hover:text-red-700 px-2 py-1 rounded bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
              >
                Remove
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove from course"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Lessons breakdown */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 py-3 bg-slate-50 space-y-3">
          {course.modules.map((mod) => (
            <div key={mod.id}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{mod.title}</p>
              <div className="space-y-1">
                {mod.lessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center gap-2 text-xs">
                    {lesson.isCompleted ? (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
                    )}
                    <span className={lesson.isCompleted ? "text-slate-600" : "text-slate-400"}>
                      {lesson.title}
                    </span>
                    <span className="text-slate-300 ml-auto">{lesson.contentType}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function StudentDetailClient({
  student,
  courses: initialCourses,
  availableCourses: initialAvailable,
  grantedResources: initialGrantedResources,
  availableResources: initialAvailableResources,
}: Props) {
  const [courses, setCourses] = useState(initialCourses);
  const [availableCourses, setAvailableCourses] = useState(initialAvailable);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [addingCourseId, setAddingCourseId] = useState<string | null>(null);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [resources, setResources] = useState(initialGrantedResources);
  const [availableResources, setAvailableResources] = useState(initialAvailableResources);
  const [showAddResource, setShowAddResource] = useState(false);
  const [grantingResourceKey, setGrantingResourceKey] = useState<ResourceKey | null>(null);
  const [revokingResourceId, setRevokingResourceId] = useState<string | null>(null);
  const { addToast } = useToast();
  const router = useRouter();

  const totalCompleted = courses.filter((c) => c.isCompleted).length;
  const certificates = courses.filter((c) => c.certificate !== null).length;

  const handleUnenroll = async (enrollmentId: string, courseId: string) => {
    const course = courses.find((c) => c.enrollmentId === enrollmentId);
    try {
      const res = await fetch(`/api/courses/${courseId}/enrollments/${enrollmentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      const removed = courses.find((c) => c.enrollmentId === enrollmentId);
      setCourses((prev) => prev.filter((c) => c.enrollmentId !== enrollmentId));
      if (removed) {
        setAvailableCourses((prev) => [...prev, { id: removed.courseId, title: removed.title }]
          .sort((a, b) => a.title.localeCompare(b.title)));
      }
      addToast("Staff member removed from course", "success");
    } catch {
      addToast("Failed to remove enrollment", "error");
    }
  };

  const handleAddCourse = async (courseId: string, courseTitle: string) => {
    setAddingCourseId(courseId);
    try {
      const res = await fetch(`/api/courses/${courseId}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: student.email }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      addToast(`Enrolled in ${courseTitle}`, "success");
      setAvailableCourses((prev) => prev.filter((c) => c.id !== courseId));
      setShowAddCourse(false);
      router.refresh();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to enrol", "error");
    } finally {
      setAddingCourseId(null);
    }
  };

  const handleGrantResource = async (key: ResourceKey, label: string) => {
    setGrantingResourceKey(key);
    try {
      const res = await fetch("/api/resource-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, resource: key }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResources((prev) => [...prev, data.data]);
      setAvailableResources((prev) => prev.filter((r) => r.key !== key));
      setShowAddResource(false);
      addToast(`Granted access to ${label}`, "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to grant access", "error");
    } finally {
      setGrantingResourceKey(null);
    }
  };

  const handleRevokeResource = async (id: string, key: ResourceKey, label: string) => {
    setRevokingResourceId(id);
    try {
      const res = await fetch(`/api/resource-access/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setResources((prev) => prev.filter((r) => r.id !== id));
      setAvailableResources((prev) => [...prev, { key, label }]);
      addToast(`Access to ${label} revoked`, "success");
    } catch {
      addToast("Failed to revoke access", "error");
    } finally {
      setRevokingResourceId(null);
    }
  };

  const handleSendReminder = async () => {
    setSendingReminder(true);
    try {
      const res = await fetch(`/api/instructor/students/${student.id}/remind`, { method: "POST" });
      if (!res.ok) throw new Error();
      addToast(`Reminder sent to ${student.email}`, "success");
    } catch {
      addToast("Failed to send reminder email", "error");
    } finally {
      setSendingReminder(false);
    }
  };

  return (
    <div>
      {/* Student header card */}
      <div
        className="rounded-2xl p-6 mb-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--color-brand-dark) 0%, var(--color-brand) 60%, var(--color-brand-bright) 100%)" }}
      >
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute right-20 bottom-0 w-24 h-24 rounded-full bg-white/5" />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold">{student.name}</h1>
              <p className="text-blue-300 text-sm">{student.email}</p>
              <p className="text-blue-400 text-xs mt-0.5">
                Staff since {formatDateShort(student.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {[
              { label: "Enrolled", value: courses.length },
              { label: "Completed", value: totalCompleted },
              { label: "Certificates", value: certificates },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-blue-300">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="relative flex gap-2 mt-5">
          <button
            onClick={handleSendReminder}
            disabled={sendingReminder || courses.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail className="h-4 w-4" />
            {sendingReminder ? "Sending…" : "Send Reminder Email"}
          </button>
        </div>
      </div>

      {/* Courses section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Enrolled Courses ({courses.length})
        </h2>
        {availableCourses.length > 0 && (
          <button
            onClick={() => setShowAddCourse((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-brand/30 text-brand hover:bg-brand/5 transition-colors"
          >
            {showAddCourse ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {showAddCourse ? "Cancel" : "Add to Course"}
          </button>
        )}
      </div>

      {/* Add course picker */}
      {showAddCourse && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
          <p className="text-xs font-medium text-slate-500 mb-3">Select a course to enrol this student in:</p>
          <div className="space-y-1">
            {availableCourses.map((c) => (
              <button
                key={c.id}
                onClick={() => handleAddCourse(c.id, c.title)}
                disabled={addingCourseId === c.id}
                className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 text-left transition-colors disabled:opacity-60"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-700">{c.title}</span>
                </div>
                {addingCourseId === c.id ? (
                  <span className="text-xs text-slate-400">Enrolling…</span>
                ) : (
                  <Plus className="h-4 w-4 text-slate-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Course cards */}
      {courses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <BookOpen className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Not enrolled in any courses yet.</p>
          {availableCourses.length > 0 && (
            <button
              onClick={() => setShowAddCourse(true)}
              className="mt-3 text-sm font-medium text-brand hover:underline"
            >
              Add to a course →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((c) => (
            <CourseCard key={c.enrollmentId} course={c} onUnenroll={handleUnenroll} />
          ))}
        </div>
      )}

      {/* Resources section */}
      <div className="flex items-center justify-between mb-4 mt-8">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Resource Access ({resources.length})
        </h2>
        {availableResources.length > 0 && (
          <button
            onClick={() => setShowAddResource((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-brand/30 text-brand hover:bg-brand/5 transition-colors"
          >
            {showAddResource ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {showAddResource ? "Cancel" : "Grant Access"}
          </button>
        )}
      </div>

      {showAddResource && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
          <p className="text-xs font-medium text-slate-500 mb-3">Select a resource to grant access to:</p>
          <div className="space-y-1">
            {availableResources.map((r) => (
              <button
                key={r.key}
                onClick={() => handleGrantResource(r.key, r.label)}
                disabled={grantingResourceKey === r.key}
                className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 text-left transition-colors disabled:opacity-60"
              >
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-700">{r.label}</span>
                </div>
                {grantingResourceKey === r.key ? (
                  <span className="text-xs text-slate-400">Granting…</span>
                ) : (
                  <Plus className="h-4 w-4 text-slate-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {resources.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl border border-slate-200">
          <Wrench className="h-8 w-8 text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No resource access granted yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {resources.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3"
            >
              <Wrench className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">{r.label}</p>
                <p className="text-xs text-slate-400">Granted {formatDateShort(r.grantedAt)}</p>
              </div>
              <button
                onClick={() => handleRevokeResource(r.id, r.key, r.label)}
                disabled={revokingResourceId === r.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Revoke access"
              >
                <ShieldOff className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

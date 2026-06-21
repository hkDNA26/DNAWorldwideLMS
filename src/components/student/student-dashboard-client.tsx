"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { BookOpen, Award, TrendingUp, ArrowRight, CheckCircle, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseEntry {
  enrollmentId: string;
  courseId: string;
  title: string;
  instructor: string;
  coverImage: string | null;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  isCompleted: boolean;
  nextLessonId: string | null;
  nextLessonTitle: string | null;
  enrolledAt: string;
  certificate: { code: string; issuedAt: string } | null;
}

interface Props {
  name: string;
  summary: { enrolled: number; completed: number; certificates: number; avgProgress: number };
  courses: CourseEntry[];
}

function useCountUp(target: number, delay = 0) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / 1000, 1);
        setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
        if (p < 1) raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(t); cancelAnimationFrame(raf.current); };
  }, [target, delay]);
  return val;
}

function Ring({ pct, color, size = 64 }: { pct: number; color: string; size?: number }) {
  const [go, setGo] = useState(false);
  const r = 26;
  const circ = 2 * Math.PI * r;
  useEffect(() => { const t = setTimeout(() => setGo(true), 400); return () => clearTimeout(t); }, []);
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <circle cx="32" cy="32" r={r} fill="none" stroke="#e2e8f0" strokeWidth="5" />
      <circle
        cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
        strokeDasharray={`${go ? (pct / 100) * circ : 0} ${circ}`}
        strokeDashoffset={circ / 4}
        style={{ transition: "stroke-dasharray 1.1s cubic-bezier(0.4,0,0.2,1)" }}
      />
      <text x="32" y="36" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1e293b">
        {pct}%
      </text>
    </svg>
  );
}

function StatCard({
  label, value, icon: Icon, gradient, suffix = "", delay = 0,
}: {
  label: string; value: number; icon: React.ElementType;
  gradient: string; suffix?: string; delay?: number;
}) {
  const [show, setShow] = useState(false);
  const count = useCountUp(show ? value : 0, delay + 80);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg"
      style={{
        background: gradient,
        transform: show ? "translateY(0) scale(1)" : "translateY(18px) scale(0.97)",
        opacity: show ? 1 : 0,
        transition: `transform 0.5s ease ${delay}ms, opacity 0.5s ease ${delay}ms`,
      }}
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -right-7 -bottom-7 w-32 h-32 rounded-full bg-white/10" />
      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
        <Icon className="h-4.5 w-4.5 text-white h-5 w-5" />
      </div>
      <p className="text-3xl font-bold tracking-tight">{count}{suffix}</p>
      <p className="text-xs mt-1 opacity-75">{label}</p>
    </div>
  );
}

function CourseCard({ course, index }: { course: CourseEntry; index: number }) {
  const [show, setShow] = useState(false);
  const [hovered, setHovered] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 350 + index * 90); return () => clearTimeout(t); }, [index]);

  const href = course.nextLessonId
    ? `/student/learn/${course.courseId}/${course.nextLessonId}`
    : `/student/learn/${course.courseId}/complete`;

  const ringColor = course.isCompleted ? "#10b981" : course.progress > 50 ? "#1a3d8f" : "#f59e0b";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: show ? hovered ? "translateY(-5px)" : "translateY(0)" : "translateY(28px)",
        opacity: show ? 1 : 0,
        transition: show
          ? "transform 0.22s ease, box-shadow 0.22s ease, opacity 0.4s ease"
          : `transform 0.55s ease ${350 + index * 90}ms, opacity 0.55s ease ${350 + index * 90}ms`,
        boxShadow: hovered ? "0 16px 48px rgba(26,61,143,0.14)" : "0 1px 4px rgba(0,0,0,0.06)",
        borderRadius: "1rem",
        background: "white",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
      }}
    >
      {/* Cover */}
      <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-[#1a3d8f]/10 to-[#2d5fc4]/20">
        {course.coverImage ? (
          <img
            src={course.coverImage}
            alt={course.title}
            className="w-full h-full object-cover"
            style={{ transform: hovered ? "scale(1.05)" : "scale(1)", transition: "transform 0.4s ease" }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen
              className="h-12 w-12 text-[#1a3d8f]/25"
              style={{ transform: hovered ? "scale(1.1)" : "scale(1)", transition: "transform 0.4s ease" }}
            />
          </div>
        )}

        {/* Completed ribbon */}
        {course.isCompleted && (
          <div className="absolute top-0 left-0 right-0 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-500/90 backdrop-blur-sm">
            <CheckCircle className="h-3.5 w-3.5 text-white" />
            <span className="text-xs font-semibold text-white">Completed</span>
          </div>
        )}

        {/* Progress ring */}
        <div className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-sm rounded-full p-0.5 shadow-md">
          <Ring pct={course.progress} color={ringColor} size={52} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3
          className="font-semibold text-slate-900 line-clamp-2 mb-0.5 transition-colors"
          style={{ color: hovered ? "#1a3d8f" : undefined }}
        >
          {course.title}
        </h3>
        <p className="text-xs text-slate-400 mb-3">by {course.instructor}</p>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>{course.completedLessons}/{course.totalLessons} lessons</span>
            <span className="font-medium" style={{ color: ringColor }}>{course.progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-1.5 rounded-full"
              style={{
                width: show ? `${course.progress}%` : "0%",
                backgroundColor: ringColor,
                transition: "width 1.2s cubic-bezier(0.4,0,0.2,1) 500ms",
              }}
            />
          </div>
        </div>

        {/* CTA */}
        {course.isCompleted ? (
          <Link
            href={`/student/learn/${course.courseId}/complete`}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
          >
            <Award className="h-3.5 w-3.5" />
            View Certificate
          </Link>
        ) : (
          <Link
            href={href}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-semibold text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #1a3d8f 0%, #2d5fc4 100%)",
              boxShadow: hovered ? "0 4px 16px rgba(26,61,143,0.35)" : "none",
            }}
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            {course.progress > 0 ? "Continue Learning" : "Start Course"}
          </Link>
        )}
      </div>
    </div>
  );
}

function HeroProgress({ summary }: { summary: Props["summary"] }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 200); return () => clearTimeout(t); }, []);

  if (summary.enrolled === 0) return null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 text-white mb-8"
      style={{
        background: "linear-gradient(135deg, #0d1f4e 0%, #1a3d8f 60%, #2d5fc4 100%)",
        transform: show ? "translateY(0)" : "translateY(20px)",
        opacity: show ? 1 : 0,
        transition: "transform 0.6s ease 150ms, opacity 0.6s ease 150ms",
        boxShadow: "0 8px 40px rgba(26,61,143,0.3)",
      }}
    >
      {/* Background blobs */}
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5" />
      <div className="absolute -right-8 -bottom-16 w-48 h-48 rounded-full bg-white/5" />
      <div className="absolute right-32 top-4 w-20 h-20 rounded-full bg-white/5" />

      <div className="relative flex items-center justify-between gap-6 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-medium text-blue-300 uppercase tracking-wide">Your Progress</span>
          </div>
          <p className="text-2xl font-bold mb-1">
            {summary.completed} of {summary.enrolled} courses complete
          </p>
          <p className="text-blue-300 text-sm">
            {summary.avgProgress}% average progress across all courses
          </p>
        </div>

        {/* Big ring */}
        <div className="flex-shrink-0">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42" fill="none" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${show ? (summary.avgProgress / 100) * 2 * Math.PI * 42 : 0} ${2 * Math.PI * 42}`}
              strokeDashoffset={2 * Math.PI * 42 / 4}
              style={{ transition: "stroke-dasharray 1.4s cubic-bezier(0.4,0,0.2,1) 300ms" }}
            />
            <text x="50" y="46" textAnchor="middle" fontSize="20" fontWeight="800" fill="white">{summary.avgProgress}%</text>
            <text x="50" y="62" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.6)">OVERALL</text>
          </svg>
        </div>
      </div>

      {/* Mini progress bar */}
      <div className="relative mt-5">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-1.5 rounded-full bg-amber-400"
            style={{
              width: show ? `${(summary.completed / summary.enrolled) * 100}%` : "0%",
              transition: "width 1.2s cubic-bezier(0.4,0,0.2,1) 500ms",
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-blue-300 mt-1.5">
          <span>{summary.completed} completed</span>
          <span>{summary.enrolled - summary.completed} in progress</span>
        </div>
      </div>
    </div>
  );
}

export function StudentDashboardClient({ name, summary, courses }: Props) {
  const [headerShow, setHeaderShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHeaderShow(true), 30); return () => clearTimeout(t); }, []);

  const firstName = name.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const inProgress = courses.filter((c) => !c.isCompleted && c.progress > 0);
  const notStarted = courses.filter((c) => c.progress === 0);
  const completed = courses.filter((c) => c.isCompleted);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div
        className="flex items-center justify-between mb-8"
        style={{
          transform: headerShow ? "translateY(0)" : "translateY(-14px)",
          opacity: headerShow ? 1 : 0,
          transition: "transform 0.45s ease, opacity 0.45s ease",
        }}
      >
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1a3d8f" }}>
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-slate-500 mt-1">
            {summary.enrolled === 0
              ? "You have no courses yet. Contact your instructor to get enrolled."
              : `You have ${courses.filter((c) => !c.isCompleted).length} course${courses.filter((c) => !c.isCompleted).length !== 1 ? "s" : ""} in progress.`}
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Courses Enrolled" value={summary.enrolled} icon={BookOpen}
          gradient="linear-gradient(135deg, #1a3d8f 0%, #2d5fc4 100%)" delay={0} />
        <StatCard label="Completed" value={summary.completed} icon={CheckCircle}
          gradient="linear-gradient(135deg, #059669 0%, #10b981 100%)" delay={70} />
        <StatCard label="Certificates" value={summary.certificates} icon={Award}
          gradient="linear-gradient(135deg, #b45309 0%, #d97706 100%)" delay={140} />
        <StatCard label="Avg Progress" value={summary.avgProgress} icon={TrendingUp}
          gradient="linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)" suffix="%" delay={210} />
      </div>

      {/* Hero progress bar */}
      <HeroProgress summary={summary} />

      {/* Course sections */}
      {courses.length === 0 ? (
        <div
          className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm"
          style={{ opacity: headerShow ? 1 : 0, transition: "opacity 0.5s ease 300ms" }}
        >
          <div className="w-16 h-16 bg-[#1a3d8f]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-[#1a3d8f]/40" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No courses yet</h3>
          <p className="text-slate-500 text-sm">Your instructor will enrol you in courses. Check back soon.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* In progress */}
          {inProgress.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-[#1a3d8f]" />
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Continue Learning</h2>
                <span className="text-xs text-slate-400">({inProgress.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {inProgress.map((c, i) => <CourseCard key={c.enrollmentId} course={c} index={i} />)}
              </div>
            </section>
          )}

          {/* Not started */}
          {notStarted.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Not Started</h2>
                <span className="text-xs text-slate-400">({notStarted.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {notStarted.map((c, i) => <CourseCard key={c.enrollmentId} course={c} index={inProgress.length + i} />)}
              </div>
            </section>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Completed</h2>
                <span className="text-xs text-slate-400">({completed.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {completed.map((c, i) => <CourseCard key={c.enrollmentId} course={c} index={inProgress.length + notStarted.length + i} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

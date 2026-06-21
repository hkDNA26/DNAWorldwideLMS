"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Plus, Users, BookOpen, TrendingUp, Award, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface CourseData {
  id: string;
  title: string;
  status: string;
  coverImage: string | null;
  enrollments: number;
  modules: number;
  totalLessons: number;
  completions: number;
  completionRate: number;
  createdAt: string;
}

interface Props {
  name: string;
  summary: {
    totalCourses: number;
    totalStudents: number;
    totalCompletions: number;
    avgCompletion: number;
  };
  trend: { week: string; enrollments: number }[];
  courses: CourseData[];
}

// Animated count-up
function useCountUp(target: number, delay = 0) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      const duration = 1100;
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setVal(Math.round(eased * target));
        if (t < 1) raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(timeout); cancelAnimationFrame(raf.current); };
  }, [target, delay]);
  return val;
}

// Animated SVG ring
function Ring({ pct, color, size = 72 }: { pct: number; color: string; size?: number }) {
  const [animated, setAnimated] = useState(false);
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = animated ? (pct / 100) * circ : 0;

  useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);

  return (
    <svg width={size} height={size} viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
      <circle
        cx="36" cy="36" r={r}
        fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ / 4}
        style={{ transition: "stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)" }}
      />
      <text x="36" y="40" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e293b">
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
  const [visible, setVisible] = useState(false);
  const count = useCountUp(visible ? value : 0, delay + 100);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg"
      style={{
        background: gradient,
        transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
        opacity: visible ? 1 : 0,
        transition: `transform 0.5s ease ${delay}ms, opacity 0.5s ease ${delay}ms`,
      }}
    >
      <div className="absolute -right-5 -top-5 w-28 h-28 rounded-full bg-white/10" />
      <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/10" />
      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <p className="text-4xl font-bold tracking-tight">{count}{suffix}</p>
      <p className="text-sm mt-1 opacity-75">{label}</p>
    </div>
  );
}

function CourseCard({ course, index }: { course: CourseData; index: number }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 400 + index * 80);
    return () => clearTimeout(t);
  }, [index]);

  const statusColor = course.status === "PUBLISHED"
    ? "bg-emerald-500"
    : "bg-slate-400";

  return (
    <div
      style={{
        transform: visible
          ? hovered ? "translateY(-4px)" : "translateY(0)"
          : "translateY(24px)",
        opacity: visible ? 1 : 0,
        transition: visible
          ? "transform 0.25s ease, box-shadow 0.25s ease, opacity 0.4s ease"
          : `transform 0.5s ease ${400 + index * 80}ms, opacity 0.5s ease ${400 + index * 80}ms`,
        boxShadow: hovered
          ? "0 12px 40px rgba(26,61,143,0.15)"
          : "0 1px 4px rgba(0,0,0,0.06)",
      }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover */}
      <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-[#1a3d8f]/10 to-[#2d5fc4]/20">
        {course.coverImage ? (
          <img
            src={course.coverImage}
            alt={course.title}
            className="w-full h-full object-cover"
            style={{ transform: hovered ? "scale(1.04)" : "scale(1)", transition: "transform 0.4s ease" }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen
              className="h-12 w-12 text-[#1a3d8f]/30"
              style={{ transform: hovered ? "scale(1.1)" : "scale(1)", transition: "transform 0.4s ease" }}
            />
          </div>
        )}
        {/* Status dot */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${statusColor}`} />
          <span className="text-xs font-medium text-white bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
            {course.status === "PUBLISHED" ? "Live" : "Draft"}
          </span>
        </div>
        {/* Completion ring overlay */}
        <div className="absolute bottom-3 right-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-0.5 shadow-md">
            <Ring
              pct={course.completionRate}
              color={course.completionRate === 100 ? "#10b981" : "#1a3d8f"}
              size={56}
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3
          className="font-semibold text-slate-900 line-clamp-2 mb-3 transition-colors"
          style={{ color: hovered ? "#1a3d8f" : undefined }}
        >
          {course.title}
        </h3>

        <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {course.enrollments} enrolled
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {course.modules} modules
          </span>
          {course.completions > 0 && (
            <span className="flex items-center gap-1 text-emerald-600">
              <Award className="h-3.5 w-3.5" />
              {course.completions} completed
            </span>
          )}
        </div>

        {/* Enrolment progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Completion rate</span>
            <span className="font-medium text-slate-600">{course.completionRate}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-1.5 rounded-full"
              style={{
                width: visible ? `${course.completionRate}%` : "0%",
                backgroundColor: course.completionRate === 100 ? "#10b981" : "#1a3d8f",
                transition: "width 1.2s cubic-bezier(0.4,0,0.2,1) 600ms",
              }}
            />
          </div>
        </div>

        <Link
          href={`/instructor/courses/${course.id}/builder`}
          className="flex items-center justify-center gap-1.5 w-full text-xs font-medium text-[#1a3d8f] border border-[#1a3d8f]/20 hover:bg-[#1a3d8f] hover:text-white rounded-xl py-2 transition-all"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Edit Course
        </Link>
      </div>
    </div>
  );
}

export function DashboardClient({ name, summary, trend, courses }: Props) {
  const [headerVisible, setHeaderVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHeaderVisible(true), 50); return () => clearTimeout(t); }, []);

  const maxTrend = Math.max(...trend.map((t) => t.enrollments), 1);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{
          transform: headerVisible ? "translateY(0)" : "translateY(-12px)",
          opacity: headerVisible ? 1 : 0,
          transition: "transform 0.4s ease, opacity 0.4s ease",
        }}
      >
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1a3d8f" }}>
            Welcome back, {name.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your courses today.</p>
        </div>
        <Button asChild>
          <Link href="/instructor/courses/new">
            <Plus className="h-4 w-4 mr-2" />
            New Course
          </Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Courses"
          value={summary.totalCourses}
          icon={BookOpen}
          gradient="linear-gradient(135deg, #1a3d8f 0%, #2d5fc4 100%)"
          delay={0}
        />
        <StatCard
          label="Total Students"
          value={summary.totalStudents}
          icon={Users}
          gradient="linear-gradient(135deg, #0f766e 0%, #0d9488 100%)"
          delay={80}
        />
        <StatCard
          label="Completions"
          value={summary.totalCompletions}
          icon={TrendingUp}
          gradient="linear-gradient(135deg, #059669 0%, #10b981 100%)"
          delay={160}
        />
        <StatCard
          label="Avg Completion"
          value={summary.avgCompletion}
          icon={Award}
          gradient="linear-gradient(135deg, #b45309 0%, #d97706 100%)"
          suffix="%"
          delay={240}
        />
      </div>

      {/* Trend chart + top course */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Enrolment Trend</h2>
              <p className="text-xs text-slate-400 mt-0.5">New enrolments over the last 8 weeks</p>
            </div>
            <span className="text-xs bg-[#1a3d8f]/10 text-[#1a3d8f] font-medium px-3 py-1 rounded-full">
              {trend.reduce((s, t) => s + t.enrollments, 0)} total
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a3d8f" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1a3d8f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  fontSize: 12,
                }}
                cursor={{ stroke: "#1a3d8f", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone"
                dataKey="enrollments"
                stroke="#1a3d8f"
                strokeWidth={2.5}
                fill="url(#enrollGrad)"
                dot={{ fill: "#1a3d8f", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#1a3d8f", strokeWidth: 2, stroke: "#fff" }}
                isAnimationActive
                animationDuration={1400}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick stats panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-slate-800">Overview</h2>

          <div className="flex-1 space-y-4">
            {/* Published vs draft */}
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Published courses</span>
                <span className="font-semibold text-slate-700">
                  {courses.filter((c) => c.status === "PUBLISHED").length} / {courses.length}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{
                    width: courses.length > 0
                      ? `${(courses.filter((c) => c.status === "PUBLISHED").length / courses.length) * 100}%`
                      : "0%",
                    transition: "width 1s ease 0.5s",
                  }}
                />
              </div>
            </div>

            {/* Completion rate */}
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Overall completion</span>
                <span className="font-semibold text-slate-700">{summary.avgCompletion}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-2 rounded-full bg-[#1a3d8f]"
                  style={{ width: `${summary.avgCompletion}%`, transition: "width 1s ease 0.6s" }}
                />
              </div>
            </div>

            {/* Weekly sparkline bars */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Weekly enrolments</p>
              <div className="flex items-end gap-1 h-12">
                {trend.map((t, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div
                      className="w-full rounded-t-sm"
                      style={{
                        height: maxTrend > 0 ? `${(t.enrollments / maxTrend) * 44}px` : "2px",
                        minHeight: "2px",
                        backgroundColor: i === trend.length - 1 ? "#1a3d8f" : "#cbd5e1",
                        transition: `height 0.8s ease ${i * 60}ms`,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-slate-300 mt-1">
                <span>8w ago</span>
                <span>Now</span>
              </div>
            </div>
          </div>

          <Link
            href="/instructor/analytics"
            className="text-xs font-medium text-[#1a3d8f] hover:text-[#152f6d] flex items-center gap-1 mt-auto"
          >
            View full analytics →
          </Link>
        </div>
      </div>

      {/* Course grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800">Your Courses</h2>
          <Link
            href="/instructor/courses"
            className="text-xs font-medium text-[#1a3d8f] hover:text-[#152f6d]"
          >
            View all →
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">No courses yet</h3>
            <p className="text-slate-500 mb-6">Create your first course to get started.</p>
            <Button asChild>
              <Link href="/instructor/courses/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {courses.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

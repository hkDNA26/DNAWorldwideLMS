"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Award, CheckCircle, BookOpen, Users, TrendingUp, GraduationCap, ChevronDown, ChevronRight } from "lucide-react";
import { formatDateShort } from "@/lib/utils";

interface Enrollment {
  id: string;
  enrolledAt: string;
  completedAt: string | null;
  completedLessons: number;
  totalLessons: number;
  progress: number;
  hasCertificate: boolean;
  certificateCode: string | null;
  certificateIssuedAt: string | null;
  student: { id: string; name: string; email: string };
}

interface CourseData {
  id: string;
  title: string;
  status: string;
  totalLessons: number;
  enrollmentCount: number;
  completionCount: number;
  avgProgress: number;
  certCount: number;
  enrollments: Enrollment[];
}

interface Summary {
  totalCourses: number;
  totalEnrollments: number;
  totalCompletions: number;
  totalCertificates: number;
}

interface Props {
  summary: Summary;
  courses: CourseData[];
}

// Animated counter hook
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return value;
}

// Animated ring / donut chart
function RingChart({ value, max, color, size = 80 }: { value: number; max: number; color: string; size?: number }) {
  const [animated, setAnimated] = useState(false);
  const radius = 30;
  const circ = 2 * Math.PI * radius;
  const pct = max > 0 ? value / max : 0;
  const dash = animated ? pct * circ : 0;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
      <circle
        cx="40" cy="40" r={radius}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ / 4}
        style={{ transition: "stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)" }}
      />
      <text x="40" y="44" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1e293b">
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

function StatCard({
  label, value, icon: Icon, color, gradient, delay = 0,
}: {
  label: string; value: number; icon: React.ElementType;
  color: string; gradient: string; delay?: number;
}) {
  const [visible, setVisible] = useState(false);
  const count = useCountUp(visible ? value : 0, 1200);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg"
      style={{
        background: gradient,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.5s ease, opacity 0.5s ease",
      }}
    >
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 bg-white" />
      <div className="absolute -right-8 -bottom-6 w-32 h-32 rounded-full opacity-10 bg-white" />

      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <p className="text-4xl font-bold tracking-tight">{count}</p>
      <p className="text-sm mt-1 opacity-80">{label}</p>
    </div>
  );
}

function AnimatedBar({ value, color }: { value: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 200);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
      <div
        className="h-2 rounded-full"
        style={{
          width: `${width}%`,
          backgroundColor: color,
          transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </div>
  );
}

function CourseRow({ course, index }: { course: CourseData; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(false);
  const completionRate = course.enrollmentCount > 0
    ? Math.round((course.completionCount / course.enrollmentCount) * 100)
    : 0;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
      style={{
        transform: visible ? "translateY(0)" : "translateY(12px)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.4s ease, opacity 0.4s ease",
      }}
    >
      <button
        className="w-full text-left px-6 py-5 hover:bg-slate-50/70 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-[#1a3d8f]/10 flex items-center justify-center flex-shrink-0">
            {expanded
              ? <ChevronDown className="h-4 w-4 text-[#1a3d8f]" />
              : <ChevronRight className="h-4 w-4 text-[#1a3d8f]" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2.5">
              <h3 className="text-sm font-semibold text-slate-900 truncate">{course.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                course.status === "PUBLISHED"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-slate-100 text-slate-500"
              }`}>
                {course.status === "PUBLISHED" ? "Published" : "Draft"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AnimatedBar value={course.avgProgress} color="#1a3d8f" />
              <span className="text-xs font-medium text-[#1a3d8f] w-10 text-right">{course.avgProgress}%</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-6 flex-shrink-0 ml-2">
            <div className="text-center">
              <p className="text-xl font-bold text-slate-900">{course.enrollmentCount}</p>
              <p className="text-xs text-slate-400">enrolled</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-slate-900">{completionRate}%</p>
              <p className="text-xs text-slate-400">completed</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-amber-500">{course.certCount}</p>
              <p className="text-xs text-slate-400">certs</p>
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100">
          {course.enrollments.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-slate-400">No students enrolled yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Student</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Progress</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Enrolled</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Completed</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {course.enrollments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a3d8f] to-[#2d5fc4] flex items-center justify-center flex-shrink-0 shadow-sm">
                          <span className="text-xs font-bold text-white">
                            {enr.student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{enr.student.name}</p>
                          <p className="text-xs text-slate-400 truncate">{enr.student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 hidden sm:table-cell">
                      <div className="w-36">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-1.5 rounded-full"
                              style={{
                                width: `${enr.progress}%`,
                                backgroundColor: enr.progress === 100 ? "#10b981" : "#1a3d8f",
                              }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 w-8 text-right">{enr.progress}%</span>
                        </div>
                        <p className="text-xs text-slate-400">{enr.completedLessons}/{enr.totalLessons} lessons</p>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-xs text-slate-500 hidden md:table-cell">
                      {formatDateShort(enr.enrolledAt)}
                    </td>
                    <td className="px-3 py-3.5 hidden md:table-cell">
                      {enr.completedAt ? (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                          <CheckCircle className="h-3.5 w-3.5" />
                          {formatDateShort(enr.completedAt)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">In progress</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5">
                      {enr.hasCertificate && enr.certificateCode ? (
                        <Link
                          href={`/certificates/${enr.certificateCode}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-600 hover:bg-amber-100 font-medium px-2.5 py-1 rounded-full transition-colors border border-amber-100"
                        >
                          <Award className="h-3 w-3" />
                          View cert
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-300">Not issued</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

const CHART_COLORS = ["#1a3d8f", "#2d5fc4", "#3b82f6", "#60a5fa", "#93c5fd"];

export function AnalyticsPanel({ summary, courses }: Props) {
  const overallRate = summary.totalEnrollments > 0
    ? Math.round((summary.totalCompletions / summary.totalEnrollments) * 100)
    : 0;

  const barData = courses.map((c: CourseData) => ({
    name: c.title.length > 20 ? c.title.slice(0, 18) + "…" : c.title,
    Enrolled: c.enrollmentCount,
    Completed: c.completionCount,
    "Avg Progress": c.avgProgress,
  }));

  const pieData = courses
    .filter((c: CourseData) => c.enrollmentCount > 0)
    .map((c: CourseData) => ({ name: c.title.length > 22 ? c.title.slice(0, 20) + "…" : c.title, value: c.enrollmentCount }));

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Courses"
          value={summary.totalCourses}
          icon={BookOpen}
          gradient="linear-gradient(135deg, #1a3d8f 0%, #2d5fc4 100%)"
          color="bg-white/20"
          delay={0}
        />
        <StatCard
          label="Total Enrollments"
          value={summary.totalEnrollments}
          icon={Users}
          gradient="linear-gradient(135deg, #0f766e 0%, #0d9488 100%)"
          color="bg-white/20"
          delay={100}
        />
        <StatCard
          label="Completions"
          value={summary.totalCompletions}
          icon={TrendingUp}
          gradient="linear-gradient(135deg, #059669 0%, #10b981 100%)"
          color="bg-white/20"
          delay={200}
        />
        <StatCard
          label="Certificates Issued"
          value={summary.totalCertificates}
          icon={GraduationCap}
          gradient="linear-gradient(135deg, #b45309 0%, #d97706 100%)"
          color="bg-white/20"
          delay={300}
        />
      </div>

      {/* Charts row */}
      {courses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-5">Enrolments vs Completions</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barGap={4} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    fontSize: 12,
                  }}
                  cursor={{ fill: "#f8fafc" }}
                />
                <Bar dataKey="Enrolled" fill="#1a3d8f" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={1000} />
                <Bar dataKey="Completed" fill="#10b981" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Ring + breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Overall Completion</h2>
            <div className="flex items-center justify-center mb-4">
              <RingChart value={summary.totalCompletions} max={summary.totalEnrollments} color="#1a3d8f" size={120} />
            </div>
            <div className="space-y-2.5 mt-auto">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1a3d8f] inline-block" />
                  Completed
                </span>
                <span className="font-semibold text-slate-700">{summary.totalCompletions}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" />
                  In Progress
                </span>
                <span className="font-semibold text-slate-700">{summary.totalEnrollments - summary.totalCompletions}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Award className="h-3 w-3 text-amber-500" />
                  Certificates
                </span>
                <span className="font-semibold text-amber-600">{summary.totalCertificates}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enrolment share pie chart */}
      {pieData.length > 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-5">Enrolment Share by Course</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                isAnimationActive
                animationDuration={1200}
              >
                {pieData.map((_: { name: string; value: number }, i: number) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(v) => <span style={{ fontSize: 12, color: "#64748b" }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Course breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Course Breakdown</h2>
        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center">
            <BookOpen className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No courses yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course: CourseData, i: number) => (
              <CourseRow key={course.id} course={course} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

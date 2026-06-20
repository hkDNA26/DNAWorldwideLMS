"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Award, CheckCircle, BookOpen, Users, TrendingUp, GraduationCap } from "lucide-react";
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

function ProgressBar({ value, color = "indigo" }: { value: number; color?: "indigo" | "emerald" }) {
  const bg = color === "emerald" ? "bg-emerald-500" : "bg-indigo-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div className={`${bg} h-1.5 rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-slate-500 w-8 text-right">{value}%</span>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function CourseRow({ course }: { course: CourseData }) {
  const [expanded, setExpanded] = useState(false);
  const completionRate = course.enrollmentCount > 0
    ? Math.round((course.completionCount / course.enrollmentCount) * 100)
    : 0;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      {/* Course header */}
      <button
        className="w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold text-slate-900 truncate">{course.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                course.status === "PUBLISHED"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}>
                {course.status === "PUBLISHED" ? "Published" : "Draft"}
              </span>
            </div>
            <ProgressBar value={course.avgProgress} />
          </div>

          <div className="hidden sm:flex items-center gap-6 flex-shrink-0 ml-4 text-center">
            <div>
              <p className="text-lg font-bold text-slate-900">{course.enrollmentCount}</p>
              <p className="text-xs text-slate-400">enrolled</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{completionRate}%</p>
              <p className="text-xs text-slate-400">completed</p>
            </div>
            <div>
              <p className="text-lg font-bold text-amber-600">{course.certCount}</p>
              <p className="text-xs text-slate-400">certs issued</p>
            </div>
          </div>
        </div>
      </button>

      {/* Expanded student rows */}
      {expanded && (
        <div className="border-t border-slate-100">
          {course.enrollments.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-slate-400">No students enrolled yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500">Student</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 hidden sm:table-cell">Progress</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 hidden md:table-cell">Enrolled</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 hidden md:table-cell">Completed</th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {course.enrollments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-indigo-600">
                            {enr.student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{enr.student.name}</p>
                          <p className="text-xs text-slate-400 truncate">{enr.student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <div className="w-36">
                        <ProgressBar
                          value={enr.progress}
                          color={enr.progress === 100 ? "emerald" : "indigo"}
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          {enr.completedLessons}/{enr.totalLessons} lessons
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500 hidden md:table-cell">
                      {formatDateShort(enr.enrolledAt)}
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      {enr.completedAt ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600">
                          <CheckCircle className="h-3.5 w-3.5" />
                          {formatDateShort(enr.completedAt)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {enr.hasCertificate && enr.certificateCode ? (
                        <Link
                          href={`/certificates/${enr.certificateCode}`}
                          target="_blank"
                          className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-medium"
                        >
                          <Award className="h-3.5 w-3.5" />
                          View
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

export function AnalyticsPanel({ summary, courses }: Props) {
  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Courses" value={summary.totalCourses} icon={BookOpen} color="bg-indigo-600" />
        <StatCard label="Total Enrollments" value={summary.totalEnrollments} icon={Users} color="bg-blue-500" />
        <StatCard label="Completions" value={summary.totalCompletions} icon={TrendingUp} color="bg-emerald-500" />
        <StatCard label="Certificates Issued" value={summary.totalCertificates} icon={GraduationCap} color="bg-amber-500" />
      </div>

      {/* Course progression */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Course Breakdown</h2>
        {courses.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
            <BookOpen className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No courses yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <CourseRow key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

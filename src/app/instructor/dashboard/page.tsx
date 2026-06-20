import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Plus, Users, BookOpen, TrendingUp } from "lucide-react";

export default async function InstructorDashboard() {
  const session = await getSession();
  if (!session) return null;

  const courses = await db.course.findMany({
    where: { instructorId: session.userId },
    include: {
      _count: { select: { enrollments: true, modules: true } },
      enrollments: { select: { completedAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);
  const publishedCourses = courses.filter((c) => c.status === "PUBLISHED").length;
  const totalCompletions = courses.reduce(
    (sum, c) => sum + c.enrollments.filter((e) => e.completedAt).length,
    0
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, {session.name}</p>
        </div>
        <Button asChild>
          <Link href="/instructor/courses/new">
            <Plus className="h-4 w-4 mr-2" />
            New Course
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={BookOpen} label="Total Courses" value={courses.length} color="indigo" />
        <StatCard icon={Users} label="Total Students" value={totalStudents} color="emerald" />
        <StatCard icon={TrendingUp} label="Completions" value={totalCompletions} color="amber" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Courses</h2>
        {courses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/instructor/courses/${course.id}/builder`}
                className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-gradient-to-br from-indigo-100 to-indigo-200 relative">
                  {course.coverImage ? (
                    <img
                      src={course.coverImage}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-indigo-300" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <Badge variant={course.status === "PUBLISHED" ? "success" : "secondary"}>
                      {course.status === "PUBLISHED" ? "Live" : "Draft"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-3">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {course._count.enrollments} students
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {course._count.modules} modules
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{formatDate(course.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "indigo" | "emerald" | "amber";
}) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className={`inline-flex p-2 rounded-lg mb-3 ${colors[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Users, Edit3 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function InstructorCoursesPage() {
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

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
        <Button asChild>
          <Link href="/instructor/courses/new">
            <Plus className="h-4 w-4 mr-2" />
            New Course
          </Link>
        </Button>
      </div>

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
        <div className="space-y-3">
          {courses.map((course) => {
            const completions = course.enrollments.filter((e) => e.completedAt).length;
            return (
              <div key={course.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex-shrink-0 overflow-hidden">
                  {course.coverImage ? (
                    <img src={course.coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-7 w-7 text-indigo-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-slate-900 truncate">{course.title}</h3>
                    <Badge variant={course.status === "PUBLISHED" ? "success" : "secondary"}>
                      {course.status === "PUBLISHED" ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {course._count.modules} modules
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {course._count.enrollments} students
                    </span>
                    <span className="text-slate-400">{completions} completions</span>
                    <span className="text-slate-400">{formatDate(course.createdAt)}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/instructor/courses/${course.id}/builder`}>
                    <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

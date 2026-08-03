import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { BookOpen, Users } from "lucide-react";

export default async function CatalogPage() {
  const session = await getSession();
  if (!session) return null;

  const enrollments = await db.enrollment.findMany({
    where: { studentId: session.userId },
    include: {
      course: {
        include: {
          instructor: { select: { name: true } },
          _count: { select: { enrollments: true, modules: true } },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  const courses = enrollments.map((e) => e.course);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{color:"var(--color-brand)"}}>Your Courses</h1>
        <p className="text-slate-500 mt-1">Courses your admin has enrolled you in</p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No courses yet</h3>
          <p className="text-slate-500">Your admin hasn't enrolled you in any courses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
              <div className="aspect-video bg-gradient-to-br from-indigo-100 to-indigo-200 relative">
                {course.coverImage ? (
                  <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-indigo-300" />
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">{course.title}</h3>
                <p className="text-xs text-slate-400 mb-2">by {course.instructor.name}</p>
                <p className="text-sm text-slate-600 mb-3 line-clamp-2 flex-1">{course.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {course._count.enrollments} students
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {course.type === "SCORM" ? "SCORM package" : `${course._count.modules} modules`}
                  </span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/student/learn/${course.id}`}>Continue Learning</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

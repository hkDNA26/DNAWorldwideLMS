import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import { CoursesList } from "@/components/instructor/courses-list";

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
        <h1 className="text-2xl font-bold" style={{color:"#1a3d8f"}}>My Courses</h1>
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
        <CoursesList initialCourses={courses} />
      )}
    </div>
  );
}

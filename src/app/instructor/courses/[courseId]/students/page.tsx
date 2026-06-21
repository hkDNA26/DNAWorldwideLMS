import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ArrowLeft, BookOpen, Eye } from "lucide-react";
import { StudentsPanel } from "@/components/instructor/students-panel";

type Params = { courseId: string };

export default async function StudentsPage({ params }: { params: Promise<Params> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { courseId } = await params;

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, instructorId: true },
  });

  if (!course || course.instructorId !== session.userId) notFound();

  const enrollments = await db.enrollment.findMany({
    where: { courseId },
    include: {
      student: { select: { id: true, name: true, email: true } },
      lessonProgress: { select: { lessonId: true } },
    },
    orderBy: { enrolledAt: "desc" },
  });

  const totalLessons = await db.lesson.count({ where: { module: { courseId } } });

  const initialEnrollments = enrollments.map((e) => ({
    id: e.id,
    enrolledAt: e.enrolledAt.toISOString(),
    completedAt: e.completedAt?.toISOString() ?? null,
    student: e.student,
    progress: totalLessons > 0 ? Math.round((e.lessonProgress.length / totalLessons) * 100) : 0,
    completedLessons: e.lessonProgress.length,
    totalLessons,
  }));

  // Get first lesson for preview link
  const firstLesson = await db.lesson.findFirst({
    where: { module: { courseId } },
    orderBy: [{ module: { orderIndex: "asc" } }, { orderIndex: "asc" }],
    select: { id: true },
  });

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/instructor/courses" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-sm font-semibold leading-tight" style={{color:"#1a3d8f"}}>{course.title}</h1>
            <p className="text-xs text-slate-400">Student Management</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/instructor/courses/${courseId}/builder`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Builder
          </Link>
          {firstLesson && (
            <Link
              href={`/instructor/courses/${courseId}/preview/${firstLesson.id}`}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#1a3d8f] hover:text-[#152f6d] hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Link>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <StudentsPanel courseId={courseId} initialEnrollments={initialEnrollments} />
        </div>
      </div>
    </div>
  );
}

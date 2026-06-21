import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CourseBuilder } from "@/components/instructor/course-builder";
import { ArrowLeft, Users, Eye } from "lucide-react";

type Params = { courseId: string };

export default async function CourseBuilderPage({ params }: { params: Promise<Params> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { courseId } = await params;

  const firstLesson = await db.lesson.findFirst({
    where: { module: { courseId } },
    orderBy: [{ module: { orderIndex: "asc" } }, { orderIndex: "asc" }],
    select: { id: true },
  });

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: {
            orderBy: { orderIndex: "asc" },
            include: {
              quiz: {
                include: {
                  questions: {
                    orderBy: { orderIndex: "asc" },
                    include: { answerOptions: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course || course.instructorId !== session.userId) {
    notFound();
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/instructor/courses"
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-sm font-semibold leading-tight" style={{color:"#1a3d8f"}}>{course.title}</h1>
            <p className="text-xs text-slate-400">Course Builder</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/instructor/courses/${courseId}/students`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Users className="h-4 w-4" />
            Students
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
      <div className="flex-1 overflow-hidden">
        <CourseBuilder course={course as Parameters<typeof CourseBuilder>[0]["course"]} />
      </div>
    </div>
  );
}

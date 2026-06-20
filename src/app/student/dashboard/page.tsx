import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Award, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function StudentDashboard() {
  const session = await getSession();
  if (!session) return null;

  const enrollments = await db.enrollment.findMany({
    where: { studentId: session.userId },
    include: {
      course: {
        include: {
          instructor: { select: { name: true } },
          modules: { include: { lessons: { select: { id: true } } } },
        },
      },
      lessonProgress: { select: { lessonId: true } },
    },
    orderBy: { enrolledAt: "desc" },
  });

  const certificates = await db.certificate.count({ where: { studentId: session.userId } });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Learning</h1>
        <p className="text-slate-500 mt-1">Welcome back, {session.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg"><BookOpen className="h-5 w-5 text-indigo-600" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{enrollments.length}</p>
              <p className="text-sm text-slate-500">Courses enrolled</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg"><BookOpen className="h-5 w-5 text-emerald-600" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{enrollments.filter((e) => e.completedAt).length}</p>
              <p className="text-sm text-slate-500">Courses completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg"><Award className="h-5 w-5 text-amber-600" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{certificates}</p>
              <p className="text-sm text-slate-500">Certificates earned</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Enrolled Courses</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/student/catalog">Browse more courses</Link>
          </Button>
        </div>

        {enrollments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">No courses yet</h3>
            <p className="text-slate-500 mb-6">Browse the catalog and enroll in your first course.</p>
            <Button asChild>
              <Link href="/student/catalog">Browse Courses</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrollments.map((enrollment) => {
              const totalLessons = enrollment.course.modules.reduce((s, m) => s + m.lessons.length, 0);
              const completedLessons = enrollment.lessonProgress.length;
              const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
              const firstModuleId = enrollment.course.modules[0]?.id;
              const firstLessonId = enrollment.course.modules[0]?.lessons[0]?.id;

              return (
                <div key={enrollment.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-indigo-100 to-indigo-200 relative">
                    {enrollment.course.coverImage ? (
                      <img src={enrollment.course.coverImage} alt={enrollment.course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-indigo-300" />
                      </div>
                    )}
                    {enrollment.completedAt && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="success">Completed</Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-1">{enrollment.course.title}</h3>
                    <p className="text-xs text-slate-400 mb-3">by {enrollment.course.instructor.name}</p>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>{completedLessons} / {totalLessons} lessons</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} />
                    </div>

                    {firstLessonId ? (
                      <Link
                        href={`/student/learn/${enrollment.courseId}/${firstLessonId}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        {progress > 0 ? "Continue" : "Start"} learning
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <p className="text-sm text-slate-400">No lessons yet</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

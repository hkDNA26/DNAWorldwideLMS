import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { BookOpen } from "lucide-react";
import { BackLink } from "@/components/portal/back-link";

export default async function CoursesPage() {
  const session = await getSession();
  if (!session) return null;

  const enrollments = await db.enrollment.findMany({
    where: { studentId: session.userId },
    include: {
      course: { include: { modules: { include: { lessons: { select: { id: true } } } } } },
      lessonProgress: { select: { lessonId: true } },
    },
    orderBy: { enrolledAt: "desc" },
  });

  const courses = enrollments.map((e) => {
    const totalLessons = e.course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const completedLessons = e.lessonProgress.length;
    const progress =
      e.course.type === "SCORM"
        ? e.completedAt ? 100 : 0
        : totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    return { id: e.courseId, title: e.course.title, progress, isCompleted: !!e.completedAt };
  });

  const inProgress = courses.filter((c) => !c.isCompleted);
  const completed = courses.filter((c) => c.isCompleted);

  return (
    <div>
      <BackLink href="/" label="Back to home" />
      <div className="mb-8 animate-brand-fade-up">
        <h1 className="text-2xl font-bold text-ink">Your Courses</h1>
        <p className="text-ink-soft mt-1">Pick up where you left off.</p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-line">
          <BookOpen className="h-12 w-12 text-line mx-auto mb-4" />
          <h3 className="text-[15px] font-bold text-ink mb-1">No courses yet</h3>
          <p className="text-ink-soft text-sm">Your admin hasn't enrolled you in any courses yet.</p>
        </div>
      ) : (
        <>
          {inProgress.length > 0 && (
            <div className="mb-9">
              <h2 className="text-[13px] font-bold uppercase tracking-wide text-brand mb-3 flex items-center gap-2.5">
                <span className="inline-block w-[18px] h-[2px] bg-accent" />
                Continue learning
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {inProgress.map((c, i) => (
                  <Link
                    key={c.id}
                    href={`/student/learn/${c.id}`}
                    className="bg-white border border-line rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all animate-brand-card-in"
                    style={{ animationDelay: `${i * 70}ms` }}
                  >
                    <h3 className="font-bold text-ink mb-2 line-clamp-1">{c.title}</h3>
                    <div className="h-2 bg-line-soft rounded-full overflow-hidden mb-1.5">
                      <div className="h-full bg-brand rounded-full" style={{ width: `${c.progress}%` }} />
                    </div>
                    <p className="text-xs text-ink-faint">{c.progress}% complete</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h2 className="text-[13px] font-bold uppercase tracking-wide text-brand mb-3 flex items-center gap-2.5">
                <span className="inline-block w-[18px] h-[2px] bg-accent" />
                Completed
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {completed.map((c, i) => (
                  <Link
                    key={c.id}
                    href={`/student/learn/${c.id}`}
                    className="bg-white border border-line rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all animate-brand-card-in"
                    style={{ animationDelay: `${i * 70}ms` }}
                  >
                    <h3 className="font-bold text-ink mb-2 line-clamp-1">{c.title}</h3>
                    <p className="text-xs text-emerald-600 font-medium">Completed</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Award, ExternalLink, PlayCircle } from "lucide-react";
import { ChangePasswordForm } from "@/components/portal/change-password-form";
import { BackLink } from "@/components/portal/back-link";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[13px] font-bold uppercase tracking-wide text-brand mb-3 flex items-center gap-2.5">
      <span className="inline-block w-[18px] h-[2px] bg-accent" />
      {children}
    </h2>
  );
}

export default async function ProgressPage() {
  const session = await getSession();
  if (!session) return null;

  const [enrollments, certificates] = await Promise.all([
    db.enrollment.findMany({
      where: { studentId: session.userId },
      include: {
        course: {
          include: {
            modules: {
              orderBy: { orderIndex: "asc" },
              include: { lessons: { orderBy: { orderIndex: "asc" }, select: { id: true } } },
            },
          },
        },
        lessonProgress: { select: { lessonId: true } },
      },
      orderBy: { enrolledAt: "desc" },
    }),
    db.certificate.findMany({
      where: { studentId: session.userId },
      include: { course: { select: { title: true } } },
      orderBy: { issuedAt: "desc" },
    }),
  ]);

  const certByCourse = new Map(certificates.map((c) => [c.courseId, c]));

  const courses = enrollments.map((e) => {
    const isScorm = e.course.type === "SCORM";
    const allLessons = e.course.modules.flatMap((m) => m.lessons);
    const completedIds = new Set(e.lessonProgress.map((p) => p.lessonId));
    const totalLessons = allLessons.length;
    const completedLessons = e.lessonProgress.length;
    const isCompleted = !!e.completedAt;
    const progress = isScorm
      ? isCompleted ? 100 : 0
      : totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const nextLesson = allLessons.find((l) => !completedIds.has(l.id)) ?? allLessons[0] ?? null;

    return {
      courseId: e.courseId,
      courseType: e.course.type,
      title: e.course.title,
      progress,
      completedLessons,
      totalLessons,
      isCompleted,
      nextLessonId: nextLesson?.id ?? null,
      certificate: certByCourse.get(e.courseId) ?? null,
    };
  });

  return (
    <div>
      <BackLink href="/" label="Back to home" />
      <div className="mb-8 animate-brand-fade-up">
        <h1 className="text-2xl font-bold text-ink">Progress &amp; Settings</h1>
        <p className="text-ink-soft mt-1">Your course progress, certificates, and account.</p>
      </div>

      <SectionHeading>Course progress</SectionHeading>
      {courses.length === 0 ? (
        <div className="bg-white border border-line rounded-2xl p-8 text-center text-ink-faint text-sm mb-9">
          You&apos;re not enrolled in any courses yet.{" "}
          <Link href="/courses" className="text-brand font-semibold hover:underline">Browse courses</Link>.
        </div>
      ) : (
        <div className="grid gap-3 mb-9">
          {courses.map((c, i) => (
            <div
              key={c.courseId}
              className="bg-white border border-line rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow animate-brand-card-in"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="flex items-center justify-between gap-4 mb-2.5">
                <h3 className="font-bold text-ink">{c.title}</h3>
                <span className="text-xs font-semibold text-ink-faint whitespace-nowrap">
                  {c.courseType === "SCORM" ? (c.isCompleted ? "Completed" : "In progress") : `${c.completedLessons} / ${c.totalLessons} lessons`}
                </span>
              </div>
              <div className="h-2 bg-line-soft rounded-full overflow-hidden mb-3.5">
                <div
                  className={`h-full rounded-full ${c.isCompleted ? "bg-accent" : "bg-brand"}`}
                  style={{ width: `${c.progress}%` }}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {!c.isCompleted && (c.courseType === "SCORM" || c.nextLessonId) && (
                  <Link
                    href={c.courseType === "SCORM" ? `/student/learn/${c.courseId}` : `/student/learn/${c.courseId}/${c.nextLessonId}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-brand hover:bg-brand-dark rounded-lg px-3.5 py-2 transition-colors"
                  >
                    <PlayCircle className="h-4 w-4" />
                    Continue course
                  </Link>
                )}
                {c.certificate && (
                  <Link
                    href={`/certificates/${c.certificate.verificationCode}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark"
                  >
                    <Award className="h-4 w-4" />
                    View certificate
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <SectionHeading>Certificates</SectionHeading>
      {certificates.length === 0 ? (
        <div className="bg-white border border-line rounded-2xl p-8 text-center text-ink-faint text-sm mb-9">
          No certificates yet — complete a course to earn your first one.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 mb-9">
          {certificates.map((cert, i) => (
            <div
              key={cert.id}
              className="bg-white border border-line rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3.5 animate-brand-card-in"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="p-2.5 bg-warn-bg rounded-xl shrink-0">
                <Award className="h-6 w-6 text-warn-ink" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-ink text-sm line-clamp-2">{cert.course.title}</h3>
                <p className="text-xs text-ink-faint mt-1 mb-2">
                  Issued {new Date(cert.issuedAt).toLocaleDateString()}
                </p>
                <Link
                  href={`/certificates/${cert.verificationCode}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:text-brand-dark"
                >
                  Download / view
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <SectionHeading>Account settings</SectionHeading>
      <div className="bg-white border border-line rounded-2xl p-5 md:p-6 shadow-sm">
        <p className="text-sm text-ink-soft mb-4">
          Signed in as <span className="font-semibold text-ink">{session.email}</span>
        </p>
        <ChangePasswordForm />
      </div>
    </div>
  );
}

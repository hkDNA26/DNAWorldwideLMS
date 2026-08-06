import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { BookOpen, Clock, PlayCircle, RotateCcw, Award, TrendingUp } from "lucide-react";
import { BackLink } from "@/components/portal/back-link";

type CourseTileData = {
  courseId: string;
  title: string;
  coverImage: string | null;
  courseType: string;
  estimatedTime: string | null;
  moduleCount: number;
  progress: number;
  isCompleted: boolean;
  nextLessonId: string | null;
  certificateCode: string | null;
};

function Ring({ pct, color, size = 56 }: { pct: number; color: string; size?: number }) {
  const r = 24;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <circle cx="30" cy="30" r={r} fill="none" stroke="#e1e6ec" strokeWidth="5" />
      <circle
        cx="30"
        cy="30"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ / 4}
      />
      <text x="30" y="34" textAnchor="middle" fontSize="11" fontWeight="700" fill="#16202c">
        {pct}%
      </text>
    </svg>
  );
}

function StatPill({
  icon: Icon, label, value, color,
}: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3 bg-white border border-line rounded-xl px-4 py-3 shadow-sm">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}1a` }}>
        <Icon className="w-4.5 h-4.5" style={{ color }} />
      </div>
      <div>
        <p className="text-lg font-bold text-ink leading-none">{value}</p>
        <p className="text-[11px] text-ink-faint mt-1">{label}</p>
      </div>
    </div>
  );
}

function CourseTile({ c, index }: { c: CourseTileData; index: number }) {
  const continueHref =
    c.courseType === "SCORM"
      ? `/student/learn/${c.courseId}/scorm`
      : c.nextLessonId
        ? `/student/learn/${c.courseId}/${c.nextLessonId}`
        : `/student/learn/${c.courseId}`;

  const statusLabel = c.isCompleted ? "Completed" : c.progress > 0 ? "In progress" : "Not started";
  const statusDot = c.isCompleted ? "bg-emerald-400" : c.progress > 0 ? "bg-sky-400" : "bg-slate-300";
  const ringColor = c.isCompleted ? "var(--color-accent)" : "var(--color-brand)";
  const displayPct = c.isCompleted ? 100 : c.progress;

  return (
    <div
      className="group bg-white border border-line rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all animate-brand-card-in"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <Link href={continueHref} className="block aspect-video relative overflow-hidden bg-gradient-to-br from-brand/10 to-brand-bright/20">
        {c.coverImage ? (
          <img
            src={c.coverImage}
            alt={c.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-brand/30" />
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${statusDot}`} />
          <span className="text-xs font-medium text-white bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
            {statusLabel}
          </span>
        </div>

        <div className="absolute bottom-3 right-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-0.5 shadow-md">
            <Ring pct={displayPct} color={ringColor} />
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={continueHref}>
          <h3 className="font-bold text-ink line-clamp-2 mb-3 group-hover:text-brand transition-colors">
            {c.title}
          </h3>
        </Link>

        <div className="flex items-center gap-3 text-xs text-ink-faint mb-4">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {c.courseType === "SCORM" ? "SCORM package" : `${c.moduleCount} module${c.moduleCount === 1 ? "" : "s"}`}
          </span>
          {c.estimatedTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {c.estimatedTime}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={continueHref}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-brand hover:bg-brand-dark rounded-xl py-2 transition-colors"
          >
            {c.isCompleted ? <RotateCcw className="h-3.5 w-3.5" /> : <PlayCircle className="h-3.5 w-3.5" />}
            {c.isCompleted ? "Review course" : c.progress > 0 ? "Continue learning" : "Start course"}
          </Link>
          {c.certificateCode && (
            <Link
              href={`/certificates/${c.certificateCode}`}
              target="_blank"
              title="View certificate"
              className="flex items-center justify-center gap-1.5 text-xs font-semibold text-brand border border-brand/25 hover:bg-brand/5 rounded-xl py-2 px-3 transition-colors shrink-0"
            >
              <Award className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function CoursesPage() {
  const session = await getSession();
  if (!session) return null;

  const [enrollments, certificates] = await Promise.all([
    db.enrollment.findMany({
      where: { studentId: session.userId },
      include: {
        course: { include: { modules: { include: { lessons: { select: { id: true }, orderBy: { orderIndex: "asc" } } } } } },
        lessonProgress: { select: { lessonId: true } },
      },
      orderBy: { enrolledAt: "desc" },
    }),
    db.certificate.findMany({ where: { studentId: session.userId } }),
  ]);

  const certByCourse = new Map(certificates.map((c) => [c.courseId, c.verificationCode]));

  const courses: CourseTileData[] = enrollments.map((e) => {
    const allLessons = e.course.modules.flatMap((m) => m.lessons);
    const completedIds = new Set(e.lessonProgress.map((p) => p.lessonId));
    const totalLessons = allLessons.length;
    const completedLessons = e.lessonProgress.length;
    const isCompleted = !!e.completedAt;
    const progress =
      e.course.type === "SCORM"
        ? isCompleted ? 100 : 0
        : totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const nextLesson = allLessons.find((l) => !completedIds.has(l.id)) ?? allLessons[0] ?? null;

    return {
      courseId: e.courseId,
      title: e.course.title,
      coverImage: e.course.coverImage,
      courseType: e.course.type,
      estimatedTime: e.course.estimatedTime,
      moduleCount: e.course.modules.length,
      progress,
      isCompleted,
      nextLessonId: nextLesson?.id ?? null,
      certificateCode: certByCourse.get(e.courseId) ?? null,
    };
  });

  const inProgress = courses.filter((c) => !c.isCompleted);
  const completed = courses.filter((c) => c.isCompleted);

  return (
    <div>
      <BackLink href="/" label="Back to home" />
      <div className="mb-6 animate-brand-fade-up">
        <h1 className="text-2xl font-bold text-ink">Your Courses</h1>
        <p className="text-ink-soft mt-1">Pick up where you left off.</p>
      </div>

      {courses.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <StatPill icon={BookOpen} label="Enrolled" value={courses.length} color="#1d4f8c" />
          <StatPill icon={TrendingUp} label="In progress" value={inProgress.filter((c) => c.progress > 0).length} color="#0d9488" />
          <StatPill icon={Award} label="Completed" value={completed.length} color="#2e8659" />
        </div>
      )}

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
              <div className="grid gap-5 sm:grid-cols-2">
                {inProgress.map((c, i) => (
                  <CourseTile key={c.courseId} c={c} index={i} />
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
              <div className="grid gap-5 sm:grid-cols-2">
                {completed.map((c, i) => (
                  <CourseTile key={c.courseId} c={c} index={i} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

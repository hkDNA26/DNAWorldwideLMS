import Link from "next/link";
import { ArrowLeft, Clock, PlayCircle } from "lucide-react";

interface CourseIntroData {
  title: string;
  description: string;
  coverImage: string | null;
  estimatedTime: string | null;
}

export function CourseIntro({ course, startUrl }: { course: CourseIntroData; startUrl: string }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl mb-4">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          My Courses
        </Link>
      </div>

      <div
        className="w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200"
        style={{ animation: "brand-card-in 0.6s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div className="relative" style={{ aspectRatio: "21/9" }}>
          {course.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.coverImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: "linear-gradient(135deg, var(--color-brand-dark), var(--color-brand) 55%, #0f766e)" }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(15,23,42,0.8), transparent 60%)" }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h1 className="text-3xl font-bold text-white drop-shadow-sm">{course.title}</h1>
          </div>
        </div>

        <div className="p-8">
          {course.description && (
            <p className="text-slate-600 leading-relaxed mb-6">{course.description}</p>
          )}

          {course.estimatedTime && (
            <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-100 rounded-full px-4 py-1.5 mb-8">
              <Clock className="h-4 w-4" />
              {course.estimatedTime}
            </div>
          )}

          <div>
            <Link
              href={startUrl}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-base shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              style={{ background: "linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))" }}
            >
              <PlayCircle className="h-5 w-5" />
              Start Course
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

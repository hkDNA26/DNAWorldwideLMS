"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Circle, ChevronDown, ChevronRight, FileText, Video, HelpCircle, Award, ArrowLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QuizPlayer } from "./quiz-player";
import { useToast } from "@/components/ui/toast";
import type { Certificate } from "@/types";

interface LessonSummary {
  id: string;
  title: string;
  contentType: string;
  orderIndex: number;
}

interface ModuleSummary {
  id: string;
  title: string;
  orderIndex: number;
  lessons: LessonSummary[];
}

interface CourseData {
  id: string;
  title: string;
  instructor: { name: string };
  modules: ModuleSummary[];
}

interface LessonData {
  id: string;
  title: string;
  contentType: string;
  content: string | null;
  videoUrl: string | null;
  quiz: {
    id: string;
    title: string;
    passingScore: number;
    questions: {
      id: string;
      questionText: string;
      type: string;
      orderIndex: number;
      answerOptions: { id: string; text: string; isCorrect: boolean }[];
    }[];
  } | null;
}

interface QuizAttemptData {
  id: string;
  score: number;
  passed: boolean;
  submittedAt: Date;
}

interface CoursePlayerProps {
  course: CourseData;
  currentLesson: LessonData;
  completedLessonIds: string[];
  enrollmentCompleted: boolean;
  certificate: Certificate | null;
  latestAttempt: QuizAttemptData | null;
  isPreview?: boolean;
}

const CONTENT_ICONS: Record<string, React.ReactNode> = {
  TEXT: <FileText className="h-3.5 w-3.5" />,
  VIDEO: <Video className="h-3.5 w-3.5" />,
  QUIZ: <HelpCircle className="h-3.5 w-3.5" />,
};

export function CoursePlayer({
  course,
  currentLesson,
  completedLessonIds: initialCompleted,
  enrollmentCompleted: initialCompleted2,
  certificate: initialCert,
  latestAttempt,
  isPreview = false,
}: CoursePlayerProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set(initialCompleted));
  const [enrollmentCompleted, setEnrollmentCompleted] = useState(initialCompleted2);
  const [certificate, setCertificate] = useState(initialCert);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(course.modules.map((m) => m.id))
  );

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const totalLessons = allLessons.length;
  const completedCount = allLessons.filter((l) => completedIds.has(l.id)).length;
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const lessonUrl = (lessonId: string) =>
    isPreview
      ? `/instructor/courses/${course.id}/preview/${lessonId}`
      : `/student/learn/${course.id}/${lessonId}`;

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const markComplete = async () => {
    if (isPreview) {
      addToast("Preview mode — progress is not tracked", "info");
      return;
    }
    if (completedIds.has(currentLesson.id)) return;
    setMarkingComplete(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: currentLesson.id }),
      });
      if (res.ok) {
        const newIds = new Set(completedIds);
        newIds.add(currentLesson.id);
        setCompletedIds(newIds);

        if (newIds.size === totalLessons && !enrollmentCompleted) {
          setEnrollmentCompleted(true);
          const certRes = await fetch(`/api/certificates/course/${course.id}`).catch(() => null);
          if (certRes?.ok) {
            const certData = await certRes.json();
            if (certData.data) setCertificate(certData.data);
          }
          addToast("Congratulations! Course completed!", "success");
        } else {
          addToast("Lesson marked complete!", "success");
          if (nextLesson) {
            router.push(lessonUrl(nextLesson.id));
          }
        }
      }
    } finally {
      setMarkingComplete(false);
    }
  };

  const onQuizPassed = async () => {
    if (isPreview) return;
    const newIds = new Set(completedIds);
    newIds.add(currentLesson.id);
    setCompletedIds(newIds);

    if (newIds.size === totalLessons && !enrollmentCompleted) {
      setEnrollmentCompleted(true);
      addToast("Congratulations! Course completed!", "success");
      router.refresh();
    } else {
      addToast("Quiz passed! Moving to next lesson...", "success");
      if (nextLesson) {
        setTimeout(() => router.push(lessonUrl(nextLesson.id)), 1500);
      }
    }
  };

  const isCompleted = completedIds.has(currentLesson.id);

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Preview banner */}
      {isPreview && (
        <div className="flex items-center justify-between px-4 py-2 bg-amber-50 border-b border-amber-200 flex-shrink-0">
          <div className="flex items-center gap-2 text-amber-700 text-sm">
            <Eye className="h-4 w-4" />
            <span className="font-medium">Preview Mode</span>
            <span className="text-amber-600 text-xs">— students see this course without this banner</span>
          </div>
          <Link
            href={`/instructor/courses/${course.id}/builder`}
            className="text-xs text-amber-600 hover:text-amber-800 underline"
          >
            ← Back to Builder
          </Link>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 flex-shrink-0 border-r border-slate-200 flex flex-col bg-white overflow-y-auto">
          <div className="p-4 border-b border-slate-200">
            {!isPreview && (
              <Link href="/student/dashboard" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 mb-3 transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" />
                My Courses
              </Link>
            )}
            <h2 className="text-sm font-semibold text-slate-900 line-clamp-2">{course.title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">by {course.instructor.name}</p>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>{completedCount}/{totalLessons} lessons</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </div>

          <div className="flex-1 p-2 overflow-y-auto">
            {course.modules.map((module) => (
              <div key={module.id} className="mb-1">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="flex items-center gap-1.5 w-full px-2 py-2 text-left hover:bg-slate-50 rounded-lg transition-colors"
                >
                  {expandedModules.has(module.id)
                    ? <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    : <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />}
                  <span className="text-xs font-medium text-slate-700 truncate">{module.title}</span>
                </button>
                {expandedModules.has(module.id) && (
                  <div className="ml-4 space-y-0.5 mt-0.5">
                    {module.lessons.map((lesson) => {
                      const isActive = lesson.id === currentLesson.id;
                      const isDone = completedIds.has(lesson.id);
                      return (
                        <Link
                          key={lesson.id}
                          href={lessonUrl(lesson.id)}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                            isActive
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <span className={`flex-shrink-0 ${isActive ? "text-indigo-400" : "text-slate-300"}`}>
                              {CONTENT_ICONS[lesson.contentType] || <Circle className="h-3.5 w-3.5" />}
                            </span>
                          )}
                          <span className={`truncate ${isActive ? "font-medium" : ""}`}>{lesson.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {enrollmentCompleted && certificate && !isPreview && (
            <div className="p-4 border-t border-slate-200 bg-amber-50">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-semibold text-amber-800">Course Complete!</span>
              </div>
              <Button size="sm" variant="outline" asChild className="w-full text-amber-700 border-amber-300 hover:bg-amber-100">
                <Link href={`/certificates/${certificate.verificationCode}`} target="_blank">
                  View Certificate
                </Link>
              </Button>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-8">
            <div className="mb-6">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                {currentLesson.contentType === "TEXT" ? "Text Lesson" : currentLesson.contentType === "VIDEO" ? "Video Lesson" : "Quiz"}
              </span>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">{currentLesson.title}</h1>
            </div>

            {currentLesson.contentType === "TEXT" && (
              <div
                className="prose text-slate-800 max-w-none"
                dangerouslySetInnerHTML={{ __html: currentLesson.content || "<p>No content yet.</p>" }}
              />
            )}

            {currentLesson.contentType === "VIDEO" && (
              <div>
                {currentLesson.videoUrl ? (
                  <div className="rounded-xl overflow-hidden bg-black aspect-video mb-6">
                    {currentLesson.videoUrl.includes("youtube.com") || currentLesson.videoUrl.includes("vimeo.com") ? (
                      <iframe
                        src={currentLesson.videoUrl}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    ) : (
                      <video src={currentLesson.videoUrl} controls className="w-full h-full" />
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-100 aspect-video flex items-center justify-center mb-6">
                    <Video className="h-16 w-16 text-slate-300" />
                  </div>
                )}
              </div>
            )}

            {currentLesson.contentType === "QUIZ" && currentLesson.quiz && (
              <QuizPlayer
                quiz={currentLesson.quiz}
                latestAttempt={latestAttempt}
                courseId={course.id}
                onPassed={onQuizPassed}
                isPreview={isPreview}
              />
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
              <div>
                {prevLesson && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={lessonUrl(prevLesson.id)}>← Previous</Link>
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-3">
                {currentLesson.contentType !== "QUIZ" && (
                  <Button
                    onClick={markComplete}
                    loading={markingComplete}
                    variant={isCompleted ? "outline" : "default"}
                    size="sm"
                    disabled={isPreview}
                    title={isPreview ? "Progress not tracked in preview mode" : undefined}
                  >
                    {isCompleted ? (
                      <><CheckCircle className="h-4 w-4 mr-1.5 text-emerald-500" />Completed</>
                    ) : (
                      "Mark Complete"
                    )}
                  </Button>
                )}
                {nextLesson && (
                  <Button size="sm" asChild>
                    <Link href={lessonUrl(nextLesson.id)}>Next →</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

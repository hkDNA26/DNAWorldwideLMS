"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Circle, ChevronDown, ChevronRight, FileText, Video, HelpCircle, Award, ArrowLeft, Eye, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QuizPlayer } from "./quiz-player";
import { VideoPlayer } from "./video-player";
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
  videoThumbnail?: string | null;
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

  // Video: track when completed this session + remount key for "Watch Again"
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [watchAgainKey, setWatchAgainKey] = useState(0);

  // Text: track when "Continue" has been clicked (marks complete)
  const [textProceedLoading, setTextProceedLoading] = useState(false);

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

  // Core: mark a lesson complete via API and update state. Returns the new completed set.
  const markLessonComplete = useCallback(async (lessonId: string): Promise<Set<string>> => {
    if (isPreview) return completedIds;
    if (completedIds.has(lessonId)) return completedIds;

    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId }),
    });

    if (!res.ok) return completedIds;

    const newIds = new Set(completedIds);
    newIds.add(lessonId);
    setCompletedIds(newIds);
    return newIds;
  }, [isPreview, completedIds]);

  // Navigate to next lesson or course completion
  const proceedNext = useCallback((newIds: Set<string>) => {
    if (newIds.size === totalLessons && !enrollmentCompleted) {
      router.push(`/student/learn/${course.id}/complete`);
    } else if (nextLesson) {
      router.push(lessonUrl(nextLesson.id));
    }
  }, [totalLessons, enrollmentCompleted, nextLesson, course.id, router, lessonUrl]);

  // VIDEO: auto-called when video plays to end
  const onVideoComplete = useCallback(async () => {
    if (isPreview) {
      addToast("Preview mode — progress is not tracked", "info");
      setVideoCompleted(true);
      return;
    }
    await markLessonComplete(currentLesson.id);
    setVideoCompleted(true);
  }, [isPreview, markLessonComplete, currentLesson.id, addToast]);

  // VIDEO: "Watch Again" resets the player
  const onWatchAgain = useCallback(() => {
    setVideoCompleted(false);
    setWatchAgainKey((k) => k + 1);
  }, []);

  // VIDEO: "Next Lesson" after completion
  const onVideoContinue = useCallback(async () => {
    const newIds = completedIds.has(currentLesson.id)
      ? completedIds
      : await markLessonComplete(currentLesson.id);
    proceedNext(newIds);
  }, [completedIds, currentLesson.id, markLessonComplete, proceedNext]);

  // TEXT: "Continue" marks complete and navigates
  const onTextContinue = useCallback(async () => {
    setTextProceedLoading(true);
    try {
      const newIds = await markLessonComplete(currentLesson.id);
      proceedNext(newIds);
    } finally {
      setTextProceedLoading(false);
    }
  }, [markLessonComplete, currentLesson.id, proceedNext]);

  // TEXT: "Read Again" scrolls to top of content
  const onReadAgain = useCallback(() => {
    document.getElementById("lesson-content-top")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // QUIZ: called by QuizPlayer when quiz passes (marks complete, updates state)
  const onQuizPassed = useCallback(async () => {
    if (isPreview) return;
    const newIds = new Set(completedIds);
    newIds.add(currentLesson.id);
    setCompletedIds(newIds);
  }, [isPreview, completedIds, currentLesson.id]);

  // QUIZ: called by QuizPlayer when student clicks "Continue"
  const onQuizContinue = useCallback(async () => {
    const newIds = new Set(completedIds);
    newIds.add(currentLesson.id);
    proceedNext(newIds);
  }, [completedIds, currentLesson.id, proceedNext]);

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
                              ? "bg-indigo-50 text-[#1a3d8f]"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <span className={`flex-shrink-0 ${isActive ? "text-[#1a3d8f]" : "text-slate-300"}`}>
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

          {enrollmentCompleted && !isPreview && (
            <div className="p-4 border-t border-slate-200 bg-amber-50">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-semibold text-amber-800">Course Complete!</span>
              </div>
              <Button size="sm" variant="outline" asChild className="w-full text-amber-700 border-amber-300 hover:bg-amber-100">
                <Link href={`/student/learn/${course.id}/complete`}>
                  View Certificate
                </Link>
              </Button>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {currentLesson.contentType === "VIDEO" ? (
            <div className="flex flex-col h-full">
              {/* Full-width video */}
              <div className="p-3 flex-shrink-0" style={{ backgroundColor: "#1a3d8f" }}>
                <div className="rounded-xl overflow-hidden w-full" style={{ aspectRatio: "16/9" }}>
                  {currentLesson.videoUrl ? (
                    <VideoPlayer
                      key={watchAgainKey}
                      url={currentLesson.videoUrl}
                      thumbnail={currentLesson.videoThumbnail}
                      onComplete={onVideoComplete}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#0d2060]">
                      <Video className="h-20 w-20 text-white/20" />
                    </div>
                  )}
                </div>
              </div>

              {/* Title + actions below video */}
              <div className="max-w-4xl mx-auto w-full px-8 py-6">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Video Lesson</span>
                <h1 className="text-2xl font-bold text-slate-900 mt-1 mb-6">{currentLesson.title}</h1>

                {/* Completion actions — only visible after video ends */}
                {videoCompleted && (
                  <div className="mb-6 p-5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <p className="font-semibold text-emerald-800">Lesson complete!</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={onWatchAgain}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Watch Again
                      </button>
                      {(nextLesson || (!enrollmentCompleted && isCompleted)) && (
                        <button
                          onClick={onVideoContinue}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a3d8f] text-white text-sm font-medium hover:bg-[#15336e] transition-colors"
                        >
                          {nextLesson ? "Next Lesson" : "Complete Course"}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Prev navigation */}
                {prevLesson && (
                  <div className="pt-6 border-t border-slate-200">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={lessonUrl(prevLesson.id)}>← Previous</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto p-8">
              <div id="lesson-content-top" className="mb-6">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  {currentLesson.contentType === "TEXT" ? "Text Lesson" : "Quiz"}
                </span>
                <h1 className="text-2xl font-bold text-slate-900 mt-1">{currentLesson.title}</h1>
              </div>

              {currentLesson.contentType === "TEXT" && (
                <>
                  <div
                    className="prose text-slate-800 max-w-none"
                    dangerouslySetInnerHTML={{ __html: currentLesson.content || "<p>No content yet.</p>" }}
                  />

                  {/* End-of-text actions */}
                  <div className="mt-10 pt-6 border-t border-slate-200">
                    <p className="text-sm text-slate-500 mb-4">Finished reading?</p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={onReadAgain}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Read Again
                      </button>
                      <button
                        onClick={onTextContinue}
                        disabled={textProceedLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a3d8f] text-white text-sm font-medium hover:bg-[#15336e] disabled:opacity-60 transition-colors"
                      >
                        {nextLesson ? "Next Lesson" : "Complete Course"}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {currentLesson.contentType === "QUIZ" && currentLesson.quiz && (
                <QuizPlayer
                  quiz={currentLesson.quiz}
                  latestAttempt={latestAttempt}
                  courseId={course.id}
                  onPassed={onQuizPassed}
                  onContinue={onQuizContinue}
                  isPreview={isPreview}
                />
              )}

              {/* Previous lesson link */}
              {prevLesson && currentLesson.contentType !== "QUIZ" && (
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={lessonUrl(prevLesson.id)}>← Previous</Link>
                  </Button>
                </div>
              )}
              {prevLesson && currentLesson.contentType === "QUIZ" && (
                <div className="mt-6">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={lessonUrl(prevLesson.id)}>← Previous</Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

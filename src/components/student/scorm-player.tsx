"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type ScormState,
  type ScormStatus,
  lessonStatusToStatus,
  statusToLessonStatus,
  completionSuccessToStatus,
  statusToCompletionStatus,
  statusToSuccessStatus,
} from "@/lib/scorm/cmi-mapping";

declare global {
  interface Window {
    API?: Record<string, (...args: string[]) => string>;
    API_1484_11?: Record<string, (...args: string[]) => string>;
  }
}

interface ScormPlayerProps {
  courseId: string;
  courseTitle: string;
  instructorName: string;
  entryUrl: string;
  version: "SCORM_12" | "SCORM_2004";
  enrollmentCompleted: boolean;
  initial: {
    status: ScormStatus | null;
    scoreRaw: number | null;
    scoreMin: number | null;
    scoreMax: number | null;
    suspendData: string | null;
    location: string | null;
  };
}

const ERR_NONE = "0";
const ERR_NOT_INITIALIZED = "301";

function numOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function scaledScore(state: ScormState): string {
  if (state.scoreRaw == null || state.scoreMin == null || state.scoreMax == null) return "";
  const range = state.scoreMax - state.scoreMin;
  if (range <= 0) return "";
  const scaled = (state.scoreRaw - state.scoreMin) / range;
  return String(Math.max(-1, Math.min(1, scaled)));
}

export function ScormPlayer({
  courseId,
  courseTitle,
  instructorName,
  entryUrl,
  version,
  enrollmentCompleted: initialCompleted,
  initial,
}: ScormPlayerProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Seeded from the enrollment's saved SCORM state (fetched server-side),
    // so a returning learner resumes instead of restarting the package.
    const state: ScormState = {
      status: initial.status ?? "NOT_ATTEMPTED",
      scoreRaw: initial.scoreRaw,
      scoreMin: initial.scoreMin,
      scoreMax: initial.scoreMax,
      suspendData: initial.suspendData ?? "",
      location: initial.location ?? "",
    };
    // SCORM 2004 tracks completion/success as two independent fields; seed
    // both from the derived status so a package that only queries one of
    // them still sees something consistent.
    let completionStatus = statusToCompletionStatus(state.status);
    let successStatus = statusToSuccessStatus(state.status);

    let initialized = false;
    let lastError = ERR_NONE;
    // Only auto-navigate on a genuine new completion this session — a
    // returning learner reopening an already-completed package (which often
    // re-commits "completed" on relaunch) shouldn't get bounced away from
    // content they're just reviewing.
    let hasRedirected = false;

    const flush = (finalCall: boolean) => {
      const payload = JSON.stringify({
        status: state.status,
        scoreRaw: state.scoreRaw,
        scoreMin: state.scoreMin,
        scoreMax: state.scoreMax,
        suspendData: state.suspendData,
        location: state.location,
      });
      const url = `/api/courses/${courseId}/scorm-progress`;
      if (finalCall && navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
      } else {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: finalCall,
        }).catch(() => {});
      }
      if (state.status === "COMPLETED" || state.status === "PASSED") {
        setCompleted(true);
        if (!initialCompleted && !hasRedirected) {
          hasRedirected = true;
          router.push(`/student/learn/${courseId}/complete`);
        }
      }
    };

    const api12: Record<string, (...args: string[]) => string> = {
      LMSInitialize: () => {
        initialized = true;
        lastError = ERR_NONE;
        return "true";
      },
      LMSFinish: () => {
        if (!initialized) {
          lastError = ERR_NOT_INITIALIZED;
          return "false";
        }
        flush(true);
        initialized = false;
        lastError = ERR_NONE;
        return "true";
      },
      LMSGetValue: (name: string) => {
        if (!initialized) {
          lastError = ERR_NOT_INITIALIZED;
          return "";
        }
        lastError = ERR_NONE;
        switch (name) {
          case "cmi.core.lesson_status":
            return statusToLessonStatus(state.status);
          case "cmi.core.score.raw":
            return state.scoreRaw != null ? String(state.scoreRaw) : "";
          case "cmi.core.score.min":
            return state.scoreMin != null ? String(state.scoreMin) : "";
          case "cmi.core.score.max":
            return state.scoreMax != null ? String(state.scoreMax) : "";
          case "cmi.core.lesson_location":
            return state.location;
          case "cmi.suspend_data":
            return state.suspendData;
          case "cmi.core.entry":
            return state.location || state.suspendData ? "resume" : "ab-initio";
          case "cmi.core.credit":
            return "credit";
          case "cmi.core.lesson_mode":
            return "normal";
          case "cmi.core.student_id":
            return "student";
          case "cmi.core.student_name":
            return "Student";
          case "cmi.launch_data":
            return "";
          default:
            return "";
        }
      },
      LMSSetValue: (name: string, value: string) => {
        if (!initialized) {
          lastError = ERR_NOT_INITIALIZED;
          return "false";
        }
        lastError = ERR_NONE;
        switch (name) {
          case "cmi.core.lesson_status": {
            const mapped = lessonStatusToStatus(value);
            if (mapped) state.status = mapped;
            break;
          }
          case "cmi.core.score.raw":
            state.scoreRaw = numOrNull(value);
            break;
          case "cmi.core.score.min":
            state.scoreMin = numOrNull(value);
            break;
          case "cmi.core.score.max":
            state.scoreMax = numOrNull(value);
            break;
          case "cmi.core.lesson_location":
            state.location = value;
            break;
          case "cmi.suspend_data":
            state.suspendData = value;
            break;
          default:
            break; // unknown/optional elements: accept and ignore rather than error
        }
        return "true";
      },
      LMSCommit: () => {
        if (!initialized) {
          lastError = ERR_NOT_INITIALIZED;
          return "false";
        }
        flush(false);
        lastError = ERR_NONE;
        return "true";
      },
      LMSGetLastError: () => lastError,
      LMSGetErrorString: (code: string) => (code === ERR_NONE ? "No error" : "Error"),
      LMSGetDiagnostic: () => "",
    };

    const api2004: Record<string, (...args: string[]) => string> = {
      Initialize: () => {
        initialized = true;
        lastError = ERR_NONE;
        return "true";
      },
      Terminate: () => {
        if (!initialized) {
          lastError = ERR_NOT_INITIALIZED;
          return "false";
        }
        flush(true);
        initialized = false;
        lastError = ERR_NONE;
        return "true";
      },
      GetValue: (name: string) => {
        if (!initialized) {
          lastError = ERR_NOT_INITIALIZED;
          return "";
        }
        lastError = ERR_NONE;
        switch (name) {
          case "cmi.completion_status":
            return completionStatus;
          case "cmi.success_status":
            return successStatus;
          case "cmi.score.raw":
            return state.scoreRaw != null ? String(state.scoreRaw) : "";
          case "cmi.score.min":
            return state.scoreMin != null ? String(state.scoreMin) : "";
          case "cmi.score.max":
            return state.scoreMax != null ? String(state.scoreMax) : "";
          case "cmi.score.scaled":
            return scaledScore(state);
          case "cmi.location":
            return state.location;
          case "cmi.suspend_data":
            return state.suspendData;
          case "cmi.entry":
            return state.location || state.suspendData ? "resume" : "ab-initio";
          case "cmi.credit":
            return "credit";
          case "cmi.mode":
            return "normal";
          case "cmi.learner_id":
            return "student";
          case "cmi.learner_name":
            return "Student";
          default:
            return "";
        }
      },
      SetValue: (name: string, value: string) => {
        if (!initialized) {
          lastError = ERR_NOT_INITIALIZED;
          return "false";
        }
        lastError = ERR_NONE;
        switch (name) {
          case "cmi.completion_status":
            completionStatus = value;
            state.status = completionSuccessToStatus(completionStatus, successStatus) ?? state.status;
            break;
          case "cmi.success_status":
            successStatus = value;
            state.status = completionSuccessToStatus(completionStatus, successStatus) ?? state.status;
            break;
          case "cmi.score.raw":
            state.scoreRaw = numOrNull(value);
            break;
          case "cmi.score.min":
            state.scoreMin = numOrNull(value);
            break;
          case "cmi.score.max":
            state.scoreMax = numOrNull(value);
            break;
          case "cmi.location":
            state.location = value;
            break;
          case "cmi.suspend_data":
            state.suspendData = value;
            break;
          default:
            break;
        }
        return "true";
      },
      Commit: () => {
        if (!initialized) {
          lastError = ERR_NOT_INITIALIZED;
          return "false";
        }
        flush(false);
        lastError = ERR_NONE;
        return "true";
      },
      GetLastError: () => lastError,
      GetErrorString: (code: string) => (code === ERR_NONE ? "No error" : "Error"),
      GetDiagnostic: () => "",
    };

    // SCORM content walks window.parent/window.opener looking for these —
    // they must live on this hosting page, not inside the iframe. The iframe
    // itself is rendered with no `src` (see JSX below) and only pointed at
    // the package here, imperatively, after the API is installed — setting
    // `src` any earlier risks the package's own script looking up window.API
    // before this line runs and giving up.
    if (version === "SCORM_2004") {
      window.API_1484_11 = api2004;
    } else {
      window.API = api12;
    }
    if (iframeRef.current) iframeRef.current.src = entryUrl;

    return () => {
      if (version === "SCORM_2004") delete window.API_1484_11;
      else delete window.API;
    };
  }, [courseId, version, initial, initialCompleted, router, entryUrl]);

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 flex-shrink-0">
        <div>
          <Link href="/courses" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 mb-1 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            My Courses
          </Link>
          <h1 className="text-sm font-semibold text-slate-900">{courseTitle}</h1>
          <p className="text-xs text-slate-400">by {instructorName}</p>
        </div>
        {completed && (
          <Button size="sm" variant="outline" asChild className="text-amber-700 border-amber-300 hover:bg-amber-100">
            <Link href={`/student/learn/${courseId}/complete`}>
              <Award className="h-4 w-4 mr-1.5" />
              View Certificate
            </Link>
          </Button>
        )}
      </header>
      <main className="flex-1">
        <iframe ref={iframeRef} className="w-full h-full border-0" title={courseTitle} />
      </main>
    </div>
  );
}

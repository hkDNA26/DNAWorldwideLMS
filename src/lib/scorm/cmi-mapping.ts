export type ScormStatus = "NOT_ATTEMPTED" | "INCOMPLETE" | "COMPLETED" | "PASSED" | "FAILED" | "BROWSED";

export interface ScormState {
  status: ScormStatus;
  scoreRaw: number | null;
  scoreMin: number | null;
  scoreMax: number | null;
  suspendData: string;
  location: string;
}

export const EMPTY_SCORM_STATE: ScormState = {
  status: "NOT_ATTEMPTED",
  scoreRaw: null,
  scoreMin: null,
  scoreMax: null,
  suspendData: "",
  location: "",
};

const LESSON_STATUS_TO_STATUS: Record<string, ScormStatus> = {
  passed: "PASSED",
  completed: "COMPLETED",
  failed: "FAILED",
  incomplete: "INCOMPLETE",
  browsed: "BROWSED",
  "not attempted": "NOT_ATTEMPTED",
};

const STATUS_TO_LESSON_STATUS: Record<ScormStatus, string> = {
  PASSED: "passed",
  COMPLETED: "completed",
  FAILED: "failed",
  INCOMPLETE: "incomplete",
  BROWSED: "browsed",
  NOT_ATTEMPTED: "not attempted",
};

/** SCORM 1.2 `cmi.core.lesson_status` (a single field) -> our internal status. */
export function lessonStatusToStatus(value: string): ScormStatus | null {
  return LESSON_STATUS_TO_STATUS[value] ?? null;
}

export function statusToLessonStatus(status: ScormStatus): string {
  return STATUS_TO_LESSON_STATUS[status];
}

/** SCORM 2004 splits completion into two independent fields; derive one
 * internal status so both versions persist onto the same Enrollment columns. */
export function completionSuccessToStatus(completionStatus: string, successStatus: string): ScormStatus | null {
  if (successStatus === "passed") return "PASSED";
  if (successStatus === "failed") return "FAILED";
  if (completionStatus === "completed") return "COMPLETED";
  if (completionStatus === "incomplete") return "INCOMPLETE";
  if (completionStatus === "not attempted") return "NOT_ATTEMPTED";
  return null;
}

export function statusToCompletionStatus(status: ScormStatus): string {
  switch (status) {
    case "PASSED":
    case "FAILED":
    case "COMPLETED":
      return "completed";
    case "INCOMPLETE":
    case "BROWSED":
      return "incomplete";
    case "NOT_ATTEMPTED":
      return "not attempted";
  }
}

export function statusToSuccessStatus(status: ScormStatus): string {
  switch (status) {
    case "PASSED":
      return "passed";
    case "FAILED":
      return "failed";
    default:
      return "unknown";
  }
}

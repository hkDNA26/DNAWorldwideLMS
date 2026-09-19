import { db } from "@/lib/db";
import { syncCourseProgressToSheet } from "@/lib/sheets";

/** Marks an enrollment complete and issues a certificate, idempotently.
 * Shared by lesson-based completion (/api/progress) and SCORM completion
 * (/api/courses/[courseId]/scorm-progress) so both flows converge on the
 * same Certificate row and Google Sheets side-effect. */
export async function markCourseComplete(enrollmentId: string, studentId: string, courseId: string): Promise<void> {
  const enrollment = await db.enrollment.findUnique({ where: { id: enrollmentId }, select: { completedAt: true } });
  if (enrollment?.completedAt) return;

  await db.enrollment.update({
    where: { id: enrollmentId },
    data: { completedAt: new Date() },
  });

  const existing = await db.certificate.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
  });
  if (existing) return;

  await db.certificate.create({ data: { studentId, courseId } });

  syncCourseProgressToSheet().catch((err) => console.error("Google Sheets update failed:", err));
}

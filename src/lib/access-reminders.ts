import { db } from "@/lib/db";
import { getResource } from "@/lib/resources";
import { sendAccessReminderEmail } from "@/lib/email";

const FIRST_REMINDER_AFTER_MS = 5 * 24 * 60 * 60 * 1000;
const REPEAT_REMINDER_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

interface PendingItem {
  label: string;
  url: string;
}

/**
 * Finds every course/resource grant whose assignment email went unopened,
 * and sends one consolidated nudge per student: first reminder 5 days after
 * the original notification, then weekly for as long as it stays unopened.
 * Rows with notifiedAt = null predate this system (or were never emailed)
 * and are intentionally left alone.
 */
export async function runAccessReminderSweep() {
  const now = new Date();
  const dueForFirstReminder = new Date(now.getTime() - FIRST_REMINDER_AFTER_MS);
  const dueForRepeatReminder = new Date(now.getTime() - REPEAT_REMINDER_AFTER_MS);

  const [dueEnrollments, dueResourceAccess] = await Promise.all([
    db.enrollment.findMany({
      where: {
        firstAccessedAt: null,
        notifiedAt: { not: null },
        OR: [
          { lastReminderAt: null, notifiedAt: { lte: dueForFirstReminder } },
          { lastReminderAt: { lte: dueForRepeatReminder } },
        ],
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { title: true } },
      },
    }),
    db.resourceAccess.findMany({
      where: {
        firstAccessedAt: null,
        notifiedAt: { not: null },
        OR: [
          { lastReminderAt: null, notifiedAt: { lte: dueForFirstReminder } },
          { lastReminderAt: { lte: dueForRepeatReminder } },
        ],
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  if (dueEnrollments.length === 0 && dueResourceAccess.length === 0) return;

  const byStudent = new Map<string, { name: string; email: string; items: PendingItem[] }>();
  const touchedEnrollmentIds: string[] = [];
  const touchedResourceAccessIds: string[] = [];

  for (const enr of dueEnrollments) {
    const entry = byStudent.get(enr.student.id) ?? { name: enr.student.name, email: enr.student.email, items: [] };
    entry.items.push({ label: enr.course.title, url: `${appUrl()}/student/learn/${enr.courseId}` });
    byStudent.set(enr.student.id, entry);
    touchedEnrollmentIds.push(enr.id);
  }

  for (const grant of dueResourceAccess) {
    const def = getResource(grant.resource);
    const entry = byStudent.get(grant.user.id) ?? { name: grant.user.name, email: grant.user.email, items: [] };
    entry.items.push({ label: def.label, url: `${appUrl()}${def.href}` });
    byStudent.set(grant.user.id, entry);
    touchedResourceAccessIds.push(grant.id);
  }

  for (const { name, email, items } of byStudent.values()) {
    try {
      await sendAccessReminderEmail(email, name, items);
    } catch (err) {
      console.error(`Failed to send access reminder to ${email}:`, err);
    }
  }

  await Promise.all([
    touchedEnrollmentIds.length > 0 &&
      db.enrollment.updateMany({ where: { id: { in: touchedEnrollmentIds } }, data: { lastReminderAt: now } }),
    touchedResourceAccessIds.length > 0 &&
      db.resourceAccess.updateMany({ where: { id: { in: touchedResourceAccessIds } }, data: { lastReminderAt: now } }),
  ]);
}

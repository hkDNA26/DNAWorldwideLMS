import { db } from "@/lib/db";
import { getResource } from "@/lib/resources";
import { sendCourseAssignedEmail, sendResourceAssignedEmail } from "@/lib/email";
import type { ResourceKey } from "@/generated/prisma/enums";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

/**
 * Enrols a student in a course. When `notify` is true (assigning a course to
 * an already-onboarded student), sends the "you've been enrolled" email and
 * stamps notifiedAt so the reminder sweep can track whether they opened it.
 * When false (course picked at account creation), the welcome email already
 * covers it — no separate email, no notifiedAt stamp.
 */
export async function grantCourseAccess(
  courseId: string,
  student: { id: string; name: string; email: string },
  courseTitle: string,
  { notify }: { notify: boolean }
) {
  const enrollment = await db.enrollment.create({
    data: {
      studentId: student.id,
      courseId,
      ...(notify && { notifiedAt: new Date() }),
    },
  });

  if (notify) {
    const courseUrl = `${appUrl()}/student/learn/${courseId}`;
    try {
      await sendCourseAssignedEmail(student.email, student.name, courseTitle, courseUrl);
    } catch (err) {
      console.error(`Failed to send course-assigned email to ${student.email}:`, err);
    }
  }

  return enrollment;
}

/**
 * Grants a student access to a resource (Drug Search Console, Alcohol Unit
 * Calculator, ...). Same notify/notifiedAt semantics as grantCourseAccess.
 */
export async function grantResourceAccess(
  resource: ResourceKey,
  student: { id: string; name: string; email: string },
  { notify }: { notify: boolean }
) {
  const access = await db.resourceAccess.create({
    data: {
      userId: student.id,
      resource,
      ...(notify && { notifiedAt: new Date() }),
    },
  });

  if (notify) {
    const def = getResource(resource);
    const resourceUrl = `${appUrl()}${def.href}`;
    try {
      await sendResourceAssignedEmail(student.email, student.name, def.label, resourceUrl);
    } catch (err) {
      console.error(`Failed to send resource-assigned email to ${student.email}:`, err);
    }
  }

  return access;
}

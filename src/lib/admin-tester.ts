import { db } from "@/lib/db";

// The admin account used to preview/test new courses as a student. Enrollment is
// matched by email, since local/production user ids diverge across environments.
const ADMIN_TESTER_EMAIL = "hemmak@dnaworkplace.com";

/**
 * Auto-enrolls the admin tester in a newly created course so they can open it under
 * Student → Catalog and try it exactly as a student would, without a manual enrollment
 * step. Best-effort: a missing tester account shouldn't block course creation.
 */
export async function enrollAdminTester(courseId: string) {
  const tester = await db.user.findUnique({ where: { email: ADMIN_TESTER_EMAIL } });
  if (!tester) return;

  await db.enrollment.upsert({
    where: { studentId_courseId: { studentId: tester.id, courseId } },
    create: { studentId: tester.id, courseId },
    update: {},
  });
}

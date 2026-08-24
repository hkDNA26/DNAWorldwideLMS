import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";
import { TENDER_COURSE_TITLES } from "../src/lib/tender";

async function main() {
  const tenderCourses = await db.course.findMany({ where: { title: { in: TENDER_COURSE_TITLES } } });
  if (tenderCourses.length === 0) throw new Error("No Tender courses found");
  tenderCourses.forEach((c) => console.log("Tender course:", c.id, c.title));

  const org = await db.organization.upsert({
    where: { id: "demo-org-swansea-council" },
    update: { name: "Swansea Council" },
    create: { id: "demo-org-swansea-council", name: "Swansea Council", logoUrl: null },
  });
  console.log("Org:", org.id, org.name);

  const passwordHash = await bcrypt.hash("TenderDemo123!", 12);
  const user = await db.user.upsert({
    where: { email: "tender-demo@swansea.gov.uk" },
    update: { role: "TENDER", organizationId: org.id, passwordHash },
    create: {
      id: "demo-tender-swansea-001",
      name: "Swansea Council (Demo)",
      email: "tender-demo@swansea.gov.uk",
      passwordHash,
      role: "TENDER",
      organizationId: org.id,
    },
  });
  console.log("Tender user:", user.id, user.email);

  for (const c of tenderCourses) {
    await db.enrollment.upsert({
      where: { studentId_courseId: { studentId: user.id, courseId: c.id } },
      update: {},
      create: { studentId: user.id, courseId: c.id },
    });
  }
  console.log("Enrolled in Tender course(s).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());

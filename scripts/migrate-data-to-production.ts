// One-off: copies newly-built feature data from local dev DB to production, since the
// two databases share schema (via migrations) but have diverged on actual rows/IDs.
// Only touches tables that are empty in production (Clinic, Collector, VideoResource,
// Organization) or adds specific new rows (tender demo user + enrollments, the Andy &
// Kate course tree) — never modifies or duplicates existing production data.
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const LOCAL_URL = "postgresql://hemmadna@localhost:5432/forge_lms";
const PROD_URL = "postgresql://postgres:wLwRkYFqfLNZxipUABvhQIiQPsaUTYYN@zephyr.proxy.rlwy.net:27148/railway";

const local = new PrismaClient({ adapter: new PrismaPg({ connectionString: LOCAL_URL }) });
const prod = new PrismaClient({ adapter: new PrismaPg({ connectionString: PROD_URL }) });

// ID remaps: local ID -> production ID, for rows that already exist on both sides
// under different IDs.
const PROD_ADMIN_ID = "f6510818-ee8f-46f4-b939-9ade98d31005"; // hemmak@dnaworkplace.com
const PROD_ISO_COURSE_ID = "cms5hwkim00001yqnrugom1n6"; // "Information Security & 27001"
const PROD_ACCESS_COURSE_ID = "cmscqbqlb00011ypef9hfbdzq"; // "Access & Passwords"

async function main() {
  // --- Clinic (bulk copy, empty on prod) ---
  const clinics = await local.clinic.findMany();
  for (const c of clinics) {
    const data = { ...c, additionalInfo: c.additionalInfo ?? undefined };
    await prod.clinic.upsert({ where: { id: c.id }, update: data, create: data });
  }
  console.log(`Clinic: ${clinics.length} rows`);

  // --- Collector (bulk copy, empty on prod) ---
  const collectors = await local.collector.findMany();
  for (const c of collectors) await prod.collector.upsert({ where: { id: c.id }, update: c, create: c });
  console.log(`Collector: ${collectors.length} rows`);

  // --- VideoResource (bulk copy, empty on prod) ---
  const videos = await local.videoResource.findMany();
  for (const v of videos) await prod.videoResource.upsert({ where: { id: v.id }, update: v, create: v });
  console.log(`VideoResource: ${videos.length} rows`);

  // --- Organization (Swansea Council demo) ---
  const org = await local.organization.findUnique({ where: { id: "demo-org-swansea-council" } });
  if (org) {
    await prod.organization.upsert({ where: { id: org.id }, update: org, create: org });
    console.log("Organization: Swansea Council");
  }

  // --- Andy & Kate course tree (fresh IDs reused as-is, instructorId remapped) ---
  const course = await local.course.findUnique({ where: { id: "cpd-drug-testing-andy-kate" } });
  if (course) {
    const { instructorId: _unused, ...courseRest } = course;
    await prod.course.upsert({
      where: { id: course.id },
      update: { ...courseRest, instructorId: PROD_ADMIN_ID },
      create: { ...courseRest, instructorId: PROD_ADMIN_ID },
    });
    const modules = await local.module.findMany({ where: { courseId: course.id } });
    for (const m of modules) await prod.module.upsert({ where: { id: m.id }, update: m, create: m });
    const lessons = await local.lesson.findMany({ where: { module: { courseId: course.id } } });
    for (const l of lessons) await prod.lesson.upsert({ where: { id: l.id }, update: l, create: l });
    console.log(`Course tree: ${course.title} (${modules.length} module(s), ${lessons.length} lesson(s))`);
  }

  // --- Tender demo user (org already copied above, so FK resolves) ---
  const tenderUser = await local.user.findUnique({ where: { id: "demo-tender-swansea-001" } });
  if (tenderUser) {
    await prod.user.upsert({ where: { id: tenderUser.id }, update: tenderUser, create: tenderUser });
    console.log("User: tender-demo@swansea.gov.uk");
  }

  // --- Enrollments: tender demo -> ISO (remapped course id) + Andy & Kate (same id) ---
  if (tenderUser) {
    await prod.enrollment.upsert({
      where: { studentId_courseId: { studentId: tenderUser.id, courseId: PROD_ISO_COURSE_ID } },
      update: {},
      create: { studentId: tenderUser.id, courseId: PROD_ISO_COURSE_ID },
    });
    if (course) {
      await prod.enrollment.upsert({
        where: { studentId_courseId: { studentId: tenderUser.id, courseId: course.id } },
        update: {},
        create: { studentId: tenderUser.id, courseId: course.id },
      });
    }
    console.log("Enrolled tender-demo in ISO + Andy & Kate");
  }

  // --- Enroll production admin in every production course (mirrors local "enrol admin
  // in everything" request) ---
  const prodCourseIds = [PROD_ISO_COURSE_ID, PROD_ACCESS_COURSE_ID, ...(course ? [course.id] : [])];
  for (const courseId of prodCourseIds) {
    await prod.enrollment.upsert({
      where: { studentId_courseId: { studentId: PROD_ADMIN_ID, courseId } },
      update: {},
      create: { studentId: PROD_ADMIN_ID, courseId },
    });
  }
  console.log(`Enrolled production admin in ${prodCourseIds.length} course(s)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await local.$disconnect();
    await prod.$disconnect();
  });

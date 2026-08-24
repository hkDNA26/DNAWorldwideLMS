// One-off: adds the DNA Legal "Andy & Kate" drug-testing CPD module as a
// Course with a single EXTERNAL lesson embedding the Railway-hosted app.
// Idempotent — safe to re-run (upserts by fixed ids).
import "dotenv/config"; // src/lib/db.ts reads DATABASE_URL at import time; Next.js loads .env automatically but a standalone script must do it first.
import { db } from "../src/lib/db";

const INSTRUCTOR_EMAIL = "hemmak@dnaworkplace.com";
const TRAINING_URL = "https://cpd-training-web-production.up.railway.app/";

async function main() {
  const instructor = await db.user.findUnique({ where: { email: INSTRUCTOR_EMAIL } });
  if (!instructor) throw new Error(`Instructor ${INSTRUCTOR_EMAIL} not found`);

  const course = await db.course.upsert({
    where: { id: "cpd-drug-testing-andy-kate" },
    update: {},
    create: {
      id: "cpd-drug-testing-andy-kate",
      title: "Drug Testing: Andy & Kate (CPD)",
      description:
        "An interactive case study module — watch a fictionalised custody case unfold, make the same testing decisions a case worker would, then see what a real 9-panel hair test actually revealed.",
      estimatedTime: "~10 minutes",
      status: "DRAFT", // flip to PUBLISHED in the instructor UI once reviewed
      type: "STANDARD",
      instructorId: instructor.id,
    },
  });
  console.log("Course:", course.id, course.title, `(${course.status})`);

  const learningModule = await db.module.upsert({
    where: { id: "cpd-drug-testing-andy-kate-module" },
    update: {},
    create: {
      id: "cpd-drug-testing-andy-kate-module",
      courseId: course.id,
      title: "Training",
      orderIndex: 0,
    },
  });
  console.log("Module:", learningModule.id, learningModule.title);

  const lesson = await db.lesson.upsert({
    where: { id: "cpd-drug-testing-andy-kate-lesson" },
    update: { content: TRAINING_URL },
    create: {
      id: "cpd-drug-testing-andy-kate-lesson",
      moduleId: learningModule.id,
      title: "Drug Testing Training: Andy & Kate",
      orderIndex: 0,
      contentType: "EXTERNAL",
      content: TRAINING_URL,
    },
  });
  console.log("Lesson:", lesson.id, lesson.title, "->", lesson.content);
}

main()
  .then(() => db.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await db.$disconnect();
    process.exit(1);
  });

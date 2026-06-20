import "dotenv/config";
// @ts-ignore - path resolved at runtime from prisma/ directory
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// @ts-expect-error Prisma 7 adapter API
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  console.log("Seeding database...");

  // Clean up existing data
  await db.certificate.deleteMany();
  await db.lessonProgress.deleteMany();
  await db.quizAttempt.deleteMany();
  await db.enrollment.deleteMany();
  await db.attemptAnswer.deleteMany();
  await db.answerOption.deleteMany();
  await db.question.deleteMany();
  await db.quiz.deleteMany();
  await db.lesson.deleteMany();
  await db.module.deleteMany();
  await db.course.deleteMany();
  await db.user.deleteMany();

  // Create instructor
  const instructor = await db.user.create({
    data: {
      name: "Alex Rivera",
      email: "instructor@forge.dev",
      passwordHash: await bcrypt.hash("password123", 12),
      role: "INSTRUCTOR",
    },
  });
  console.log("Created instructor:", instructor.email);

  // Create student
  const student = await db.user.create({
    data: {
      name: "Jordan Chen",
      email: "student@forge.dev",
      passwordHash: await bcrypt.hash("password123", 12),
      role: "STUDENT",
    },
  });
  console.log("Created student:", student.email);

  // Create course
  const course = await db.course.create({
    data: {
      title: "Introduction to Web Development",
      description:
        "Learn the fundamentals of web development — HTML, CSS, JavaScript, and beyond. This course takes you from zero to building your first interactive websites.",
      status: "PUBLISHED",
      instructorId: instructor.id,
    },
  });
  console.log("Created course:", course.title);

  // Module 1
  const module1 = await db.module.create({
    data: { courseId: course.id, title: "HTML Fundamentals", orderIndex: 0 },
  });

  const lesson1 = await db.lesson.create({
    data: {
      moduleId: module1.id,
      title: "What is HTML?",
      orderIndex: 0,
      contentType: "TEXT",
      content: `<h1>What is HTML?</h1>
<p>HTML (HyperText Markup Language) is the standard language for creating web pages. It describes the structure of a web page using <strong>elements</strong> represented by tags.</p>
<h2>Your First HTML Page</h2>
<p>Every HTML page has a basic structure:</p>
<ul>
  <li><strong>&lt;html&gt;</strong> — the root element</li>
  <li><strong>&lt;head&gt;</strong> — metadata about the document</li>
  <li><strong>&lt;body&gt;</strong> — the visible page content</li>
</ul>
<p>HTML is the backbone of the web. Once you understand its structure, learning CSS (for styling) and JavaScript (for interactivity) becomes much easier.</p>`,
    },
  });

  const lesson2 = await db.lesson.create({
    data: {
      moduleId: module1.id,
      title: "HTML Tags & Elements",
      orderIndex: 1,
      contentType: "TEXT",
      content: `<h1>HTML Tags & Elements</h1>
<p>HTML uses <strong>tags</strong> to define elements. Tags are enclosed in angle brackets and usually come in pairs — an opening tag and a closing tag.</p>
<h2>Common Tags</h2>
<ul>
  <li><strong>&lt;h1&gt; to &lt;h6&gt;</strong> — Headings</li>
  <li><strong>&lt;p&gt;</strong> — Paragraph</li>
  <li><strong>&lt;a href="..."&gt;</strong> — Hyperlink</li>
  <li><strong>&lt;img src="..."&gt;</strong> — Image</li>
  <li><strong>&lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;</strong> — Lists</li>
  <li><strong>&lt;div&gt;</strong> — Generic container</li>
</ul>
<p>Elements can be <em>nested</em> inside each other to create more complex structures.</p>`,
    },
  });

  // Quiz lesson in Module 1
  const quizLesson1 = await db.lesson.create({
    data: {
      moduleId: module1.id,
      title: "HTML Knowledge Check",
      orderIndex: 2,
      contentType: "QUIZ",
    },
  });

  const quiz1 = await db.quiz.create({
    data: {
      lessonId: quizLesson1.id,
      title: "HTML Fundamentals Quiz",
      passingScore: 70,
    },
  });

  const q1 = await db.question.create({
    data: {
      quizId: quiz1.id,
      questionText: "What does HTML stand for?",
      type: "MULTIPLE_CHOICE",
      orderIndex: 0,
      answerOptions: {
        create: [
          { text: "HyperText Markup Language", isCorrect: true },
          { text: "HighText Machine Language", isCorrect: false },
          { text: "Hyperlink Text Markup Language", isCorrect: false },
          { text: "HyperText Modern Language", isCorrect: false },
        ],
      },
    },
  });

  const q2 = await db.question.create({
    data: {
      quizId: quiz1.id,
      questionText: "Is the <img> tag a self-closing tag?",
      type: "TRUE_FALSE",
      orderIndex: 1,
      answerOptions: {
        create: [
          { text: "True", isCorrect: true },
          { text: "False", isCorrect: false },
        ],
      },
    },
  });

  const q3 = await db.question.create({
    data: {
      quizId: quiz1.id,
      questionText: "Which tag is used to create a hyperlink in HTML?",
      type: "MULTIPLE_CHOICE",
      orderIndex: 2,
      answerOptions: {
        create: [
          { text: "<link>", isCorrect: false },
          { text: "<a>", isCorrect: true },
          { text: "<href>", isCorrect: false },
          { text: "<url>", isCorrect: false },
        ],
      },
    },
  });

  // Module 2
  const module2 = await db.module.create({
    data: { courseId: course.id, title: "CSS Styling", orderIndex: 1 },
  });

  const lesson3 = await db.lesson.create({
    data: {
      moduleId: module2.id,
      title: "Introduction to CSS",
      orderIndex: 0,
      contentType: "TEXT",
      content: `<h1>Introduction to CSS</h1>
<p>CSS (Cascading Style Sheets) controls the visual presentation of HTML elements. While HTML provides structure, CSS provides style.</p>
<h2>How CSS Works</h2>
<p>CSS works by selecting HTML elements and applying styles to them:</p>
<ul>
  <li><strong>Selectors</strong> — identify which elements to style</li>
  <li><strong>Properties</strong> — what aspect to change (color, font, margin...)</li>
  <li><strong>Values</strong> — the setting for that property</li>
</ul>
<h2>Example</h2>
<p>To make all paragraphs blue with 16px font:</p>
<p><em>p { color: blue; font-size: 16px; }</em></p>
<p>CSS can be included inline, in a &lt;style&gt; tag, or in a separate .css file (recommended).</p>`,
    },
  });

  const lesson4 = await db.lesson.create({
    data: {
      moduleId: module2.id,
      title: "CSS Box Model",
      orderIndex: 1,
      contentType: "TEXT",
      content: `<h1>The CSS Box Model</h1>
<p>Every HTML element is a rectangular box. The <strong>box model</strong> describes the space an element takes up:</p>
<ul>
  <li><strong>Content</strong> — the actual text or image</li>
  <li><strong>Padding</strong> — space between content and border</li>
  <li><strong>Border</strong> — the edge around the padding</li>
  <li><strong>Margin</strong> — space outside the border</li>
</ul>
<p>Understanding the box model is key to controlling layout in CSS. Use <em>box-sizing: border-box</em> to make sizing predictable — the padding and border are included within the width and height.</p>`,
    },
  });

  // Module 3
  const module3 = await db.module.create({
    data: { courseId: course.id, title: "JavaScript Basics", orderIndex: 2 },
  });

  const lesson5 = await db.lesson.create({
    data: {
      moduleId: module3.id,
      title: "Your First JavaScript",
      orderIndex: 0,
      contentType: "TEXT",
      content: `<h1>Your First JavaScript</h1>
<p>JavaScript brings interactivity to the web. It runs in the browser and can respond to user actions, manipulate HTML elements, fetch data, and much more.</p>
<h2>Getting Started</h2>
<p>Add JavaScript to your HTML with the &lt;script&gt; tag, or link a separate .js file:</p>
<p><em>&lt;script src="main.js"&gt;&lt;/script&gt;</em></p>
<h2>Variables</h2>
<p>Use <strong>const</strong> for values that won't change, and <strong>let</strong> for values that will:</p>
<ul>
  <li><em>const name = "Alice";</em></li>
  <li><em>let score = 0;</em></li>
</ul>
<p>JavaScript is the world's most popular programming language — learning it opens doors to web apps, mobile apps, servers, and more.</p>`,
    },
  });

  const quizLesson2 = await db.lesson.create({
    data: {
      moduleId: module3.id,
      title: "Final Course Quiz",
      orderIndex: 1,
      contentType: "QUIZ",
    },
  });

  const quiz2 = await db.quiz.create({
    data: {
      lessonId: quizLesson2.id,
      title: "Web Dev Foundations Quiz",
      passingScore: 75,
    },
  });

  await db.question.create({
    data: {
      quizId: quiz2.id,
      questionText: "CSS stands for Cascading Style Sheets.",
      type: "TRUE_FALSE",
      orderIndex: 0,
      answerOptions: {
        create: [
          { text: "True", isCorrect: true },
          { text: "False", isCorrect: false },
        ],
      },
    },
  });

  await db.question.create({
    data: {
      quizId: quiz2.id,
      questionText: "Which JavaScript keyword declares a variable that CANNOT be reassigned?",
      type: "MULTIPLE_CHOICE",
      orderIndex: 1,
      answerOptions: {
        create: [
          { text: "var", isCorrect: false },
          { text: "let", isCorrect: false },
          { text: "const", isCorrect: true },
          { text: "fixed", isCorrect: false },
        ],
      },
    },
  });

  await db.question.create({
    data: {
      quizId: quiz2.id,
      questionText: "In your own words, what is the purpose of the CSS box model?",
      type: "SHORT_ANSWER",
      orderIndex: 2,
    },
  });

  // Enroll the student
  const enrollment = await db.enrollment.create({
    data: { studentId: student.id, courseId: course.id },
  });

  // Mark first two lessons as complete for the student
  await db.lessonProgress.create({
    data: { enrollmentId: enrollment.id, lessonId: lesson1.id },
  });
  await db.lessonProgress.create({
    data: { enrollmentId: enrollment.id, lessonId: lesson2.id },
  });

  console.log("\n✅ Seed complete!");
  console.log("\nDemo accounts:");
  console.log("  Instructor: instructor@forge.dev / password123");
  console.log("  Student:    student@forge.dev / password123");
  console.log(`\nCourse "${course.title}" created with 3 modules and ${[lesson1, lesson2, quizLesson1, lesson3, lesson4, lesson5, quizLesson2].length} lessons.`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());

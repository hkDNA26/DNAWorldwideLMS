import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storage, downloadRemoteFile } from "@/lib/storage";
import { parseCourseWorkbook } from "@/lib/course-import/parse";

const IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const VIDEO_MIMES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];

export async function POST(request: Request) {
  try {
    const session = await requireAuth("ADMIN");

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ errors: ["No file provided"] }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      return NextResponse.json({ errors: ["Please upload an .xlsx file"] }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseCourseWorkbook(buffer);
    if (parsed.errors) {
      return NextResponse.json({ errors: parsed.errors }, { status: 400 });
    }
    const { course, parts } = parsed.data;

    // Download every remote asset before touching the database. Track what
    // succeeded so we can clean up on any later failure.
    const downloadedPaths: string[] = [];
    const cleanup = () => Promise.all(downloadedPaths.map((p) => storage.delete(p)));

    const bannerResult = await downloadRemoteFile(course.bannerImageUrl!, "covers", IMAGE_MIMES);
    if ("error" in bannerResult) {
      return NextResponse.json({ errors: [`Banner image: ${bannerResult.error}`] }, { status: 400 });
    }
    downloadedPaths.push(bannerResult.url);

    const partVideoUrls = new Map<number, string>();
    for (const part of parts) {
      const videoResult = await downloadRemoteFile(part.videoUrl, "videos", VIDEO_MIMES);
      if ("error" in videoResult) {
        await cleanup();
        return NextResponse.json(
          { errors: [`Part ${part.partNumber} ("${part.title}") video: ${videoResult.error}`] },
          { status: 400 }
        );
      }
      downloadedPaths.push(videoResult.url);
      partVideoUrls.set(part.partNumber, videoResult.url);
    }

    try {
      const createdCourse = await db.$transaction(async (tx) => {
        const newCourse = await tx.course.create({
          data: {
            title: course.title,
            description: course.description,
            estimatedTime: course.estimatedTime,
            coverImage: bannerResult.url,
            instructorId: session.userId,
          },
        });

        for (const [index, part] of parts.entries()) {
          const module = await tx.module.create({
            data: { courseId: newCourse.id, title: part.title, orderIndex: index },
          });

          await tx.lesson.create({
            data: {
              moduleId: module.id,
              title: part.title,
              orderIndex: 0,
              contentType: "VIDEO",
              videoUrl: partVideoUrls.get(part.partNumber)!,
            },
          });

          if (part.questions.length > 0) {
            await tx.lesson.create({
              data: {
                moduleId: module.id,
                title: `${part.title} Quiz`,
                orderIndex: 1,
                contentType: "QUIZ",
                quiz: {
                  create: {
                    title: `${part.title} Quiz`,
                    passingScore: 70,
                    questions: {
                      create: part.questions.map((q, qi) => ({
                        questionText: q.questionText,
                        type: q.type,
                        orderIndex: qi,
                        answerOptions: {
                          create: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
                        },
                      })),
                    },
                  },
                },
              },
            });
          }
        }

        return newCourse;
      });

      return NextResponse.json({ data: { courseId: createdCourse.id } }, { status: 201 });
    } catch (err) {
      await cleanup();
      throw err;
    }
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Course import error:", err);
    return NextResponse.json({ errors: ["Something went wrong while creating the course"] }, { status: 500 });
  }
}

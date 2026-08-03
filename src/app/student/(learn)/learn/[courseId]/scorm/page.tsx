import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ScormPlayer } from "@/components/student/scorm-player";

type Params = { courseId: string };

export default async function ScormLearnPage({ params }: { params: Promise<Params> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { courseId } = await params;

  const enrollment = await db.enrollment.findUnique({
    where: { studentId_courseId: { studentId: session.userId, courseId } },
  });
  if (!enrollment) redirect("/student/catalog");

  if (!enrollment.firstAccessedAt) {
    await db.enrollment.update({
      where: { id: enrollment.id },
      data: { firstAccessedAt: new Date() },
    });
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      type: true,
      instructor: { select: { name: true } },
      scormPackage: true,
    },
  });
  if (!course || course.type !== "SCORM" || !course.scormPackage) redirect("/student/catalog");

  const entryUrl = `/uploads/${course.scormPackage.extractedPath}/${course.scormPackage.entryPoint}`;

  return (
    <ScormPlayer
      courseId={course.id}
      courseTitle={course.title}
      instructorName={course.instructor.name}
      entryUrl={entryUrl}
      version={course.scormPackage.version}
      enrollmentCompleted={!!enrollment.completedAt}
      initial={{
        status: enrollment.scormStatus,
        scoreRaw: enrollment.scormScoreRaw,
        scoreMin: enrollment.scormScoreMin,
        scoreMax: enrollment.scormScoreMax,
        suspendData: enrollment.scormSuspendData,
        location: enrollment.scormLocation,
      }}
    />
  );
}

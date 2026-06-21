import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CongratulationsScreen } from "@/components/student/congratulations-screen";
import type { TemplateField } from "@/lib/certificate-defaults";

type Params = { courseId: string };

export default async function CourseCompletePage({ params }: { params: Promise<Params> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { courseId } = await params;

  const cert = await db.certificate.findUnique({
    where: { studentId_courseId: { studentId: session.userId, courseId } },
    include: {
      student: { select: { name: true } },
      course: {
        select: {
          title: true,
          instructor: {
            select: {
              name: true,
              certificateTemplate: { select: { imageUrl: true, fields: true } },
            },
          },
        },
      },
    },
  });

  if (!cert) notFound();

  const tpl = cert.course.instructor.certificateTemplate;

  return (
    <CongratulationsScreen
      cert={{
        studentName: cert.student.name,
        courseTitle: cert.course.title,
        instructorName: cert.course.instructor.name,
        issuedAt: cert.issuedAt.toISOString(),
        verificationCode: cert.verificationCode,
        templateImageUrl: tpl?.imageUrl ?? null,
        templateFields: tpl ? (tpl.fields as unknown as TemplateField[]) : null,
      }}
    />
  );
}

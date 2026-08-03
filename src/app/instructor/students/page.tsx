import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { StudentsManager } from "@/components/instructor/students-manager";

export default async function StudentsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [students, courses] = await Promise.all([
    db.user.findMany({
      where: { role: "STAFF" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.course.findMany({
      where: { instructorId: session.userId },
      select: { id: true, title: true, status: true },
      orderBy: { title: "asc" },
    }),
  ]);

  const initialStudents = students.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8 animate-brand-fade-up">
        <h1 className="text-2xl font-bold text-brand">Staff</h1>
        <p className="text-ink-soft mt-1">Create and manage staff accounts on DNA Worldwide.</p>
      </div>
      <StudentsManager initialStudents={initialStudents} courses={courses} />
    </div>
  );
}

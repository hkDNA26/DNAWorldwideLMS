import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { StudentsManager } from "@/components/instructor/students-manager";

export default async function StudentsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [students, courses] = await Promise.all([
    db.user.findMany({
      where: { role: "STUDENT" },
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#1a3d8f" }}>Students</h1>
        <p className="text-slate-500 mt-1">Create and manage student accounts on DNA Worldwide.</p>
      </div>
      <StudentsManager initialStudents={initialStudents} courses={courses} />
    </div>
  );
}

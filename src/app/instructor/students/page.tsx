import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { StudentsManager } from "@/components/instructor/students-manager";

export default async function StudentsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const students = await db.user.findMany({
    where: { role: "STUDENT" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const initialStudents = students.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Students</h1>
        <p className="text-slate-500 mt-1">Create and manage student accounts on DNA Worldwide LMS.</p>
      </div>
      <StudentsManager initialStudents={initialStudents} />
    </div>
  );
}

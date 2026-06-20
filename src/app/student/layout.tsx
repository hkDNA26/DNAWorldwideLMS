import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { StudentNav } from "@/components/student/nav";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-60 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <StudentNav userName={session.name} />
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

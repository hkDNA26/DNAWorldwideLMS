import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { InstructorNav } from "@/components/instructor/nav";

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-paper">
      <aside className="w-60 flex-shrink-0 bg-white border-r border-line flex flex-col">
        <InstructorNav userName={session.name} />
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

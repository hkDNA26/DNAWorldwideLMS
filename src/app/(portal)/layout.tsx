import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { TopNav } from "@/components/brand/top-nav";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const organization =
    session.role === "TENDER"
      ? await db.user
          .findUnique({ where: { id: session.userId }, select: { organization: true } })
          .then((u) => u?.organization ?? null)
      : null;

  return (
    <div className="min-h-screen bg-paper">
      <TopNav email={session.email} isAdmin={session.role === "ADMIN"} organization={organization} />
      <main className="max-w-5xl mx-auto px-6 py-9">{children}</main>
    </div>
  );
}

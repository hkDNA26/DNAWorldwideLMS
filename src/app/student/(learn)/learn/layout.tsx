import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || (session.role !== "STAFF" && session.role !== "TENDER" && session.role !== "ADMIN")) {
    redirect("/login");
  }
  return <>{children}</>;
}

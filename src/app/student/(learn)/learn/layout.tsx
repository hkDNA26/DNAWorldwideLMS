import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }
  return <>{children}</>;
}

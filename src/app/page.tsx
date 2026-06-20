import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();

  if (session) {
    if (session.role === "INSTRUCTOR") {
      redirect("/instructor/dashboard");
    } else {
      redirect("/student/dashboard");
    }
  }

  redirect("/login");
}

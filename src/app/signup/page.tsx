import { redirect } from "next/navigation";

// Open self-service signup was a privilege-escalation hole — accounts are now
// only ever created by an admin from the Staff section. Kept as a redirect so
// old bookmarks/links still land somewhere.
export default function SignupPage() {
  redirect("/login");
}

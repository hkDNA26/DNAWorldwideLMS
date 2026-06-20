"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function EnrollButton({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  async function enroll() {
    setLoading(true);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();
      if (res.ok) {
        addToast("Enrolled successfully!", "success");
        router.refresh();
      } else {
        addToast(data.error || "Enrollment failed", "error");
      }
    } catch {
      addToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" onClick={enroll} loading={loading} className="w-full">
      Enroll Now — Free
    </Button>
  );
}

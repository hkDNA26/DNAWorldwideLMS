"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const title = form.get("title") as string;
    const description = form.get("description") as string;

    if (!title?.trim()) {
      setError("Course title is required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create course");
        return;
      }

      router.push(`/instructor/courses/${data.data.id}/builder`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link
        href="/instructor/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create a new course</h1>
        <p className="text-slate-500 mt-1">You can add modules and lessons after creating the course.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="title"
            name="title"
            type="text"
            label="Course title"
            placeholder="e.g. Introduction to Web Development"
          />
          <Textarea
            id="description"
            name="description"
            label="Description"
            placeholder="What will students learn in this course?"
            rows={4}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}>
              Create Course
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/instructor/dashboard">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

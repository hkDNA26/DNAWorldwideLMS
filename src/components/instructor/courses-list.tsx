"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { BookOpen, Users, Edit3, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Course {
  id: string;
  title: string;
  status: string;
  coverImage: string | null;
  createdAt: string;
  _count: { enrollments: number; modules: number };
  enrollments: { completedAt: string | null }[];
}

export function CoursesList({ initialCourses }: { initialCourses: Course[] }) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const { addToast } = useToast();
  const router = useRouter();

  const handleDelete = async (id: string, title: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        addToast("Failed to delete course", "error");
        return;
      }
      setCourses((prev) => prev.filter((c) => c.id !== id));
      addToast(`"${title}" deleted`, "success");
      router.refresh();
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  return (
    <div className="space-y-3">
      {courses.map((course) => {
        const completions = course.enrollments.filter((e) => e.completedAt).length;
        const isConfirming = confirmId === course.id;
        const isDeleting = deletingId === course.id;

        return (
          <div key={course.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex-shrink-0 overflow-hidden">
              {course.coverImage ? (
                <img src={course.coverImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-7 w-7 text-indigo-300" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-slate-900 truncate">{course.title}</h3>
                <Badge variant={course.status === "PUBLISHED" ? "success" : "secondary"}>
                  {course.status === "PUBLISHED" ? "Published" : "Draft"}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {course._count.modules} modules
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {course._count.enrollments} students
                </span>
                <span className="text-slate-400">{completions} completions</span>
                <span className="text-slate-400">{formatDate(course.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isConfirming ? (
                <>
                  <span className="text-xs text-slate-500 mr-1">Delete?</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    loading={isDeleting}
                    onClick={() => handleDelete(course.id, course.title)}
                  >
                    Yes, delete
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setConfirmId(null)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/instructor/courses/${course.id}/builder`}>
                      <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                      Edit
                    </Link>
                  </Button>
                  <button
                    onClick={() => setConfirmId(course.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                    title="Delete course"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

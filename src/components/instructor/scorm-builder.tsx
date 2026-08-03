"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Edit3, Upload, PackageOpen, FileArchive, ImageIcon } from "lucide-react";
import type { Course, ScormPackage } from "@/types";

interface ScormBuilderProps {
  course: Course;
  scormPackage: ScormPackage | null;
}

export function ScormBuilder({ course: initialCourse, scormPackage: initialPackage }: ScormBuilderProps) {
  const { addToast } = useToast();
  const [course, setCourse] = useState(initialCourse);
  const [scormPackage, setScormPackage] = useState(initialPackage);
  const [editingCourse, setEditingCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: course.title, description: course.description });
  const [replacing, setReplacing] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const togglePublish = useCallback(async () => {
    const newStatus = course.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const res = await fetch(`/api/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setCourse((p) => ({ ...p, status: newStatus }));
      addToast(newStatus === "PUBLISHED" ? "Course published!" : "Course unpublished", "success");
    }
  }, [course.id, course.status, addToast]);

  const saveCourseInfo = useCallback(async () => {
    const res = await fetch(`/api/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(courseForm),
    });
    if (res.ok) {
      setCourse((p) => ({ ...p, ...courseForm }));
      setEditingCourse(false);
      addToast("Course info saved", "success");
    }
  }, [course.id, courseForm, addToast]);

  const uploadCover = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploadingCover(true);
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/upload?type=cover", { method: "POST", body: form });
        const data = await res.json();
        if (!data.data?.url) {
          addToast(data.error || "Failed to upload cover image", "error");
          return;
        }
        await fetch(`/api/courses/${course.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coverImage: data.data.url }),
        });
        setCourse((p) => ({ ...p, coverImage: data.data.url }));
        addToast("Cover image updated", "success");
      } finally {
        setUploadingCover(false);
        e.target.value = "";
      }
    },
    [course.id, addToast]
  );

  const replacePackage = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setReplacing(true);
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch(`/api/courses/${course.id}/scorm-package`, { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) {
          addToast(data.error || "Failed to replace package", "error");
          return;
        }
        setScormPackage(data.data);
        addToast("SCORM package replaced", "success");
      } finally {
        setReplacing(false);
        e.target.value = "";
      }
    },
    [course.id, addToast]
  );

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        {editingCourse ? (
          <div className="space-y-2">
            <input
              className="w-full text-sm font-semibold text-slate-900 border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand"
              value={courseForm.title}
              onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))}
            />
            <textarea
              className="w-full text-xs text-slate-500 border border-slate-300 rounded px-2 py-1 resize-none focus:outline-none focus:ring-1 focus:ring-brand"
              rows={3}
              value={courseForm.description}
              onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))}
            />
            <div className="flex gap-2">
              <button onClick={saveCourseInfo} className="text-xs text-brand hover:underline">
                Save
              </button>
              <button onClick={() => setEditingCourse(false)} className="text-xs text-slate-500 hover:underline">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900">{course.title}</h2>
              {course.description && <p className="text-sm text-slate-500 mt-1">{course.description}</p>}
              <Badge variant={course.status === "PUBLISHED" ? "success" : "secondary"} className="mt-2">
                {course.status === "PUBLISHED" ? "Published" : "Draft"}
              </Badge>
            </div>
            <button onClick={() => setEditingCourse(true)} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
              <Edit3 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          {course.coverImage ? (
            <img src={course.coverImage} alt="" className="w-16 h-16 rounded-lg object-cover border border-slate-200 flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
              <ImageIcon className="h-5 w-5 text-slate-300" />
            </div>
          )}
          <label
            className={`inline-flex items-center gap-2 text-sm text-brand cursor-pointer hover:underline ${uploadingCover ? "opacity-50 pointer-events-none" : ""}`}
          >
            <Upload className="h-4 w-4" />
            {uploadingCover ? "Uploading..." : course.coverImage ? "Replace header image" : "Upload header image"}
            <input type="file" accept="image/*" className="hidden" onChange={uploadCover} disabled={uploadingCover} />
          </label>
        </div>

        <Button
          size="sm"
          variant={course.status === "PUBLISHED" ? "outline" : "success"}
          className="mt-4"
          onClick={togglePublish}
          disabled={!scormPackage}
        >
          {course.status === "PUBLISHED" ? "Unpublish" : "Publish Course"}
        </Button>
        {!scormPackage && course.status !== "PUBLISHED" && (
          <p className="text-xs text-slate-400 mt-2">Upload a SCORM package before publishing.</p>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">SCORM Package</h3>
        {scormPackage ? (
          <div className="space-y-2 text-sm mb-3">
            <div className="flex items-center gap-2 text-slate-700">
              <FileArchive className="h-4 w-4 text-slate-400" />
              <span className="font-medium">{scormPackage.originalFilename}</span>
            </div>
            {scormPackage.manifestTitle && <p className="text-slate-500">Manifest title: {scormPackage.manifestTitle}</p>}
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{scormPackage.version === "SCORM_2004" ? "SCORM 2004" : "SCORM 1.2"}</Badge>
              <span className="text-xs text-slate-400">Entry: {scormPackage.entryPoint}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
            <PackageOpen className="h-4 w-4 flex-shrink-0" />
            No package uploaded yet.
          </div>
        )}

        <label
          className={`inline-flex items-center gap-2 text-sm text-brand cursor-pointer hover:underline ${replacing ? "opacity-50 pointer-events-none" : ""}`}
        >
          <Upload className="h-4 w-4" />
          {replacing ? "Uploading..." : scormPackage ? "Replace package" : "Upload package"}
          <input type="file" accept=".zip" className="hidden" onChange={replacePackage} disabled={replacing} />
        </label>
      </div>
    </div>
  );
}

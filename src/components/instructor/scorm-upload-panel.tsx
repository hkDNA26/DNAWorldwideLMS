"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { PackageOpen, Upload, X, CheckCircle2, AlertTriangle } from "lucide-react";

type Result = { kind: "success"; courseId: string } | { kind: "error"; message: string } | null;

export function ScormUploadPanel() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const reset = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) return;
    setUploading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("title", title.trim());
      form.append("description", description.trim());
      const res = await fetch("/api/courses/scorm", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setResult({ kind: "error", message: data.error || "Upload failed" });
        return;
      }
      setResult({ kind: "success", courseId: data.data.id });
      addToast("SCORM course created", "success");
    } catch {
      setResult({ kind: "error", message: "Network error — please try again." });
    } finally {
      setUploading(false);
    }
  };

  if (!open) {
    return (
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setOpen(true)}>
          <PackageOpen className="h-4 w-4 mr-2" />
          Upload SCORM Package
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Create Course from SCORM Package</h2>
        <button onClick={close} className="text-slate-400 hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      <Input
        id="scorm-title"
        label="Course title"
        placeholder="e.g. Workplace Safety Fundamentals"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Textarea
        id="scorm-description"
        label="Description (optional)"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="flex items-center gap-3">
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const dropped = e.dataTransfer.files?.[0];
            if (dropped) { setFile(dropped); setResult(null); }
          }}
          className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-600 cursor-pointer hover:border-brand hover:bg-indigo-50/30 transition-colors"
        >
          <PackageOpen className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <span className="truncate">{file ? file.name : "Click or drag a .zip SCORM package here"}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null); }}
            className="hidden"
          />
        </label>
        <Button onClick={handleUpload} disabled={!file || !title.trim()} loading={uploading}>
          <Upload className="h-4 w-4 mr-2" />
          Upload &amp; Create
        </Button>
      </div>

      {result?.kind === "success" && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>Course created as a draft.</span>
          <Link href={`/instructor/courses/${result.courseId}/builder`} className="font-semibold underline">
            Open in builder →
          </Link>
        </div>
      )}

      {result?.kind === "error" && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{result.message}</span>
        </div>
      )}
    </div>
  );
}

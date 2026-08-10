"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash2, FileText, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { PDF_CATEGORIES } from "@/lib/pdf-library";
import type { PdfCategory } from "@/generated/prisma/enums";

export interface AdminPdfDoc {
  id: string;
  category: PdfCategory;
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsManager({ documents }: { documents: AdminPdfDoc[] }) {
  return (
    <div className="space-y-8">
      {PDF_CATEGORIES.map((cat) => (
        <CategoryPanel
          key={cat.category}
          category={cat.category}
          label={cat.label}
          documents={documents.filter((d) => d.category === cat.category)}
        />
      ))}
    </div>
  );
}

function CategoryPanel({
  category,
  label,
  documents,
}: {
  category: PdfCategory;
  label: string;
  documents: AdminPdfDoc[];
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title.trim()) {
      addToast("Add a title and choose a PDF first", "error");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("category", category);
      form.append("title", title.trim());
      form.append("file", file);
      const res = await fetch("/api/pdf-documents", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || "Upload failed", "error");
        return;
      }
      addToast("PDF added", "success");
      setTitle("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } catch {
      addToast("Network error — please try again", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(doc: AdminPdfDoc) {
    if (!confirm(`Delete "${doc.title}"? This can't be undone.`)) return;
    setDeletingId(doc.id);
    try {
      const res = await fetch(`/api/pdf-documents/${doc.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || "Delete failed", "error");
        return;
      }
      addToast("PDF deleted", "success");
      router.refresh();
    } catch {
      addToast("Network error — please try again", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="bg-white border border-line rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-line">
        <h2 className="text-[15px] font-bold text-ink">{label}</h2>
        <p className="text-[13px] text-ink-faint mt-0.5">{documents.length} PDF{documents.length === 1 ? "" : "s"}</p>
      </div>

      <form onSubmit={handleUpload} className="px-5 py-4 border-b border-line bg-paper/50 flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <Input
            label="Title"
            placeholder="e.g. Drug & Alcohol Testing Guide"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">PDF file</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-brand-light file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand hover:file:bg-brand hover:file:text-white file:transition-colors"
          />
        </div>
        <Button type="submit" loading={uploading}>
          <Upload className="h-4 w-4 mr-2" />
          Add PDF
        </Button>
      </form>

      {documents.length === 0 ? (
        <div className="px-5 py-8 text-center text-ink-faint text-sm">No PDFs yet — add one above.</div>
      ) : (
        <ul className="divide-y divide-line">
          {documents.map((doc) => (
            <li key={doc.id} className="px-5 py-3.5 flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-brand-light flex items-center justify-center text-brand shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink truncate">{doc.title}</p>
                <p className="text-xs text-ink-faint mt-0.5 truncate">
                  {doc.fileName} &middot; {formatSize(doc.fileSize)}
                </p>
              </div>
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-ink-soft hover:bg-paper hover:text-ink transition-colors"
                title="View"
              >
                <Eye className="w-4 h-4" />
              </a>
              <a
                href={doc.fileUrl}
                download={doc.fileName}
                className="p-2 rounded-lg text-ink-soft hover:bg-paper hover:text-ink transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => handleDelete(doc)}
                disabled={deletingId === doc.id}
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

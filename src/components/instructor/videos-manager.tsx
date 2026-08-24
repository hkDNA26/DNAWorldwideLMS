"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { formatDuration } from "@/lib/videos";

export interface AdminVideo {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  durationSec: number | null;
}

export function VideosManager({ videos }: { videos: AdminVideo[] }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) {
      addToast("Paste a Vimeo link first", "error");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), title: title.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || "Couldn't add that video", "error");
        return;
      }
      addToast("Film added", "success");
      setUrl("");
      setTitle("");
      router.refresh();
    } catch {
      addToast("Network error — please try again", "error");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(video: AdminVideo) {
    if (!confirm(`Remove "${video.title}"?`)) return;
    setDeletingId(video.id);
    try {
      const res = await fetch(`/api/videos/${video.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || "Delete failed", "error");
        return;
      }
      addToast("Film removed", "success");
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
        <h2 className="text-[15px] font-bold text-ink">Films</h2>
        <p className="text-[13px] text-ink-faint mt-0.5">
          {videos.length} video{videos.length === 1 ? "" : "s"} — paste a Vimeo link and the title fills in automatically.
        </p>
      </div>

      <form onSubmit={handleAdd} className="px-5 py-4 border-b border-line bg-paper/50 flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <Input
            label="Vimeo link"
            placeholder="https://vimeo.com/1072417114/3c676fddf7"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Input
            label="Title (optional)"
            placeholder="Leave blank to use the Vimeo title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <Button type="submit" loading={adding}>
          <Plus className="h-4 w-4 mr-2" />
          Add film
        </Button>
      </form>

      {videos.length === 0 ? (
        <div className="px-5 py-8 text-center text-ink-faint text-sm">No films yet — add one above.</div>
      ) : (
        <ul className="divide-y divide-line">
          {videos.map((v) => {
            const duration = formatDuration(v.durationSec);
            return (
              <li key={v.id} className="px-5 py-3.5 flex items-center gap-4">
                <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-black shrink-0">
                  {v.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-dark to-brand" />
                  )}
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-5 h-5 text-white/90" fill="currentColor" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink truncate">{v.title}</p>
                  {duration && <p className="text-xs text-ink-faint mt-0.5">{duration}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(v)}
                  disabled={deletingId === v.id}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

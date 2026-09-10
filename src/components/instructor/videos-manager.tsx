"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Play, GripVertical, Pencil, Check, X } from "lucide-react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

export function VideosManager({ videos: initialVideos }: { videos: AdminVideo[] }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [videos, setVideos] = useState(initialVideos);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingRename, setSavingRename] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
      setVideos((v) => v.filter((x) => x.id !== video.id));
      router.refresh();
    } catch {
      addToast("Network error — please try again", "error");
    } finally {
      setDeletingId(null);
    }
  }

  function startRename(video: AdminVideo) {
    setEditingId(video.id);
    setEditValue(video.title);
  }

  function cancelRename() {
    setEditingId(null);
    setEditValue("");
  }

  async function saveRename(video: AdminVideo) {
    const nextTitle = editValue.trim();
    if (!nextTitle || nextTitle === video.title) {
      cancelRename();
      return;
    }
    setSavingRename(true);
    try {
      const res = await fetch(`/api/videos/${video.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: nextTitle }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || "Rename failed", "error");
        return;
      }
      setVideos((v) => v.map((x) => (x.id === video.id ? { ...x, title: nextTitle } : x)));
      addToast("Film renamed", "success");
      cancelRename();
      router.refresh();
    } catch {
      addToast("Network error — please try again", "error");
    } finally {
      setSavingRename(false);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = videos.findIndex((v) => v.id === active.id);
    const newIndex = videos.findIndex((v) => v.id === over.id);
    const reordered = arrayMove(videos, oldIndex, newIndex);
    setVideos(reordered);

    await fetch("/api/videos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reordered.map((v, i) => ({ id: v.id, sortOrder: i }))),
    });
    router.refresh();
  }

  return (
    <section className="bg-white border border-line rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-line">
        <h2 className="text-[15px] font-bold text-ink">Films</h2>
        <p className="text-[13px] text-ink-faint mt-0.5">
          {videos.length} video{videos.length === 1 ? "" : "s"} — paste a Vimeo link and the title fills in
          automatically. Drag to reorder, or use the pencil to rename.
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={videos.map((v) => v.id)} strategy={verticalListSortingStrategy}>
            <ul className="divide-y divide-line">
              {videos.map((v) => (
                <SortableVideoRow
                  key={v.id}
                  video={v}
                  isEditing={editingId === v.id}
                  editValue={editValue}
                  onEditValueChange={setEditValue}
                  onStartRename={() => startRename(v)}
                  onCancelRename={cancelRename}
                  onSaveRename={() => saveRename(v)}
                  savingRename={savingRename}
                  onDelete={() => handleDelete(v)}
                  deleting={deletingId === v.id}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}

function SortableVideoRow({
  video, isEditing, editValue, onEditValueChange, onStartRename, onCancelRename, onSaveRename, savingRename, onDelete, deleting,
}: {
  video: AdminVideo;
  isEditing: boolean;
  editValue: string;
  onEditValueChange: (value: string) => void;
  onStartRename: () => void;
  onCancelRename: () => void;
  onSaveRename: () => void;
  savingRename: boolean;
  onDelete: () => void;
  deleting: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: video.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const duration = formatDuration(video.durationSec);

  return (
    <li ref={setNodeRef} style={style} className="px-5 py-3.5 flex items-center gap-3 bg-white">
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing touch-none shrink-0"
        title="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-black shrink-0">
        {video.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-dark to-brand" />
        )}
        <span className="absolute inset-0 flex items-center justify-center">
          <Play className="w-5 h-5 text-white/90" fill="currentColor" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={editValue}
              onChange={(e) => onEditValueChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveRename();
                if (e.key === "Escape") onCancelRename();
              }}
              className="w-full text-sm font-semibold text-ink border border-line rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
            <button
              type="button"
              onClick={onSaveRename}
              disabled={savingRename}
              className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
              title="Save"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onCancelRename}
              disabled={savingRename}
              className="p-1.5 rounded-lg text-ink-soft hover:bg-paper transition-colors disabled:opacity-50"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-ink truncate">{video.title}</p>
            {duration && <p className="text-xs text-ink-faint mt-0.5">{duration}</p>}
          </>
        )}
      </div>
      {!isEditing && (
        <button
          type="button"
          onClick={onStartRename}
          className="p-2 rounded-lg text-ink-soft hover:bg-paper hover:text-ink transition-colors"
          title="Rename"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
        title="Remove"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </li>
  );
}

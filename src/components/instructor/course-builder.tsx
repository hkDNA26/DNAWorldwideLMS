"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "./rich-text-editor";
import { QuizBuilder } from "./quiz-builder";
import { VideoThumbnailPicker } from "./video-thumbnail-picker";
import { useToast } from "@/components/ui/toast";
import {
  GripVertical, Plus, Trash2, ChevronDown, ChevronRight, Edit3,
  FileText, Video, HelpCircle, Check, X, Upload,
} from "lucide-react";
import type { Course, Module, Lesson, Quiz } from "@/types";

type FullLesson = Lesson & { quiz: Quiz | null };
type FullModule = Module & { lessons: FullLesson[] };
type FullCourse = Course & { modules: FullModule[] };

const CONTENT_TYPE_ICONS: Record<string, React.ReactNode> = {
  TEXT: <FileText className="h-3.5 w-3.5" />,
  VIDEO: <Video className="h-3.5 w-3.5" />,
  QUIZ: <HelpCircle className="h-3.5 w-3.5" />,
};

interface CourseBuilderProps {
  course: FullCourse;
}

export function CourseBuilder({ course: initialCourse }: CourseBuilderProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [course, setCourse] = useState<FullCourse>(initialCourse);
  const [activeLesson, setActiveLesson] = useState<FullLesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(initialCourse.modules.map((m) => m.id))
  );
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCourse, setEditingCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: course.title, description: course.description });
  const [uploadingCover, setUploadingCover] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => { setMounted(true); }, []);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addModule = useCallback(async () => {
    const res = await fetch(`/api/courses/${course.id}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Module" }),
    });
    const data = await res.json();
    if (res.ok) {
      const newModule: FullModule = { ...data.data, lessons: [] };
      setCourse((p) => ({ ...p, modules: [...p.modules, newModule] }));
      setExpandedModules((p) => new Set([...p, data.data.id]));
    } else {
      addToast(data.error || "Failed to add module", "error");
    }
  }, [course.id, addToast]);

  const deleteModule = useCallback(async (moduleId: string) => {
    if (!confirm("Delete this module and all its lessons?")) return;
    const res = await fetch(`/api/modules/${moduleId}`, { method: "DELETE" });
    if (res.ok) {
      setCourse((p) => ({ ...p, modules: p.modules.filter((m) => m.id !== moduleId) }));
      if (activeLesson?.moduleId === moduleId) setActiveLesson(null);
    } else {
      addToast("Failed to delete module", "error");
    }
  }, [activeLesson, addToast]);

  const updateModuleTitle = useCallback(async (moduleId: string, title: string) => {
    const res = await fetch(`/api/modules/${moduleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      setCourse((p) => ({
        ...p,
        modules: p.modules.map((m) => (m.id === moduleId ? { ...m, title } : m)),
      }));
    }
  }, []);

  const addLesson = useCallback(async (moduleId: string, contentType: "TEXT" | "VIDEO" | "QUIZ") => {
    const res = await fetch(`/api/modules/${moduleId}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType, title: contentType === "QUIZ" ? "New Quiz" : "New Lesson" }),
    });
    const data = await res.json();
    if (res.ok) {
      const newLesson: FullLesson = data.data;
      setCourse((p) => ({
        ...p,
        modules: p.modules.map((m) =>
          m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m
        ),
      }));
      setActiveLesson(newLesson);
    } else {
      addToast(data.error || "Failed to add lesson", "error");
    }
  }, [addToast]);

  const deleteLesson = useCallback(async (lessonId: string, moduleId: string) => {
    if (!confirm("Delete this lesson?")) return;
    const res = await fetch(`/api/lessons/${lessonId}`, { method: "DELETE" });
    if (res.ok) {
      setCourse((p) => ({
        ...p,
        modules: p.modules.map((m) =>
          m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m
        ),
      }));
      if (activeLesson?.id === lessonId) setActiveLesson(null);
    } else {
      addToast("Failed to delete lesson", "error");
    }
  }, [activeLesson, addToast]);

  const saveLesson = useCallback(async () => {
    if (!activeLesson) return;
    setSaving(true);
    const res = await fetch(`/api/lessons/${activeLesson.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: activeLesson.title,
        content: activeLesson.content,
        videoUrl: activeLesson.videoUrl,
        videoThumbnail: activeLesson.videoThumbnail,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setCourse((p) => ({
        ...p,
        modules: p.modules.map((m) => ({
          ...m,
          lessons: m.lessons.map((l) => (l.id === activeLesson.id ? { ...l, ...data.data } : l)),
        })),
      }));
      addToast("Lesson saved", "success");
    } else {
      addToast(data.error || "Failed to save", "error");
    }
  }, [activeLesson, addToast]);

  const handleModuleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = course.modules.findIndex((m) => m.id === active.id);
    const newIndex = course.modules.findIndex((m) => m.id === over.id);
    const reordered = arrayMove(course.modules, oldIndex, newIndex).map((m, i) => ({
      ...m,
      orderIndex: i,
    }));

    setCourse((p) => ({ ...p, modules: reordered }));

    await fetch(`/api/courses/${course.id}/modules`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reordered.map((m) => ({ id: m.id, orderIndex: m.orderIndex }))),
    });
  }, [course.id, course.modules]);

  const handleLessonDragEnd = useCallback(async (moduleId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const module = course.modules.find((m) => m.id === moduleId);
    if (!module) return;

    const oldIndex = module.lessons.findIndex((l) => l.id === active.id);
    const newIndex = module.lessons.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(module.lessons, oldIndex, newIndex).map((l, i) => ({
      ...l,
      orderIndex: i,
    }));

    setCourse((p) => ({
      ...p,
      modules: p.modules.map((m) => (m.id === moduleId ? { ...m, lessons: reordered } : m)),
    }));

    await fetch(`/api/modules/${moduleId}/lessons`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reordered.map((l) => ({ id: l.id, orderIndex: l.orderIndex }))),
    });
  }, [course.modules]);

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

  const uploadCover = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload?type=cover", { method: "POST", body: form });
    const data = await res.json();
    setUploadingCover(false);
    if (data.data?.url) {
      await fetch(`/api/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverImage: data.data.url }),
      });
      setCourse((p) => ({ ...p, coverImage: data.data.url }));
      addToast("Cover image updated", "success");
    }
  }, [course.id, addToast]);

  return (
    <div className="flex h-full">
      {/* Left: course structure */}
      <div className="w-72 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col overflow-y-auto">
        {/* Course header */}
        <div className="p-4 border-b border-slate-200">
          {editingCourse ? (
            <div className="space-y-2">
              <input
                className="w-full text-sm font-semibold text-slate-900 border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#1a3d8f]"
                value={courseForm.title}
                onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))}
              />
              <textarea
                className="w-full text-xs text-slate-500 border border-slate-300 rounded px-2 py-1 resize-none focus:outline-none focus:ring-1 focus:ring-[#1a3d8f]"
                rows={2}
                value={courseForm.description}
                onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))}
              />
              <div className="flex gap-2">
                <button onClick={saveCourseInfo} className="text-xs text-[#1a3d8f] hover:underline">Save</button>
                <button onClick={() => setEditingCourse(false)} className="text-xs text-slate-500 hover:underline">Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-900 leading-tight">{course.title}</h2>
                <button onClick={() => setEditingCourse(true)} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              </div>
              <Badge variant={course.status === "PUBLISHED" ? "success" : "secondary"} className="mt-1">
                {course.status === "PUBLISHED" ? "Published" : "Draft"}
              </Badge>
            </div>
          )}

          <div className="mt-3 space-y-2">
            <label className={`flex items-center gap-2 text-xs text-slate-500 cursor-pointer hover:text-slate-700 transition-colors ${uploadingCover ? "opacity-50" : ""}`}>
              <Upload className="h-3.5 w-3.5" />
              {uploadingCover ? "Uploading..." : "Upload cover image"}
              <input type="file" accept="image/*" className="hidden" onChange={uploadCover} disabled={uploadingCover} />
            </label>
            <Button
              size="sm"
              variant={course.status === "PUBLISHED" ? "outline" : "success"}
              className="w-full"
              onClick={togglePublish}
            >
              {course.status === "PUBLISHED" ? "Unpublish" : "Publish Course"}
            </Button>
          </div>
        </div>

        {/* Modules list */}
        <div className="flex-1 overflow-y-auto p-2">
          {mounted && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleModuleDragEnd}>
              <SortableContext items={course.modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                {course.modules.map((module) => (
                  <SortableModule
                    key={module.id}
                    module={module}
                    expanded={expandedModules.has(module.id)}
                    onToggle={() => toggleModule(module.id)}
                    onDeleteModule={() => deleteModule(module.id)}
                    onUpdateTitle={(title) => updateModuleTitle(module.id, title)}
                    onAddLesson={(type) => addLesson(module.id, type)}
                    onDeleteLesson={(lessonId) => deleteLesson(lessonId, module.id)}
                    onSelectLesson={setActiveLesson}
                    activeLesson={activeLesson}
                    sensors={sensors}
                    onLessonDragEnd={(e) => handleLessonDragEnd(module.id, e)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}

          <button
            onClick={addModule}
            className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors border-2 border-dashed border-slate-200"
          >
            <Plus className="h-4 w-4" />
            Add Module
          </button>
        </div>
      </div>

      {/* Right: lesson editor */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
        {activeLesson ? (
          <LessonEditor
            lesson={activeLesson}
            onUpdate={(updates) => setActiveLesson((p) => p ? { ...p, ...updates } : p)}
            onSave={saveLesson}
            saving={saving}
            onQuizUpdate={(quiz) => setActiveLesson((p) => p ? { ...p, quiz } : p)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-24">
            <FileText className="h-16 w-16 text-slate-200 mb-4" />
            <h3 className="text-lg font-medium text-slate-500">Select a lesson to edit</h3>
            <p className="text-sm text-slate-400 mt-1">
              Or add a module and lesson from the left panel
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SortableModule({
  module, expanded, onToggle, onDeleteModule, onUpdateTitle,
  onAddLesson, onDeleteLesson, onSelectLesson, activeLesson, sensors, onLessonDragEnd,
}: {
  module: FullModule;
  expanded: boolean;
  onToggle: () => void;
  onDeleteModule: () => void;
  onUpdateTitle: (t: string) => void;
  onAddLesson: (type: "TEXT" | "VIDEO" | "QUIZ") => void;
  onDeleteLesson: (id: string) => void;
  onSelectLesson: (l: FullLesson) => void;
  activeLesson: FullLesson | null;
  sensors: ReturnType<typeof useSensors>;
  onLessonDragEnd: (e: DragEndEvent) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.id,
  });
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(module.title);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="mb-1">
      <div className="flex items-center gap-1 group px-1 py-1 rounded-lg hover:bg-slate-100 transition-colors">
        <button {...attributes} {...listeners} className="text-slate-300 hover:text-slate-500 cursor-grab">
          <GripVertical className="h-4 w-4" />
        </button>
        <button onClick={onToggle} className="text-slate-400">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {editingTitle ? (
          <input
            autoFocus
            className="flex-1 text-xs font-medium bg-white border border-indigo-300 rounded px-1 py-0.5 focus:outline-none"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={() => { onUpdateTitle(titleValue); setEditingTitle(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") { onUpdateTitle(titleValue); setEditingTitle(false); } }}
          />
        ) : (
          <span
            className="flex-1 text-xs font-medium text-slate-700 truncate cursor-pointer"
            onDoubleClick={() => setEditingTitle(true)}
          >
            {module.title}
          </span>
        )}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditingTitle(true)} className="text-slate-400 hover:text-slate-600 p-0.5">
            <Edit3 className="h-3 w-3" />
          </button>
          <button onClick={onDeleteModule} className="text-slate-400 hover:text-red-500 p-0.5">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="ml-5 mt-0.5 space-y-0.5">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onLessonDragEnd}>
            <SortableContext items={module.lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              {module.lessons.map((lesson) => (
                <SortableLesson
                  key={lesson.id}
                  lesson={lesson}
                  isActive={activeLesson?.id === lesson.id}
                  onSelect={() => onSelectLesson(lesson)}
                  onDelete={() => onDeleteLesson(lesson.id)}
                />
              ))}
            </SortableContext>
          </DndContext>

          <div className="relative">
            <button
              onClick={() => setShowAddMenu((p) => !p)}
              className="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-400 hover:text-[#1a3d8f] transition-colors"
            >
              <Plus className="h-3 w-3" />
              Add lesson
            </button>
            {showAddMenu && (
              <div className="absolute left-0 top-full mt-1 z-10 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[140px]">
                {[
                  { type: "TEXT" as const, label: "Text lesson", icon: <FileText className="h-3.5 w-3.5" /> },
                  { type: "VIDEO" as const, label: "Video lesson", icon: <Video className="h-3.5 w-3.5" /> },
                  { type: "QUIZ" as const, label: "Quiz", icon: <HelpCircle className="h-3.5 w-3.5" /> },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => { onAddLesson(item.type); setShowAddMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SortableLesson({
  lesson, isActive, onSelect, onDelete,
}: {
  lesson: FullLesson;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lesson.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-1 group px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${isActive ? "bg-indigo-50" : "hover:bg-slate-100"}`}>
      <button {...attributes} {...listeners} className="text-slate-200 hover:text-slate-400 cursor-grab">
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <span className={`flex-shrink-0 ${isActive ? "text-[#1a3d8f]" : "text-slate-400"}`}>
        {CONTENT_TYPE_ICONS[lesson.contentType]}
      </span>
      <span
        onClick={onSelect}
        className={`flex-1 text-xs truncate ${isActive ? "text-[#1a3d8f] font-medium" : "text-slate-600"}`}
      >
        {lesson.title}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

function LessonEditor({
  lesson, onUpdate, onSave, saving, onQuizUpdate,
}: {
  lesson: FullLesson;
  onUpdate: (updates: Partial<FullLesson>) => void;
  onSave: () => void;
  saving: boolean;
  onQuizUpdate: (quiz: Quiz) => void;
}) {
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const uploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload?type=video", { method: "POST", body: form });
    const data = await res.json();
    setUploadingVideo(false);
    if (data.data?.url) {
      onUpdate({ videoUrl: data.data.url });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">{CONTENT_TYPE_ICONS[lesson.contentType]}</span>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {lesson.contentType === "TEXT" ? "Text Lesson" : lesson.contentType === "VIDEO" ? "Video Lesson" : "Quiz"}
          </span>
        </div>
        {lesson.contentType !== "QUIZ" && (
          <Button onClick={onSave} loading={saving} size="sm">
            <Check className="h-4 w-4 mr-1" />
            Save
          </Button>
        )}
      </div>

      <Input
        label="Lesson title"
        value={lesson.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        className="mb-6 text-lg font-semibold"
      />

      {lesson.contentType === "TEXT" && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Content</label>
          <RichTextEditor
            content={lesson.content || ""}
            onChange={(html) => onUpdate({ content: html })}
          />
        </div>
      )}

      {lesson.contentType === "VIDEO" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Video URL (embed)</label>
            <Input
              placeholder="https://www.youtube.com/embed/... or paste URL"
              value={lesson.videoUrl || ""}
              onChange={(e) => onUpdate({ videoUrl: e.target.value })}
            />
            <p className="text-xs text-slate-400 mt-1">Paste a YouTube embed URL, Vimeo, or direct video URL</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">or upload a file</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <label className={`flex items-center justify-center gap-2 h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[#1a3d8f] hover:bg-indigo-50 transition-colors ${uploadingVideo ? "opacity-50 pointer-events-none" : ""}`}>
            <Upload className="h-5 w-5 text-slate-400" />
            <span className="text-sm text-slate-500">{uploadingVideo ? "Uploading..." : "Upload video file"}</span>
            <input type="file" accept="video/*" className="hidden" onChange={uploadVideo} disabled={uploadingVideo} />
          </label>
          {lesson.videoUrl && (
            <div className="rounded-xl overflow-hidden bg-black aspect-video">
              <video src={lesson.videoUrl} controls className="w-full h-full" poster={lesson.videoThumbnail ?? undefined} />
            </div>
          )}
          {lesson.videoUrl && (
            <VideoThumbnailPicker
              videoUrl={lesson.videoUrl}
              currentThumbnail={lesson.videoThumbnail ?? null}
              onSelect={(url) => onUpdate({ videoThumbnail: url })}
            />
          )}
        </div>
      )}

      {lesson.contentType === "QUIZ" && lesson.quiz && (
        <QuizBuilder quiz={lesson.quiz} onUpdate={onQuizUpdate} />
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Upload, Save, RotateCcw, Info } from "lucide-react";
import type { TemplateField } from "@/lib/certificate-defaults";

export type { TemplateField };

interface Props {
  initialImageUrl: string | null;
  initialFields: TemplateField[];
}

const FIELD_COLORS: Record<string, string> = {
  studentName:    "#3b82f6",
  courseTitle:    "#8b5cf6",
  instructorName: "#10b981",
  issuedDate:     "#f59e0b",
  certificateId:  "#6b7280",
};

export function CertificateTemplateEditor({ initialImageUrl, initialFields }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);
  const [fields, setFields] = useState<TemplateField[]>(initialFields);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const { addToast } = useToast();

  const selectedField = fields.find((f) => f.key === selectedKey) ?? null;

  const updateField = (key: string, updates: Partial<TemplateField>) => {
    setFields((prev) => prev.map((f) => (f.key === key ? { ...f, ...updates } : f)));
  };

  // ── Drag logic ──────────────────────────────────────────────────────────────
  const onFieldMouseDown = useCallback(
    (e: React.MouseEvent, key: string) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedKey(key);
      setDragging(key);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const field = fields.find((f) => f.key === key)!;

      // Offset between mouse and field's top-left corner (in %)
      dragOffset.current = {
        x: e.clientX - rect.left - (field.x / 100) * rect.width,
        y: e.clientY - rect.top - (field.y / 100) * rect.height,
      };
    },
    [fields]
  );

  useEffect(() => {
    if (!dragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.min(100, Math.max(0, ((e.clientX - rect.left - dragOffset.current.x) / rect.width) * 100));
      const y = Math.min(100, Math.max(0, ((e.clientY - rect.top - dragOffset.current.y) / rect.height) * 100));
      updateField(dragging, { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
    };

    const onMouseUp = () => setDragging(null);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging]);

  // ── Image upload ─────────────────────────────────────────────────────────────
  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload?type=template", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { addToast(data.error || "Upload failed", "error"); return; }
      setImageUrl(data.data.url);
      addToast("Background uploaded", "success");
    } finally {
      setUploading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) uploadImage(file);
  };

  // ── Save ─────────────────────────────────────────────────────────────────────
  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/certificate-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, fields }),
      });
      if (!res.ok) { addToast("Failed to save template", "error"); return; }
      addToast("Template saved", "success");
    } finally {
      setSaving(false);
    }
  };

  const resetFields = () => {
    if (!confirm("Reset all field positions to defaults?")) return;
    setFields(initialFields);
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex gap-6 items-start">
      {/* Left: property panel */}
      <div className="w-64 flex-shrink-0 space-y-4">
        {/* Upload area */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">Background Image</p>
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-[#1a3d8f] hover:bg-indigo-50/30 transition-colors"
          >
            <Upload className="h-6 w-6 text-slate-400" />
            <span className="text-xs text-slate-500 text-center">
              {uploading ? "Uploading…" : "Click or drag an image\n(A4 landscape, PNG/JPG)"}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={uploading}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }}
            />
          </label>
          {imageUrl && (
            <button
              onClick={() => setImageUrl(null)}
              className="mt-2 text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Remove background
            </button>
          )}
        </div>

        {/* Field list */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">Fields</p>
          <div className="space-y-1.5">
            {fields.map((f) => (
              <button
                key={f.key}
                onClick={() => setSelectedKey(f.key)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                  selectedKey === f.key
                    ? "bg-indigo-50 border border-[#c2cef5]"
                    : "hover:bg-slate-50 border border-transparent"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: FIELD_COLORS[f.key] }}
                />
                <span className="text-slate-700 truncate">{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected field properties */}
        {selectedField && (
          <div className="bg-white rounded-xl border border-[#c2cef5] p-4">
            <p className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">
              {selectedField.label}
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Font size</label>
                <input
                  type="range" min={8} max={72}
                  value={selectedField.fontSize}
                  onChange={(e) => updateField(selectedField.key, { fontSize: Number(e.target.value) })}
                  className="w-full accent-[#1a3d8f]"
                />
                <span className="text-xs text-slate-500">{selectedField.fontSize}px</span>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedField.color}
                    onChange={(e) => updateField(selectedField.key, { color: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border border-slate-200"
                  />
                  <span className="text-xs font-mono text-slate-500">{selectedField.color}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="bold-toggle"
                  type="checkbox"
                  checked={selectedField.bold}
                  onChange={(e) => updateField(selectedField.key, { bold: e.target.checked })}
                  className="rounded accent-[#1a3d8f]"
                />
                <label htmlFor="bold-toggle" className="text-xs text-slate-600">Bold</label>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Align</label>
                <div className="flex gap-1">
                  {(["left", "center", "right"] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => updateField(selectedField.key, { align: a })}
                      className={`flex-1 py-1 text-xs rounded border transition-colors ${
                        selectedField.align === a
                          ? "bg-[#1a3d8f] text-white border-[#1a3d8f]"
                          : "text-slate-500 border-slate-200 hover:border-[#1a3d8f]"
                      }`}
                    >
                      {a[0].toUpperCase() + a.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">X %</label>
                  <input
                    type="number" min={0} max={100} step={0.5}
                    value={selectedField.x}
                    onChange={(e) => updateField(selectedField.key, { x: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Y %</label>
                  <input
                    type="number" min={0} max={100} step={0.5}
                    value={selectedField.y}
                    onChange={(e) => updateField(selectedField.key, { y: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded px-2 py-1 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button onClick={save} loading={saving}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
          <Button variant="outline" onClick={resetFields}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Positions
          </Button>
        </div>

        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-600 leading-relaxed">
            Drag field labels on the canvas to position them. Each label shows where that data will appear on issued certificates.
          </p>
        </div>
      </div>

      {/* Right: A4 landscape canvas */}
      <div className="flex-1 min-w-0">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            A4 Landscape — drag labels to position &nbsp;·&nbsp; click a label to select it
          </p>
          <p className="text-xs text-slate-400">297 × 210 mm</p>
        </div>

        {/* A4 landscape wrapper — aspect ratio 297/210 ≈ 1.4143 */}
        <div
          style={{ paddingBottom: `${(210 / 297) * 100}%` }}
          className="relative w-full"
        >
          <div
            ref={canvasRef}
            className="absolute inset-0 overflow-hidden select-none"
            style={{
              background: imageUrl ? `url(${imageUrl}) center/cover no-repeat` : "#fffff8",
              border: "1px solid #d1d5db",
              boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
              cursor: dragging ? "grabbing" : "default",
            }}
            onClick={() => setSelectedKey(null)}
          >
            {/* Fallback grid lines when no image */}
            {!imageUrl && (
              <>
                <div className="absolute inset-0 pointer-events-none" style={{
                  backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 49px,#e5e7eb 49px,#e5e7eb 50px),repeating-linear-gradient(90deg,transparent,transparent 49px,#e5e7eb 49px,#e5e7eb 50px)",
                }} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-slate-300 text-sm">Upload a background image to see your template</p>
                </div>
              </>
            )}

            {/* Draggable field labels */}
            {fields.map((field) => (
              <div
                key={field.key}
                style={{
                  position: "absolute",
                  left: `${field.x}%`,
                  top: `${field.y}%`,
                  transform: field.align === "center"
                    ? "translate(-50%, -50%)"
                    : field.align === "right"
                    ? "translate(-100%, -50%)"
                    : "translate(0, -50%)",
                  cursor: dragging === field.key ? "grabbing" : "grab",
                  zIndex: selectedKey === field.key ? 20 : 10,
                  userSelect: "none",
                }}
                onMouseDown={(e) => onFieldMouseDown(e, field.key)}
              >
                <div
                  style={{
                    fontSize: `${Math.max(field.fontSize * 0.55, 9)}px`,
                    color: field.color,
                    fontWeight: field.bold ? "700" : "400",
                    textAlign: field.align,
                    whiteSpace: "nowrap",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    border: `1.5px dashed ${selectedKey === field.key ? FIELD_COLORS[field.key] : "rgba(100,100,100,0.25)"}`,
                    backgroundColor: selectedKey === field.key
                      ? `${FIELD_COLORS[field.key]}18`
                      : "rgba(255,255,255,0.5)",
                    backdropFilter: "blur(2px)",
                  }}
                >
                  {`{{ ${field.label} }}`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview note */}
        <p className="mt-2 text-xs text-slate-400 text-center">
          Field sizes shown at ~55% of actual print size for canvas fit.
          Actual certificate renders at full size.
        </p>
      </div>
    </div>
  );
}

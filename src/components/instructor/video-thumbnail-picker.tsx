"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Camera, Upload, X, Check, Image, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  videoUrl: string;
  currentThumbnail: string | null;
  onSelect: (url: string | null) => void;
}

function isEmbedUrl(url: string) {
  return /youtube\.com|youtu\.be|vimeo\.com|player\.vimeo|dailymotion/.test(url);
}

export function VideoThumbnailPicker({ videoUrl, currentThumbnail, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekError, setSeekError] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isEmbed = isEmbedUrl(videoUrl);

  // Reset state when closed or when videoUrl changes
  useEffect(() => {
    if (!open) {
      setCapturedDataUrl(null);
      setVideoReady(false);
      setCurrentTime(0);
      setDuration(0);
      setSeekError(false);
    }
  }, [open, videoUrl]);

  const handleVideoLoaded = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration);
    setVideoReady(true);
    setSeekError(false);
  }, []);

  const handleVideoError = useCallback(() => {
    setSeekError(true);
    setVideoReady(false);
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const t = Number(e.target.value);
    v.currentTime = t;
    setCurrentTime(t);
    setCapturedDataUrl(null);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
  }, []);

  const captureFrame = useCallback(() => {
    const v = videoRef.current;
    const canvas = canvasRef.current;
    if (!v || !canvas) return;
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    setCapturedDataUrl(canvas.toDataURL("image/jpeg", 0.9));
  }, []);

  const uploadAndSave = useCallback(async () => {
    if (!capturedDataUrl) return;
    setUploading(true);
    try {
      const blob = await (await fetch(capturedDataUrl)).blob();
      const form = new FormData();
      form.append("file", blob, "thumbnail.jpg");
      const res = await fetch("/api/upload?type=thumbnail", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onSelect(data.data.url);
      setOpen(false);
    } catch {
      // toast would be nice but we keep deps minimal here
      alert("Failed to upload thumbnail. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [capturedDataUrl, onSelect]);

  const removeThumbnail = useCallback(() => {
    onSelect(null);
  }, [onSelect]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-2">
      {/* Current thumbnail status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Video Thumbnail</span>
          {currentThumbnail && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <Check className="h-3 w-3" /> Set
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {currentThumbnail && (
            <button
              onClick={removeThumbnail}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
              title="Remove thumbnail"
            >
              <X className="h-3 w-3" /> Remove
            </button>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:border-[#1a3d8f] hover:text-[#1a3d8f] transition-colors bg-white"
          >
            <Camera className="h-3.5 w-3.5" />
            {isEmbed ? (currentThumbnail ? "Change Thumbnail" : "Set Thumbnail URL") : (currentThumbnail ? "Change Frame" : "Pick Frame")}
          </button>
        </div>
      </div>

      {/* Current thumbnail preview */}
      {currentThumbnail && !open && (
        <div className="relative w-40 aspect-video rounded-lg overflow-hidden border border-slate-200">
          <img src={currentThumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Picker panel */}
      {open && (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
          {isEmbed ? (
            /* Embed video: manual URL input */
            <div className="p-4 space-y-3">
              <p className="text-xs text-slate-500">
                YouTube/Vimeo videos can't be frame-captured directly. Paste a thumbnail image URL instead.
              </p>
              <input
                type="text"
                placeholder="https://example.com/thumbnail.jpg"
                defaultValue={currentThumbnail ?? ""}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3d8f]/30 focus:border-[#1a3d8f]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) { onSelect(val); setOpen(false); }
                  }
                }}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={(e) => {
                    const input = (e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement);
                    const val = input?.value.trim();
                    if (val) { onSelect(val); setOpen(false); }
                  }}
                >
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            /* Direct video: frame capture */
            <div className="p-4 space-y-3">
              {/* Hidden video element for seeking */}
              <video
                ref={videoRef}
                src={videoUrl}
                crossOrigin="anonymous"
                preload="metadata"
                muted
                className="hidden"
                onLoadedMetadata={handleVideoLoaded}
                onError={handleVideoError}
                onTimeUpdate={handleTimeUpdate}
              />
              <canvas ref={canvasRef} className="hidden" />

              {seekError && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  This video can't be loaded for frame capture (CORS restriction). Try a different video source or paste a thumbnail URL instead.
                </div>
              )}

              {!seekError && (
                <>
                  {/* Scrubber + capture */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Seek to a frame</span>
                      <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      step={0.1}
                      value={currentTime}
                      onChange={handleSeek}
                      disabled={!videoReady}
                      className="w-full accent-[#1a3d8f] disabled:opacity-40"
                    />
                    {!videoReady && (
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Loader2 className="h-3 w-3 animate-spin" /> Loading video metadata…
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={captureFrame}
                      disabled={!videoReady}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-[#1a3d8f] text-white hover:bg-[#15336e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      Capture This Frame
                    </button>
                    <button
                      onClick={() => setOpen(false)}
                      className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Captured frame preview */}
                  {capturedDataUrl && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-600">Captured frame preview:</p>
                      <div className="relative w-full max-w-xs aspect-video rounded-lg overflow-hidden border-2 border-[#1a3d8f]/30">
                        <img src={capturedDataUrl} alt="Captured frame" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={uploadAndSave}
                          disabled={uploading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                        >
                          {uploading ? (
                            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>
                          ) : (
                            <><Upload className="h-3.5 w-3.5" /> Use This Frame</>
                          )}
                        </button>
                        <button
                          onClick={() => setCapturedDataUrl(null)}
                          disabled={uploading}
                          className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          Try Another
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Fallback: paste URL manually */}
              {seekError && (
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Or paste a thumbnail URL:</label>
                  <div className="flex gap-2">
                    <input
                      id="thumb-url-fallback"
                      type="text"
                      placeholder="https://…"
                      className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1a3d8f]/30 focus:border-[#1a3d8f]"
                    />
                    <button
                      onClick={() => {
                        const val = (document.getElementById("thumb-url-fallback") as HTMLInputElement)?.value.trim();
                        if (val) { onSelect(val); setOpen(false); }
                      }}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg bg-[#1a3d8f] text-white hover:bg-[#15336e] transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

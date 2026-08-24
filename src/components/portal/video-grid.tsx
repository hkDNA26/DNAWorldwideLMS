"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { vimeoEmbedUrl, formatDuration } from "@/lib/videos";

export interface VideoItem {
  id: string;
  title: string;
  videoId: string;
  videoHash: string | null;
  thumbnailUrl: string | null;
  durationSec: number | null;
}

export function VideoGrid({ videos }: { videos: VideoItem[] }) {
  const [playing, setPlaying] = useState<string | null>(null);

  if (videos.length === 0) {
    return (
      <div className="bg-white border border-line rounded-2xl p-8 text-center text-ink-faint text-sm">
        No videos have been added yet.
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((v, i) => {
        const duration = formatDuration(v.durationSec);
        const isPlaying = playing === v.id;
        return (
          <div
            key={v.id}
            className="bg-white border border-line rounded-2xl overflow-hidden shadow-sm animate-brand-card-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="relative aspect-video bg-black">
              {isPlaying ? (
                <iframe
                  src={`${vimeoEmbedUrl(v.videoId, v.videoHash)}${vimeoEmbedUrl(v.videoId, v.videoHash).includes("?") ? "&" : "?"}autoplay=1`}
                  title={v.title}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPlaying(v.id)}
                  aria-label={`Play ${v.title}`}
                  className="group absolute inset-0 w-full h-full"
                >
                  {v.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-dark to-brand" />
                  )}
                  <span className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-14 h-14 rounded-full bg-white/90 text-brand flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                      <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
                    </span>
                  </span>
                  {duration && (
                    <span className="absolute bottom-2 right-2 text-[11px] font-semibold text-white bg-black/70 rounded px-1.5 py-0.5">
                      {duration}
                    </span>
                  )}
                </button>
              )}
            </div>
            <div className="p-4">
              <p className="text-[14.5px] font-semibold text-ink leading-snug">{v.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

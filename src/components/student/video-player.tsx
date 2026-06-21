"use client";

import { useEffect, useRef, useCallback } from "react";
import { Video } from "lucide-react";

declare global {
  interface Window {
    YT: {
      Player: new (el: HTMLElement, opts: object) => YTInstance;
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady: (() => void) | undefined;
    _ytCallbacks?: Array<() => void>;
  }
}

interface YTInstance {
  seekTo(s: number, allowSeekAhead: boolean): void;
  playVideo(): void;
  destroy(): void;
}

interface Props {
  url: string;
  thumbnail?: string | null;
  onComplete: () => void;
}

function getYouTubeId(url: string): string | null {
  return url.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([^?&]+)/)?.[1] ?? null;
}

function getVimeoId(url: string): string | null {
  return url.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/)?.[1] ?? null;
}

export function VideoPlayer({ url, thumbnail, onComplete }: Props) {
  const ytDivRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<YTInstance | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const firedRef = useRef(false);

  const youtubeId = getYouTubeId(url);
  const vimeoId = !youtubeId ? getVimeoId(url) : null;
  const isDirect = !youtubeId && !vimeoId;

  const fire = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    onComplete();
  }, [onComplete]);

  // YouTube IFrame API
  useEffect(() => {
    if (!youtubeId || !ytDivRef.current) return;
    let player: YTInstance;

    function create() {
      if (!ytDivRef.current) return;
      player = new window.YT.Player(ytDivRef.current, {
        videoId: youtubeId,
        width: "100%",
        height: "100%",
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onStateChange: (e: { data: number }) => {
            if (e.data === 0) fire(); // 0 = ENDED
          },
        },
      });
      ytPlayerRef.current = player;
    }

    if (window.YT?.Player) {
      create();
    } else {
      if (!window._ytCallbacks) window._ytCallbacks = [];
      window._ytCallbacks.push(create);
      if (!window.onYouTubeIframeAPIReady) {
        window.onYouTubeIframeAPIReady = () => {
          window._ytCallbacks?.forEach((cb) => cb());
          window._ytCallbacks = [];
        };
      }
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const s = document.createElement("script");
        s.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(s);
      }
    }

    return () => {
      try { player?.destroy(); } catch {}
      ytPlayerRef.current = null;
    };
  }, [youtubeId, fire]);

  // Vimeo postMessage API
  useEffect(() => {
    if (!vimeoId) return;

    function onMsg(e: MessageEvent) {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data?.event === "finish") fire();
      } catch {}
    }

    window.addEventListener("message", onMsg);

    const iframe = iframeRef.current;
    if (iframe) {
      const onLoad = () => {
        iframe.contentWindow?.postMessage(
          JSON.stringify({ method: "addEventListener", value: "finish" }),
          "https://player.vimeo.com"
        );
      };
      iframe.addEventListener("load", onLoad);
      return () => {
        window.removeEventListener("message", onMsg);
        iframe.removeEventListener("load", onLoad);
      };
    }

    return () => window.removeEventListener("message", onMsg);
  }, [vimeoId, fire]);

  if (isDirect) {
    return (
      <video
        ref={videoRef}
        src={url}
        controls
        className="w-full h-full"
        poster={thumbnail ?? undefined}
        onEnded={fire}
      />
    );
  }

  if (youtubeId) {
    return <div ref={ytDivRef} className="w-full h-full" />;
  }

  if (vimeoId) {
    return (
      <iframe
        ref={iframeRef}
        src={`https://player.vimeo.com/video/${vimeoId}?api=1&autopause=0`}
        className="w-full h-full"
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture"
      />
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#0d2060]">
      <Video className="h-20 w-20 text-white/20" />
    </div>
  );
}

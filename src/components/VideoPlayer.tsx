"use client";
import { useEffect, useRef, useState } from "react";
import { CheckCircle, Lock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function VideoPlayer({
  videoId,
  lessonId,
  videoDuration,
  initialWatched,
  initialCompleted,
}: {
  videoId: string;
  lessonId: string;
  videoDuration: number;
  initialWatched: number;
  initialCompleted: boolean;
}) {
  const router = useRouter();
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const maxWatchedRef = useRef(initialWatched);
  const [watched, setWatched] = useState(initialWatched);
  const [completed, setCompleted] = useState(initialCompleted);
  const [saving, setSaving] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  const requiredSeconds = Math.floor(videoDuration * 0.7);

  const save = async (seconds: number, mark: boolean) => {
    setSaving(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          watchedSeconds: seconds,
          markComplete: mark,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setWatched(data.progress.watchedSeconds);
        setCompleted(data.progress.completed);
        if (mark && data.progress.completed) {
          router.refresh();
        }
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  useEffect(() => {
    const loadYT = () => {
      if (window.YT && window.YT.Player) {
        initPlayer();
        return;
      }
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const first = document.getElementsByTagName("script")[0];
      first.parentNode?.insertBefore(tag, first);
      window.onYouTubeIframeAPIReady = () => initPlayer();
    };

    const initPlayer = () => {
      if (!containerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onReady: () => setPlayerReady(true),
        },
      });
    };

    loadYT();

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        try { playerRef.current.destroy(); } catch {}
      }
    };
  }, [videoId]);

  useEffect(() => {
    if (!playerReady) return;

    const interval = setInterval(() => {
      try {
        const player = playerRef.current;
        if (!player || !player.getCurrentTime) return;

        const current = Math.floor(player.getCurrentTime());
        const state = player.getPlayerState();

        if (state === 1 && current > maxWatchedRef.current) {
          maxWatchedRef.current = current;
          setWatched(current);

          if (current % 15 === 0) {
            save(current, false);
          }
        }
      } catch {}
    }, 1000);

    return () => clearInterval(interval);
  }, [playerReady]);

  const percent =
    requiredSeconds === 0 ? 100 : Math.min(Math.floor((watched / requiredSeconds) * 100), 100);

  const canMarkComplete =
    completed || videoDuration === 0 || percent >= 100;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
        <div ref={containerRef} className="w-full h-full" />
      </div>

      <div className="glass p-5 rounded-2xl border border-white/40">
        <div className="flex justify-between items-center text-sm mb-3">
          <span className="text-gray-500 font-medium">Прогресс просмотра</span>
          <span className="font-bold">
            {formatTime(watched)} / {formatTime(requiredSeconds)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              percent >= 100
                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                : "bg-gradient-to-r from-blue-500 to-purple-500"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-3">
          {completed
            ? "✅ Урок пройден"
            : canMarkComplete
            ? "✅ Достаточно для зачёта — нажмите кнопку ниже"
            : `Нужно посмотреть ещё ${100 - percent}%`}
        </p>
      </div>

      <button
        onClick={() => save(maxWatchedRef.current, true)}
        disabled={!canMarkComplete || completed || saving}
        className={`w-full py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
          completed
            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            : canMarkComplete
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl hover:scale-[1.02]"
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> Сохранение...
          </>
        ) : completed ? (
          <>
            <CheckCircle className="w-5 h-5" /> Урок пройден
          </>
        ) : canMarkComplete ? (
          <>
            <CheckCircle className="w-5 h-5" /> Отметить как пройденное
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" /> Посмотрите видео до конца
          </>
        )}
      </button>
    </div>
  );
}
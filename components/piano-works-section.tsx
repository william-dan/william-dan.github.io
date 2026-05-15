"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { siteContent } from "@/lib/site-content";

type PianoWorkItem = (typeof siteContent.pianoWorks.items)[number];

function PianoStageLoadingShell() {
  return (
    <div
      className="relative min-h-[18rem] overflow-hidden border border-border/15 bg-background/15 sm:min-h-[21rem] lg:min-h-[36rem]"
      role="img"
      aria-label="Grand piano stage"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(236,220,193,0.1),rgba(236,220,193,0.02)_26%,rgba(10,10,15,0)_70%)]" />
      <div className="absolute inset-y-0 left-[24%] w-px bg-border/15" />
      <div className="absolute inset-y-0 right-[14%] w-px bg-border/10" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(10,10,15,0),rgba(10,10,15,0.8))]" />
      <div className="absolute inset-[12%] bg-[radial-gradient(circle_at_52%_18%,rgba(236,220,193,0.15),rgba(236,220,193,0.06)_24%,rgba(10,10,15,0)_68%)] blur-[72px]" />
      <div className="absolute inset-x-[16%] bottom-[9%] h-28 rounded-[999px] bg-[radial-gradient(ellipse_at_center,rgba(236,220,193,0.18),rgba(236,220,193,0.06)_34%,rgba(10,10,15,0)_72%)] blur-2xl" />
      <div className="absolute left-1/2 top-[22%] h-[34%] w-[56%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_50%_0%,rgba(236,220,193,0.18),rgba(236,220,193,0.08)_25%,rgba(10,10,15,0)_70%)] blur-3xl" />
      <div className="absolute left-1/2 top-[56%] h-[28%] w-[58%] -translate-x-1/2 rounded-[50%] border border-border/15 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04),rgba(10,10,15,0)_72%)] blur-xl" />
    </div>
  );
}

const GrandPianoStage = dynamic(
  () =>
    import("@/components/grand-piano-stage").then(
      (module) => module.GrandPianoStage
    ),
  {
    ssr: false,
    loading: () => <PianoStageLoadingShell />,
  }
);

const PIANO_STAGE_MODEL_PATH = "/models/grand_piano.glb";
const PIANO_STAGE_BASE_ENV_PATH = "/models/studio_small_03_1k.exr";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "--:--";
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);

  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

function AudioPlayIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 fill-current"
    >
      <path d="M8 6.5v11l9-5.5-9-5.5Z" />
    </svg>
  );
}

function AudioPauseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 fill-current"
    >
      <path d="M7.5 6.5h3v11h-3zM13.5 6.5h3v11h-3z" />
    </svg>
  );
}

function AudioPlayerRow({
  item,
  isActive,
  registerAudio,
  pauseOtherPlayers,
  markActive,
  clearActive,
}: {
  item: PianoWorkItem;
  isActive: boolean;
  registerAudio: (id: string, node: HTMLAudioElement | null) => void;
  pauseOtherPlayers: (id: string) => void;
  markActive: (id: string) => void;
  clearActive: (id: string) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const syncDuration = () => {
      setDuration(audio.duration || 0);
    };
    const syncTime = () => {
      setCurrentTime(audio.currentTime);
    };
    const handlePlay = () => {
      markActive(item.id);
    };
    const handlePause = () => {
      clearActive(item.id);
    };
    const handleEnded = () => {
      clearActive(item.id);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", syncDuration);
    audio.addEventListener("timeupdate", syncTime);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", syncDuration);
      audio.removeEventListener("timeupdate", syncTime);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [clearActive, item.id, markActive]);

  const canPlay = item.available && Boolean(item.audioSrc);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const togglePlayback = async () => {
    const audio = audioRef.current;

    if (!audio || !canPlay) {
      return;
    }

    if (audio.paused) {
      pauseOtherPlayers(item.id);

      try {
        await audio.play();
      } catch {
        clearActive(item.id);
      }

      return;
    }

    audio.pause();
  };

  const handleSeek = (nextValue: string) => {
    const audio = audioRef.current;

    if (!audio || !canPlay) {
      return;
    }

    const nextTime = Number(nextValue);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  return (
    <article
      className={`border-t border-border/20 py-6 first:border-t-0 first:pt-0 last:pb-0 ${
        isActive ? "bg-background/10" : ""
      }`}
    >
      <div className="flex flex-col gap-5">
        <h3 className="font-sans text-xl font-light tracking-tight text-foreground">
          {item.title}
        </h3>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              void togglePlayback();
            }}
            disabled={!canPlay}
            aria-label={canPlay ? `Play ${item.title}` : `${item.title} unavailable`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/30 bg-background/55 text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:border-border/15 disabled:text-foreground-muted/35"
          >
            {isActive ? <AudioPauseIcon /> : <AudioPlayIcon />}
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step="0.1"
              value={canPlay ? currentTime : 0}
              onChange={(event) => handleSeek(event.target.value)}
              disabled={!canPlay}
              aria-label={`Seek ${item.title}`}
              className="audio-progress h-2 w-full cursor-pointer appearance-none rounded-full border border-border/20 bg-background/40 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(90deg, rgba(196,181,160,0.88) 0%, rgba(196,181,160,0.88) ${progress}%, rgba(255,255,255,0.06) ${progress}%, rgba(255,255,255,0.06) 100%)`,
              }}
            />
            <div className="min-w-[5.5rem] text-right font-mono text-[10px] text-foreground-muted/65">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>

        <audio
          ref={(node) => {
            audioRef.current = node;
            registerAudio(item.id, node);
          }}
          preload="metadata"
          src={item.audioSrc}
        />
      </div>
    </article>
  );
}

export function PianoWorksSection() {
  const { pianoWorks } = siteContent;
  const audioRegistryRef = useRef(new Map<string, HTMLAudioElement>());
  const [activeWorkId, setActiveWorkId] = useState<string | null>(null);

  useEffect(() => {
    let hasCancelled = false;
    let timeoutId: number | null = null;
    let idleCallbackId: number | null = null;

    const warmPianoStage = () => {
      if (hasCancelled) {
        return;
      }

      void import("@/components/grand-piano-stage");
      void fetch(PIANO_STAGE_MODEL_PATH, { cache: "force-cache" }).catch(() => {
        // Ignore warm-up fetch errors; runtime loading has its own fallback path.
      });
      void fetch(PIANO_STAGE_BASE_ENV_PATH, { cache: "force-cache" }).catch(() => {
        // Ignore warm-up fetch errors; runtime loading has its own fallback path.
      });
    };

    const idleWindow = window as Window & {
      requestIdleCallback?: (
        callback: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void,
        options?: { timeout: number }
      ) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (typeof idleWindow.requestIdleCallback === "function") {
      idleCallbackId = idleWindow.requestIdleCallback(
        () => {
          warmPianoStage();
        },
        { timeout: 1800 }
      );
    } else {
      timeoutId = window.setTimeout(warmPianoStage, 420);
    }

    return () => {
      hasCancelled = true;

      if (
        idleCallbackId !== null &&
        typeof idleWindow.cancelIdleCallback === "function"
      ) {
        idleWindow.cancelIdleCallback(idleCallbackId);
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  const registerAudio = (id: string, node: HTMLAudioElement | null) => {
    if (node) {
      audioRegistryRef.current.set(id, node);
      return;
    }

    audioRegistryRef.current.delete(id);
  };

  const pauseOtherPlayers = (id: string) => {
    audioRegistryRef.current.forEach((audio, audioId) => {
      if (audioId !== id) {
        audio.pause();
      }
    });
  };

  const markActive = (id: string) => {
    setActiveWorkId(id);
  };

  const clearActive = (id: string) => {
    setActiveWorkId((currentId) => (currentId === id ? null : currentId));
  };

  return (
    <section
      id="piano-works"
      className="relative z-10 overflow-hidden bg-background/60 py-32 backdrop-blur-sm"
    >
      <div className="container">
        <div className="mb-16 flex items-baseline gap-4">
          <span className="font-mono text-[10px] tracking-widest text-foreground-muted">
            §3
          </span>
          <h2 className="font-sans text-2xl font-light tracking-tight md:text-3xl">
            Piano Works
          </h2>
          <div className="ml-4 flex-1 border-t border-border/30" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.16fr)_minmax(24rem,0.84fr)] lg:items-start lg:gap-12">
          <GrandPianoStage isActive={activeWorkId !== null} />

          <div className="border border-border/20 bg-background/30 px-6 py-8 md:px-9 md:py-11">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground-muted">
              Piano Works
            </p>
            <p className="mt-5 max-w-lg font-sans text-base leading-relaxed text-foreground/84 md:text-lg">
              {pianoWorks.intro}
            </p>

            <div className="mt-8">
              {pianoWorks.items.map((item) => (
                <AudioPlayerRow
                  key={item.id}
                  item={item}
                  isActive={activeWorkId === item.id}
                  registerAudio={registerAudio}
                  pauseOtherPlayers={pauseOtherPlayers}
                  markActive={markActive}
                  clearActive={clearActive}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import {
  CircleNotchIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
  StopIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Status = "idle" | "loading" | "playing" | "error";

let currentAudio: HTMLAudioElement | null = null;

type Props = {
  text: string;
  label?: string;
  size?: "icon-xs" | "icon-sm" | "icon";
  className?: string;
};

export function SpeakButton({
  text,
  label = "Listen",
  size = "icon-sm",
  className,
}: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  function stop() {
    audioRef.current?.pause();
  }

  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        if (currentAudio === audio) currentAudio = null;
      }
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const trimmed = text.trim();

  async function play() {
    if (!trimmed) return;
    if (currentAudio && currentAudio !== audioRef.current) currentAudio.pause();
    setError(null);

    let src = urlRef.current;
    if (!src) {
      setStatus("loading");
      try {
        const res = await fetch(
          `/api/lib/speak?text=${encodeURIComponent(trimmed)}`,
        );
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          setError(data.error ?? `Playback failed (${res.status})`);
          setStatus("error");
          return;
        }
        src = URL.createObjectURL(await res.blob());
        urlRef.current = src;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Playback failed");
        setStatus("error");
        return;
      }
    }

    const audio = new Audio(src);
    audio.addEventListener("ended", () => setStatus("idle"));
    audio.addEventListener("pause", () => {
      setStatus((prev) => (prev === "playing" ? "idle" : prev));
    });
    audio.addEventListener("error", () => {
      setError("Couldn't play the audio");
      setStatus("error");
    });
    audioRef.current?.pause();
    audioRef.current = audio;

    try {
      await audio.play();
      currentAudio = audio;
      setStatus("playing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't play the audio");
      setStatus("error");
    }
  }

  const busy = status === "loading";
  const playing = status === "playing";
  const tooltip =
    status === "error"
      ? (error ?? "Playback failed")
      : playing
        ? "Stop"
        : busy
          ? "Generating audio…"
          : label;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size={size}
            aria-label={playing ? "Stop playback" : label}
            disabled={!trimmed || busy}
            onClick={() => (playing ? stop() : void play())}
            className={
              status === "error"
                ? `text-destructive hover:text-destructive ${className ?? ""}`
                : `text-zinc-400 hover:text-foreground dark:text-zinc-500 ${className ?? ""}`
            }
          >
            {busy ? (
              <CircleNotchIcon weight="bold" className="animate-spin" />
            ) : status === "error" ? (
              <SpeakerSlashIcon weight="bold" />
            ) : playing ? (
              <StopIcon weight="fill" />
            ) : (
              <SpeakerHighIcon weight="bold" />
            )}
          </Button>
        }
      />
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

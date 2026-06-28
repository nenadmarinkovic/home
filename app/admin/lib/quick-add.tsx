"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpIcon,
  CircleNotchIcon,
  MicrophoneIcon,
} from "@phosphor-icons/react";

import { useToasts } from "@/components/toasts";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

const MAX_HEIGHT_PX = 180; // matches max-h-44 area

// Pick a container the current browser can actually record. Chrome/Firefox
// hand back webm/opus; iOS Safari only does mp4/aac. Feature-detect instead of
// hard-coding so the same code path works on the iPhone PWA.
function pickPreferredMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/mpeg",
    "audio/ogg",
  ];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c)) return c;
  }
  return "";
}

// Voxtral keys its decoder off the file extension, so map the recorded
// container to a matching name.
function extForMimeType(mimeType: string): string {
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("mpeg")) return "mp3";
  if (mimeType.includes("ogg")) return "ogg";
  return "webm";
}

export function QuickAdd({ className }: Props) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const { push, update } = useToasts();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Auto-grow the textarea with the content, up to MAX_HEIGHT_PX.
  // Skip the resize when the textarea is empty so the CSS min-height owns
  // the initial render (otherwise the brief `height: auto` reset causes a
  // flicker on hydration before min-h reasserts). Toggle overflow so the
  // scrollbar only appears once we hit MAX, not transiently while growing.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    if (!value) {
      el.style.height = "";
      el.style.overflowY = "hidden";
      return;
    }
    el.style.height = "auto";
    const target = Math.min(el.scrollHeight, MAX_HEIGHT_PX);
    el.style.height = target + "px";
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT_PX ? "auto" : "hidden";
  }, [value]);

  // Release the mic if the component unmounts mid-recording.
  useEffect(() => {
    return () => {
      const stream = streamRef.current;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function submitLines(lines: string[]) {
    await Promise.allSettled(lines.map((line) => addOne(line)));
    router.refresh();
  }

  async function addOne(raw: string) {
    const input = raw.trim();
    if (!input) return;
    const short = input.length > 36 ? input.slice(0, 33) + "…" : input;
    const id = push({ title: `Adding "${short}"`, message: "Generating…" });

    try {
      const enrichRes = await fetch("/api/lib/enrich", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ term: input }),
      });
      const enrichData = (await enrichRes.json().catch(() => ({}))) as {
        ok?: boolean;
        entry?: Record<string, unknown> & {
          term?: string;
          translationSr?: string;
          pos?: string;
          gender?: string | null;
        };
        error?: string;
      };
      if (!enrichRes.ok || !enrichData.ok || !enrichData.entry) {
        update(id, {
          status: "error",
          title: `Couldn't enrich "${short}"`,
          message: enrichData.error ?? `HTTP ${enrichRes.status}`,
        });
        return;
      }
      const entry = enrichData.entry;
      const headword =
        typeof entry.term === "string" && entry.term ? entry.term : input;

      update(id, {
        title: `Saving ${headword}`,
        message: "Storing entry and queueing cards…",
      });

      const saveRes = await fetch("/api/lib/entries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...entry,
          source: "mistral",
          tags: typeof entry.tags === "string" ? entry.tags : "",
          notes: typeof entry.notes === "string" ? entry.notes : "",
          examples: Array.isArray(entry.examples) ? entry.examples : [],
          conjugations:
            entry.conjugations &&
            typeof entry.conjugations === "object" &&
            !Array.isArray(entry.conjugations)
              ? entry.conjugations
              : {},
        }),
      });
      const saveData = (await saveRes.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!saveRes.ok || !saveData.ok) {
        update(id, {
          status: "error",
          title: `Save failed: ${headword}`,
          message: saveData.error ?? `HTTP ${saveRes.status}`,
        });
        return;
      }

      const subtitle = [
        entry.pos === "noun" && entry.gender
          ? `${entry.gender} ${headword}`
          : headword,
        entry.translationSr,
      ]
        .filter(Boolean)
        .join(" · ");

      update(id, {
        status: "success",
        title: `Added ${headword}`,
        message: subtitle,
      });
    } catch (err) {
      update(id, {
        status: "error",
        title: `Failed "${short}"`,
        message: err instanceof Error ? err.message : "Network error",
      });
    }
  }

  async function onSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const lines = value
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (lines.length === 0) return;
    setValue("");
    setBusy(true);
    try {
      await submitLines(lines);
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  function releaseStream() {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  }

  async function handleRecorded(mimeType: string) {
    const chunks = chunksRef.current;
    chunksRef.current = [];
    releaseStream();
    setRecording(false);

    const type = mimeType || chunks[0]?.type || "audio/webm";
    const blob = new Blob(chunks, { type });
    if (blob.size === 0) return;

    setTranscribing(true);
    const id = push({
      title: "Transcribing…",
      message: "Converting your recording to text",
    });
    try {
      const fd = new FormData();
      fd.append("audio", blob, `recording.${extForMimeType(type)}`);
      const res = await fetch("/api/lib/transcribe", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        text?: string;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.text) {
        update(id, {
          status: "error",
          title: "Couldn't transcribe",
          message: data.error ?? `HTTP ${res.status}`,
        });
        return;
      }
      const text = data.text.trim();
      update(id, {
        status: "success",
        title: "Transcribed",
        message: text.length > 80 ? text.slice(0, 77) + "…" : text,
      });
      // Drop the transcript into the box so it can be reviewed/edited before
      // sending, rather than adding it blind.
      setValue((prev) => {
        const base = prev.trim();
        return base ? `${base} ${text}` : text;
      });
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (el) {
          el.focus();
          const end = el.value.length;
          el.setSelectionRange(end, end);
        }
      });
    } catch (err) {
      update(id, {
        status: "error",
        title: "Transcription failed",
        message: err instanceof Error ? err.message : "Network error",
      });
    } finally {
      setTranscribing(false);
    }
  }

  async function startRecording() {
    if (busy || transcribing || recording) return;
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      push({
        status: "error",
        title: "Recording not supported",
        message: "This browser can't reach the microphone.",
      });
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      push({
        status: "error",
        title: "Microphone blocked",
        message:
          err instanceof Error
            ? err.message
            : "Allow microphone access to record.",
      });
      return;
    }

    streamRef.current = stream;
    const mimeType = pickPreferredMimeType();
    let recorder: MediaRecorder;
    try {
      recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
    } catch {
      recorder = new MediaRecorder(stream);
    }

    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      void handleRecorded(recorder.mimeType);
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    setRecording(true);
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop(); // fires onstop → handleRecorded
    } else {
      releaseStream();
      setRecording(false);
    }
  }

  function toggleRecording() {
    if (recording) stopRecording();
    else void startRecording();
  }

  const canSend =
    !busy && !recording && !transcribing && value.trim().length > 0;
  const voiceLabel = transcribing
    ? "Transcribing…"
    : recording
      ? "Stop"
      : "Voice";

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className={cn(
        "group/quick relative flex w-full flex-col rounded-[1.75rem] border border-foreground/15 bg-field shadow-sm shadow-foreground/5 transition-[color,box-shadow,border-color]",
        "focus-within:border-foreground/40 focus-within:ring-2 focus-within:ring-foreground/10",
        className,
      )}
    >
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        placeholder="Add a word or sentence…"
        className="block max-h-44 min-h-12 w-full resize-none overflow-y-hidden border-0 bg-transparent px-4 pb-0.5 pt-2.5 text-base leading-normal shadow-none focus-visible:border-transparent focus-visible:ring-0 md:min-h-8 md:px-3.5 md:pt-2 md:text-sm md:leading-relaxed"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />
      <div className="flex items-center justify-between gap-2 px-2.5 pb-2 md:pb-1.5">
        <button
          type="button"
          onClick={toggleRecording}
          disabled={busy || transcribing}
          aria-pressed={recording}
          aria-label={
            recording ? "Stop recording" : "Record a word or sentence"
          }
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium transition-colors",
            "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
            recording
              ? "bg-red-500/10 text-red-600 hover:bg-red-500/15 dark:text-red-400"
              : "text-zinc-500 hover:bg-foreground/5 hover:text-foreground",
          )}
        >
          {transcribing ? (
            <CircleNotchIcon weight="bold" className="size-4 animate-spin" />
          ) : recording ? (
            <span className="size-2.5 rounded-[2px] bg-red-500 motion-safe:animate-pulse" />
          ) : (
            <MicrophoneIcon weight="fill" className="size-4" />
          )}
          <span>{voiceLabel}</span>
        </button>
        <button
          type="submit"
          aria-label="Add"
          disabled={!canSend}
          className={cn(
            "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors",
            canSend
              ? "bg-foreground text-background hover:bg-foreground/85"
              : "bg-foreground/10 text-zinc-400",
            "disabled:cursor-not-allowed",
          )}
        >
          <ArrowUpIcon weight="bold" className="size-3.5" />
        </button>
      </div>
    </form>
  );
}

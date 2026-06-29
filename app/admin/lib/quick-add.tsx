"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
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

// Languages the live preview can listen for. Web Speech only does one at a
// time, so we expose a toggle; Voxtral still auto-detects on the final pass.
type PreviewLang = "sr-RS" | "de-DE";

// Minimal shape of the Web Speech API we rely on. It isn't in the DOM lib
// typings and is vendor-prefixed on Chromium, so we describe just what we use.
type SpeechResultAlt = { transcript: string };
type SpeechResult = { isFinal: boolean; 0: SpeechResultAlt };
type SpeechEvent = { results: ArrayLike<SpeechResult> };
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

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
  // Provisional live transcript shown inline while speaking. Voxtral's result
  // replaces it once the recording is sent.
  const [interim, setInterim] = useState("");
  const [previewLang, setPreviewLang] = useState<PreviewLang>("sr-RS");
  // Web Speech is client-only and absent on some browsers (e.g. iOS Safari).
  // useSyncExternalStore renders `false` on the server and the real value after
  // hydration, so the toggle appears without a hydration mismatch.
  const speechSupported = useSyncExternalStore(
    () => () => {},
    () => getSpeechRecognitionCtor() !== null,
    () => false,
  );
  const { push, update } = useToasts();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // The dimmed preview is only ever visible while a live transcript exists and
  // we're still capturing or transcribing. While it's showing, the real
  // textarea text is rendered transparent and the overlay paints the words.
  const previewActive = (recording || transcribing) && interim.length > 0;
  const displayValue = previewActive
    ? value
      ? `${value} ${interim}`
      : interim
    : value;

  // Auto-grow the textarea with the content, up to MAX_HEIGHT_PX.
  // Skip the resize when the textarea is empty so the CSS min-height owns
  // the initial render (otherwise the brief `height: auto` reset causes a
  // flicker on hydration before min-h reasserts). Toggle overflow so the
  // scrollbar only appears once we hit MAX, not transiently while growing.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    if (!displayValue) {
      el.style.height = "";
      el.style.overflowY = "hidden";
      if (overlayRef.current) overlayRef.current.scrollTop = 0;
      return;
    }
    el.style.height = "auto";
    const target = Math.min(el.scrollHeight, MAX_HEIGHT_PX);
    el.style.height = target + "px";
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT_PX ? "auto" : "hidden";
    // While a live preview is streaming in, keep the newest words in view and
    // mirror the scroll position onto the overlay so the two stay aligned.
    if (previewActive) {
      el.scrollTop = el.scrollHeight;
      if (overlayRef.current) overlayRef.current.scrollTop = el.scrollTop;
    }
  }, [displayValue, previewActive]);

  // Release the mic if the component unmounts mid-recording.
  useEffect(() => {
    return () => {
      const stream = streamRef.current;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      const rec = recognitionRef.current;
      if (rec) {
        rec.onresult = rec.onerror = rec.onend = null;
        try {
          rec.stop();
        } catch {
          /* already stopped */
        }
      }
    };
  }, []);

  // Run the browser's on-device/cloud recognizer alongside MediaRecorder to
  // paint words inline as they're spoken. Voxtral remains the source of truth,
  // so any recognizer error is swallowed — we just lose the live preview.
  function startLivePreview(lang: PreviewLang) {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;
    try {
      const rec = new Ctor();
      rec.lang = lang;
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (e) => {
        let text = "";
        for (let i = 0; i < e.results.length; i++) {
          text += e.results[i][0].transcript;
        }
        setInterim(text.trim());
      };
      rec.onerror = () => {};
      rec.onend = () => {};
      recognitionRef.current = rec;
      rec.start();
    } catch {
      recognitionRef.current = null;
    }
  }

  function stopLivePreview() {
    const rec = recognitionRef.current;
    if (!rec) return;
    rec.onresult = rec.onerror = rec.onend = null;
    try {
      rec.stop();
    } catch {
      /* already stopped */
    }
    recognitionRef.current = null;
  }

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
    if (blob.size === 0) {
      setInterim("");
      return;
    }

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
      // Voxtral has had its say (or failed); drop the provisional preview.
      setInterim("");
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
    setInterim("");
    recorder.start();
    startLivePreview(previewLang);
    setRecording(true);
  }

  function stopRecording() {
    stopLivePreview();
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
        "group/quick relative flex w-full flex-col rounded-[1.75rem] border border-foreground/15 bg-field shadow-sm shadow-foreground/5 transition-[color,box-shadow,border-color] md:rounded-md md:shadow-none",
        "focus-within:border-foreground/40 focus-within:ring-2 focus-within:ring-foreground/10",
        className,
      )}
    >
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={displayValue}
          readOnly={previewActive}
          onChange={(e) => {
            if (!previewActive) setValue(e.target.value);
          }}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Add a word or sentence…"
          className={cn(
            "block max-h-44 min-h-12 w-full resize-none overflow-y-hidden border-0 bg-transparent px-4 pb-0.5 pt-2.5 text-base leading-normal shadow-none focus-visible:border-transparent focus-visible:ring-0 md:min-h-8 md:px-3.5 md:pt-2 md:text-sm md:leading-relaxed",
            // Hide the real text while the styled preview overlay paints it.
            previewActive && "text-transparent caret-transparent",
          )}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {previewActive && (
          <div
            ref={overlayRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 max-h-44 overflow-hidden whitespace-pre-wrap break-words px-4 pb-0.5 pt-2.5 text-base leading-normal md:px-3.5 md:pt-2 md:text-sm md:leading-relaxed"
          >
            {value ? <span>{value} </span> : null}
            <span className="italic text-foreground/40">{interim}</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 px-2.5 pb-2 md:pb-1.5">
        {/* Voice + live-preview language toggle are mobile-only. On desktop the
            box sits above the search field and we keep it search-like: just the
            submit affordance, no mic or SR/DE switch. */}
        <div className="flex items-center gap-0.5 md:hidden">
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
          {speechSupported && (
            <button
              type="button"
              onClick={() =>
                setPreviewLang((l) => (l === "sr-RS" ? "de-DE" : "sr-RS"))
              }
              disabled={recording || transcribing}
              aria-label={`Live preview language: ${previewLang === "sr-RS" ? "Serbian" : "German"}. Tap to switch.`}
              title="Language for the live preview while speaking"
              className={cn(
                "rounded-full px-2 py-1 text-xs font-semibold tabular-nums transition-colors",
                "cursor-pointer text-zinc-500 hover:bg-foreground/5 hover:text-foreground",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              {previewLang === "sr-RS" ? "SR" : "DE"}
            </button>
          )}
        </div>
        <button
          type="submit"
          aria-label="Add"
          disabled={!canSend}
          className={cn(
            "ml-auto flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors",
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

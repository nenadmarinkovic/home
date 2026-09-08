"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { flushSync } from "react-dom";
import {
  ArrowUpIcon,
  ChatCircleIcon,
  CircleNotchIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useVisualViewport } from "@/lib/use-visual-viewport";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };

type Props = {
  endpoint: string;
  payload: Record<string, unknown>;
  title: string;
  description: string;
  intro: string;
  triggerLabel: React.ReactNode;
  triggerAriaLabel: string;
  triggerClassName?: string;
};

const MARKUP = /\*\*([^\n]+?)\*\*|\*([^*\n]+?)\*|`([^`\n]+?)`/g;

function formatReply(text: string): React.ReactNode {
  if (!/[*`]/.test(text)) return text;
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(MARKUP)) {
    const at = match.index;
    if (at > last) out.push(text.slice(last, at));
    last = at + match[0].length;
    const [, bold, emphasis, code] = match;
    out.push(
      <span
        key={at}
        className={
          bold === undefined
            ? "font-semibold text-[#0040ff] dark:text-[#ffff01]"
            : "font-semibold"
        }
      >
        {bold ?? emphasis ?? code}
      </span>,
    );
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const MAX_HEIGHT_PX = 180;

const NARROW_QUERY = "(max-width: 639px)";

const TOP_GAP = "calc(var(--safe-top) + 0.75rem)";
const BOTTOM_GAP = "max(var(--inset-bottom), 0.75rem)";
const KEYBOARD_BOTTOM_GAP = "0.75rem";

function subscribeNarrow(cb: () => void) {
  const mq = window.matchMedia(NARROW_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getNarrowSnapshot() {
  return window.matchMedia(NARROW_QUERY).matches;
}

function getNarrowServerSnapshot() {
  return false;
}

function useIsNarrowViewport() {
  return useSyncExternalStore(
    subscribeNarrow,
    getNarrowSnapshot,
    getNarrowServerSnapshot,
  );
}

export function AiChat({
  endpoint,
  payload,
  title,
  description,
  intro,
  triggerLabel,
  triggerAriaLabel,
  triggerClassName,
}: Props) {
  const introMessage: Message = { role: "assistant", content: intro };
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([introMessage]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const proxyRef = useRef<HTMLInputElement>(null);
  const vv = useVisualViewport();
  const isNarrow = useIsNarrowViewport();

  function openChat() {
    proxyRef.current?.focus({ preventScroll: true });
    flushSync(() => setOpen(true));
    textareaRef.current?.focus({ preventScroll: true });
  }

  const bottomGap = vv?.keyboardOpen ? KEYBOARD_BOTTOM_GAP : BOTTOM_GAP;
  const contentStyle: React.CSSProperties | undefined =
    isNarrow && vv
      ? {
          top: `calc(${vv.offsetTop}px + ${TOP_GAP})`,
          height: `calc(${vv.height}px - ${TOP_GAP} - ${bottomGap})`,
          maxHeight: `calc(${vv.height}px - ${TOP_GAP} - ${bottomGap})`,
          translate: "-50% 0",
        }
      : undefined;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setMessages([introMessage]);
      setDraft("");
      setError(null);
      setPending(false);
    }
  }

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    if (!draft) {
      el.style.height = "";
      el.style.overflowY = "hidden";
      return;
    }
    el.style.height = "auto";
    const target = Math.min(el.scrollHeight, MAX_HEIGHT_PX);
    el.style.height = target + "px";
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT_PX ? "auto" : "hidden";
  }, [draft]);

  async function send() {
    const text = draft.trim();
    if (!text || pending) return;

    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setDraft("");
    setError(null);
    setPending(true);

    try {
      const outbound = next.slice(1);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload, messages: outbound }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        reply?: string;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.reply) {
        setError(data.error ?? `Chat failed (${res.status})`);
        return;
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply! },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat failed");
    } finally {
      setPending(false);
      textareaRef.current?.focus();
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={openChat}
        title={triggerAriaLabel}
        aria-label={triggerAriaLabel}
        className={cn("h-9", triggerClassName)}
      >
        <ChatCircleIcon weight="bold" className="shrink-0" />
        {triggerLabel}
      </Button>

      <input
        ref={proxyRef}
        type="text"
        inputMode="text"
        tabIndex={-1}
        defaultValue=""
        aria-hidden="true"
        className="fixed bottom-0 right-0 size-2 cursor-default border-0 bg-transparent p-0 text-transparent caret-transparent outline-none"
        style={{ fontSize: "16px" }}
      />

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          style={contentStyle}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
          className="top-[calc(var(--safe-top)+0.75rem)] h-[calc(100dvh-var(--safe-top)-max(var(--inset-bottom),0.75rem)-0.75rem)] max-h-[calc(100dvh-var(--safe-top)-max(var(--inset-bottom),0.75rem)-0.75rem)] w-[calc(100vw-1.5rem)] translate-y-0 sm:top-1/2 sm:h-[min(80vh,40rem)] sm:max-h-[92vh] sm:w-[min(95vw,32rem)] sm:-translate-y-1/2"
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <DialogBody ref={scrollerRef} className="scrollbar-thin">
            <ul className="flex flex-col gap-3">
              {messages.map((m, i) => (
                <li
                  key={i}
                  className={cn(
                    "flex w-full",
                    m.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 font-sans text-sm leading-relaxed",
                      m.role === "user"
                        ? "bg-foreground text-background"
                        : "bg-foreground/6 text-foreground",
                    )}
                  >
                    {m.role === "assistant"
                      ? formatReply(m.content)
                      : m.content}
                  </div>
                </li>
              ))}
              {pending && (
                <li className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-foreground/6 px-3.5 py-2 font-sans text-sm text-zinc-500">
                    <CircleNotchIcon
                      weight="bold"
                      className="size-3.5 animate-spin"
                    />
                    Razmišljam…
                  </div>
                </li>
              )}
              {error && (
                <li className="flex justify-start">
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-3.5 py-2 font-sans text-sm text-destructive">
                    {error}
                  </div>
                </li>
              )}
            </ul>
          </DialogBody>

          <DialogFooter className="flex-col items-stretch justify-start gap-0">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Napiši pitanje…"
                disabled={pending}
                className="scrollbar-thin block max-h-44 min-h-12 resize-none overflow-y-hidden pr-12"
                autoCapitalize="off"
                autoCorrect="off"
              />
              {(() => {
                const canSend = !pending && draft.trim().length > 0;
                return (
                  <button
                    type="button"
                    onClick={() => void send()}
                    disabled={!canSend}
                    aria-label="Send"
                    className={cn(
                      "absolute bottom-1.5 right-1.5 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors md:size-6",
                      canSend
                        ? "bg-foreground text-background hover:bg-foreground/85"
                        : "bg-foreground/10 text-zinc-400",
                      "disabled:cursor-not-allowed",
                    )}
                  >
                    <ArrowUpIcon weight="bold" className="size-3.5" />
                  </button>
                );
              })()}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

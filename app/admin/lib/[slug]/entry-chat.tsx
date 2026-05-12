"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowUpIcon,
  ChatCircleIcon,
  CircleNotchIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };

type Props = {
  slug: string;
  term: string;
};

const MAX_HEIGHT_PX = 180;

const INTRO: Message = {
  role: "assistant",
  content:
    "Šta želiš da saznaš o ovoj reči? Možeš me pitati za upotrebu, gramatiku, primere, registar ili nešto drugo.",
};

export function EntryChat({ slug, term }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INTRO]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setMessages([INTRO]);
      setDraft("");
      setError(null);
      setPending(false);
    }
  }

  // Auto-scroll to newest message.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  // Auto-grow textarea with content up to MAX_HEIGHT_PX, then scroll inside.
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
      // Strip the hardcoded intro before sending — model gets full user history,
      // not its own greeting, which would otherwise count toward token budget.
      const outbound = next.filter((m) => m !== INTRO);
      const res = await fetch("/api/lib/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, messages: outbound }),
      });
      const data = (await res.json()) as { ok?: boolean; reply?: string; error?: string };
      if (!res.ok || !data.ok || !data.reply) {
        setError(data.error ?? `Chat failed (${res.status})`);
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply! }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat failed");
    } finally {
      setPending(false);
      // Refocus the textarea so the user can keep typing without tapping.
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
        className="h-9"
        onClick={() => setOpen(true)}
        aria-label="Chat about this entry"
      >
        <ChatCircleIcon weight="bold" />
        Chat
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="flex h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] flex-col gap-0 p-0 sm:h-[min(80vh,40rem)] sm:w-[min(95vw,32rem)]">
          <DialogHeader className="border-b border-foreground/10 px-5 py-3 sm:px-6 sm:py-4">
            <DialogTitle className="font-serif text-lg leading-tight tracking-tight">
              {term}
            </DialogTitle>
            <DialogDescription className="font-sans text-xs">
              Razgovaraj sa AI tutorom o ovoj odrednici.
            </DialogDescription>
          </DialogHeader>

          <div
            ref={scrollerRef}
            className="scrollbar-thin flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6"
          >
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
                        : "bg-foreground/[0.06] text-foreground",
                    )}
                  >
                    {m.content}
                  </div>
                </li>
              ))}
              {pending && (
                <li className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-foreground/[0.06] px-3.5 py-2 font-sans text-sm text-zinc-500">
                    <CircleNotchIcon weight="bold" className="size-3.5 animate-spin" />
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
          </div>

          <div className="border-t border-foreground/10 p-3 sm:p-4">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Napiši pitanje…"
                disabled={pending}
                autoFocus
                className="scrollbar-thin block max-h-44 min-h-12 resize-none overflow-y-hidden pr-12"
                autoCapitalize="off"
                autoCorrect="off"
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={!draft.trim() || pending}
                aria-label="Send"
                className="absolute bottom-1.5 right-1.5 flex size-8 cursor-pointer items-center justify-center rounded-md bg-foreground text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30 md:size-7"
              >
                <ArrowUpIcon weight="bold" className="size-4 md:size-3.5" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

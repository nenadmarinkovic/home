"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle, Eye } from "@phosphor-icons/react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

import type { CardDirection, Rating } from "@/db/schema";
import type { VocabEntry } from "@/lib/lib-db";

type Stats = {
  due: number;
  newCards: number;
  total: number;
};

export type CardPayload = {
  id: number;
  direction: CardDirection;
  state: number;
  reps: number;
  due: string;
  entry: VocabEntry;
  previews: {
    again: string;
    hard: string;
    good: string;
    easy: string;
  };
};

type Props = {
  initialCard: CardPayload | null;
  initialStats: Stats;
};

const RATING_BUTTONS: { rating: Rating; label: string; key: string; tone: string }[] = [
  { rating: 1, label: "Again", key: "1", tone: "bg-rose-500/10 text-rose-700 dark:text-rose-400" },
  { rating: 2, label: "Hard", key: "2", tone: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  { rating: 3, label: "Good", key: "3", tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  { rating: 4, label: "Easy", key: "4", tone: "bg-sky-500/10 text-sky-700 dark:text-sky-400" },
];

export function ReviewClient({ initialCard, initialStats }: Props) {
  const [card, setCard] = useState<CardPayload | null>(initialCard);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (cardId: number, rating: Rating, durationMs: number) => {
      if (submitting) return;
      setSubmitting(true);
      setError(null);
      try {
        const submitRes = await fetch("/api/lib/review/submit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ cardId, rating, durationMs }),
        });
        const submitData = (await submitRes.json()) as {
          ok?: boolean;
          error?: string;
        };
        if (!submitRes.ok || !submitData.ok) {
          setError(submitData.error ?? `Submit failed (${submitRes.status})`);
          return;
        }

        const nextRes = await fetch("/api/lib/review/next", {
          cache: "no-store",
        });
        const nextData = (await nextRes.json()) as {
          ok?: boolean;
          stats?: Stats;
          card?: CardPayload | null;
          error?: string;
        };
        if (!nextRes.ok || !nextData.ok) {
          setError(nextData.error ?? `Load failed (${nextRes.status})`);
          return;
        }
        setCard(nextData.card ?? null);
        if (nextData.stats) setStats(nextData.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Submit failed");
      } finally {
        setSubmitting(false);
      }
    },
    [submitting],
  );

  return (
    <main className="flex flex-1 flex-col gap-8 py-16 font-sans">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin">Admin</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin/lib">Lib</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Review</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-serif text-3xl font-semibold leading-none tracking-tight text-foreground">
            Review
          </h1>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-xs font-medium uppercase tracking-wider text-zinc-500">
            <span>
              <span className="tabular-nums">{stats.due}</span> due
            </span>
            <span aria-hidden className="text-foreground/20">·</span>
            <span>
              <span className="tabular-nums">{stats.newCards}</span> new
            </span>
            <span aria-hidden className="text-foreground/20">·</span>
            <span>
              <span className="tabular-nums">{stats.total}</span> total
            </span>
          </p>
        </div>
        <Button asChild variant="outline" className="h-9">
          <Link href="/admin/lib">
            <ArrowLeft weight="bold" />
            Back to lib
          </Link>
        </Button>
      </header>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {!card ? (
        <Done stats={stats} />
      ) : (
        // `key` remounts CardView for each new card — that resets reveal/timer
        // state without us touching it from a parent effect.
        <CardView
          key={card.id}
          card={card}
          submitting={submitting}
          onRate={(rating, durationMs) =>
            void submit(card.id, rating, durationMs)
          }
        />
      )}
    </main>
  );
}

function CardView({
  card,
  submitting,
  onRate,
}: {
  card: CardPayload;
  submitting: boolean;
  onRate: (rating: Rating, durationMs: number) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const shownAtRef = useRef<number>(0);

  const rate = useCallback(
    (rating: Rating) => {
      const ms = shownAtRef.current
        ? Math.min(10 * 60 * 1000, Date.now() - shownAtRef.current)
        : 0;
      onRate(rating, ms);
    },
    [onRate],
  );

  // Start the timer once on mount. Component is keyed by card.id, so this
  // runs fresh for every card.
  useEffect(() => {
    shownAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
      }
      if (!revealed) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          setRevealed(true);
        }
        return;
      }
      const r = RATING_BUTTONS.find((b) => b.key === e.key);
      if (r) {
        e.preventDefault();
        rate(r.rating);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, rate]);

  const showGerman = card.direction === "de_sr";
  const front = showGerman ? formatGerman(card.entry) : card.entry.translationSr;
  const back = showGerman ? card.entry.translationSr : formatGerman(card.entry);
  const directionLabel = showGerman ? "DE → SR" : "SR → DE";

  return (
    <section className="flex flex-1 flex-col items-center gap-8">
      <div className="flex w-full max-w-xl flex-col items-center gap-6 rounded-2xl border border-foreground/10 bg-foreground/[0.02] px-6 py-12 text-center">
        <span className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-500">
          {directionLabel} · rep {card.reps}
        </span>
        <p className="font-serif text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          {front}
        </p>
        {revealed && (
          <>
            <hr className="w-12 border-foreground/20" />
            <p className="font-serif text-2xl italic text-zinc-700 dark:text-zinc-300 sm:text-3xl">
              {back}
            </p>
            {card.entry.examples.length > 0 && (
              <ul className="flex flex-col gap-2 text-left">
                {card.entry.examples.slice(0, 3).map((ex, idx) => (
                  <li
                    key={idx}
                    className="rounded-md bg-foreground/[0.03] px-3 py-2 font-serif text-sm"
                  >
                    <p className="text-foreground">{ex.de}</p>
                    <p className="italic text-zinc-500">{ex.sr}</p>
                  </li>
                ))}
              </ul>
            )}
            {card.entry.notes && (
              <p className="font-serif text-sm italic text-zinc-500">
                {card.entry.notes}
              </p>
            )}
          </>
        )}
      </div>

      {!revealed ? (
        <Button onClick={() => setRevealed(true)} className="h-11 px-8">
          <Eye weight="bold" />
          Show answer
          <kbd className="ml-2 rounded border border-foreground/20 px-1.5 py-0.5 font-sans text-[10px] uppercase tracking-wider text-zinc-500">
            Space
          </kbd>
        </Button>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {RATING_BUTTONS.map((b) => (
            <Button
              key={b.rating}
              onClick={() => rate(b.rating)}
              disabled={submitting}
              variant="outline"
              className={`h-11 px-5 ${b.tone}`}
            >
              <span className="font-medium">{b.label}</span>
              <kbd className="ml-1 rounded border border-foreground/20 px-1.5 py-0.5 font-sans text-[10px] uppercase tracking-wider text-zinc-500">
                {b.key}
              </kbd>
              <span className="ml-1 font-sans text-xs text-zinc-500">
                {previewLabel(card.previews, b.rating)}
              </span>
            </Button>
          ))}
        </div>
      )}
    </section>
  );
}

function Done({ stats }: { stats: Stats }) {
  const isEmpty = stats.total === 0;
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-foreground/15 px-6 py-14 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
        <CheckCircle weight="fill" className="size-5" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-serif text-base font-semibold text-foreground">
          {isEmpty ? "No cards yet" : "Nothing due"}
        </p>
        <p className="font-serif text-sm italic text-zinc-500">
          {isEmpty
            ? "Add an entry to get started."
            : "Come back later — the schedule has done its job."}
        </p>
      </div>
      <Button asChild variant="outline" className="mt-2">
        <Link href="/admin/lib">Back to lib</Link>
      </Button>
    </div>
  );
}

function formatGerman(entry: VocabEntry): string {
  if (entry.pos === "noun" && entry.gender) {
    return `${entry.gender} ${entry.term}`;
  }
  return entry.term;
}

function previewLabel(
  previews: CardPayload["previews"],
  rating: Rating,
): string {
  const iso =
    rating === 1
      ? previews.again
      : rating === 2
        ? previews.hard
        : rating === 3
          ? previews.good
          : previews.easy;
  return formatInterval(new Date(iso));
}

function formatInterval(due: Date): string {
  const ms = due.getTime() - Date.now();
  if (ms < 60_000) return "<1m";
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m`;
  if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)}h`;
  const days = ms / 86_400_000;
  if (days < 30) return `${Math.round(days)}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${(days / 365).toFixed(1)}y`;
}

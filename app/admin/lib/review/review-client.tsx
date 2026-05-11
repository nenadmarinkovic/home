"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, CheckCircleIcon, EyeIcon } from "@phosphor-icons/react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

type RatingButton = {
  rating: Rating;
  label: string;
  key: string;
  color: string;
};

// Microsoft palette mapped to FSRS ratings.
const RATING_BUTTONS: RatingButton[] = [
  { rating: 1, label: "Again", key: "1", color: "#F25022" },
  { rating: 2, label: "Hard", key: "2", color: "#FFB900" },
  { rating: 3, label: "Good", key: "3", color: "#7FBA00" },
  { rating: 4, label: "Easy", key: "4", color: "#00A4EF" },
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
            <span aria-hidden className="text-foreground/20">
              ·
            </span>
            <span>
              <span className="tabular-nums">{stats.newCards}</span> new
            </span>
            <span aria-hidden className="text-foreground/20">
              ·
            </span>
            <span>
              <span className="tabular-nums">{stats.total}</span> total
            </span>
          </p>
        </div>
        <Button asChild variant="outline" className="h-9">
          <Link href="/admin/lib" className="group">
            <ArrowLeftIcon
              weight="bold"
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
            />
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
  const front = showGerman
    ? formatGerman(card.entry)
    : card.entry.translationSr;
  const back = showGerman ? card.entry.translationSr : formatGerman(card.entry);
  const directionLabel = showGerman ? "DE → SR" : "SR → DE";
  const directionColor = showGerman ? "#F25022" : "#00A4EF";
  const examples = card.entry.examples.slice(0, 3);

  return (
    <section className="flex flex-1 flex-col items-center gap-6 sm:gap-8">
      <article
        className={cn(
          "flex w-full max-w-xl flex-col items-center gap-6 rounded-2xl border border-foreground/10 bg-foreground/[0.02] px-6 py-10 text-center sm:py-12",
          "animate-in fade-in-0 duration-150",
        )}
      >
        <div className="flex items-center gap-2 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          <span
            aria-hidden
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: directionColor }}
          />
          <span className="tabular-nums">{directionLabel}</span>
          <span aria-hidden className="text-foreground/20">
            ·
          </span>
          <span className="tabular-nums">rep {card.reps}</span>
        </div>

        <p className="font-serif text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          {front}
        </p>

        {revealed && (
          <div className="flex w-full flex-col items-center gap-5 animate-in fade-in-0 duration-150">
            <span
              aria-hidden
              className="inline-block h-px w-12 bg-foreground/15"
            />
            <p className="font-serif text-2xl italic text-zinc-700 dark:text-zinc-300 sm:text-3xl">
              {back}
            </p>

            {examples.length > 0 && (
              <ul className="flex w-full flex-col gap-4 text-left">
                {examples.map((ex, idx) => (
                  <li key={idx} className="flex flex-col gap-0.5">
                    <p className="font-serif text-base leading-snug text-foreground">
                      {ex.de}
                    </p>
                    <p className="font-serif text-base italic leading-snug text-zinc-500 dark:text-zinc-400">
                      {ex.sr}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {card.entry.notes && (
              <p className="max-w-prose px-2 font-serif text-sm italic leading-relaxed text-zinc-500">
                {card.entry.notes}
              </p>
            )}
          </div>
        )}
      </article>

      {!revealed ? (
        <Button
          onClick={() => setRevealed(true)}
          className="h-12 w-full max-w-xs px-8 sm:w-auto sm:h-11"
        >
          <EyeIcon weight="bold" />
          Show answer
          <kbd className="ml-2 hidden rounded border border-foreground/20 px-1.5 py-0.5 font-sans text-[10px] uppercase tracking-wider text-zinc-500 sm:inline">
            Space
          </kbd>
        </Button>
      ) : (
        <RatingGrid card={card} submitting={submitting} onRate={rate} />
      )}
    </section>
  );
}

function RatingGrid({
  card,
  submitting,
  onRate,
}: {
  card: CardPayload;
  submitting: boolean;
  onRate: (rating: Rating) => void;
}) {
  return (
    <div className="grid w-full max-w-xl grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
      {RATING_BUTTONS.map((b) => (
        <RatingButton
          key={b.rating}
          button={b}
          preview={previewLabel(card.previews, b.rating)}
          disabled={submitting}
          onClick={() => onRate(b.rating)}
        />
      ))}
    </div>
  );
}

function RatingButton({
  button,
  preview,
  disabled,
  onClick,
}: {
  button: RatingButton;
  preview: string;
  disabled: boolean;
  onClick: () => void;
}) {
  const { color, label } = button;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group/btn flex w-full cursor-pointer items-center justify-center gap-2 bg-transparent py-2 text-center font-sans",
        "disabled:cursor-not-allowed disabled:opacity-40",
      )}
    >
      <span
        aria-hidden
        className="inline-block size-2.5 shrink-0 rounded-full transition-transform duration-200 group-hover/btn:scale-125"
        style={{ backgroundColor: color }}
      />
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="font-sans text-[11px] uppercase tracking-wider tabular-nums text-zinc-500">
        {preview}
      </span>
    </button>
  );
}

function Done({ stats }: { stats: Stats }) {
  const isEmpty = stats.total === 0;
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-foreground/15 px-6 py-14 text-center animate-in fade-in-0 duration-150">
      <div
        className="flex size-10 items-center justify-center rounded-full"
        style={{ backgroundColor: "#7FBA001a", color: "#5C8500" }}
      >
        <CheckCircleIcon weight="fill" className="size-5" />
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

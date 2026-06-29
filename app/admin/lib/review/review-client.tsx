"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CloudSlashIcon,
  EyeIcon,
} from "@phosphor-icons/react";

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
import {
  applyReview,
  clearQueue,
  computeStats,
  enqueueReview,
  getDeck,
  getQueue,
  pickNextCard,
  previewsFor,
  putCard,
  replaceDeck,
  type DeckStats,
  type OfflineCard,
} from "@/lib/offline-deck";

import type { Rating } from "@/db/schema";
import type { VocabEntry } from "@/lib/lib-db";

type Props = {
  initialStats: DeckStats;
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

const SYNC_URL = "/api/lib/review/sync";

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

type SyncResponse = {
  ok?: boolean;
  deck?: OfflineCard[];
  stats?: DeckStats;
  error?: string;
};

export function ReviewClient({ initialStats }: Props) {
  // The deck lives in a ref so background sync can refresh it without forcing a
  // re-render or disturbing the card the user is currently looking at.
  const deckRef = useRef<OfflineCard[]>([]);
  const flushingRef = useRef(false);

  const [current, setCurrent] = useState<OfflineCard | null>(null);
  const [stats, setStats] = useState<DeckStats>(initialStats);
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [needsDownload, setNeedsDownload] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const offline = useSyncExternalStore(
    subscribeOnline,
    () => !navigator.onLine,
    () => false,
  );

  // Pick the next card off the local deck and refresh the counters.
  const advance = useCallback(() => {
    const now = new Date();
    setCurrent(pickNextCard(deckRef.current, now));
    setStats(computeStats(deckRef.current, now));
  }, []);

  // Send queued reviews to the server, then return the authoritative deck.
  const flushQueue = useCallback(async (): Promise<OfflineCard[] | null> => {
    if (flushingRef.current) return null;
    flushingRef.current = true;
    try {
      const queue = await getQueue();
      let res: Response;
      if (queue.length > 0) {
        res = await fetch(SYNC_URL, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            reviews: queue.map((q) => ({
              cardId: q.cardId,
              rating: q.rating,
              durationMs: q.durationMs,
              reviewedAt: q.reviewedAt,
            })),
          }),
        });
      } else {
        res = await fetch(SYNC_URL, { cache: "no-store" });
      }
      const data = (await res.json()) as SyncResponse;
      if (!res.ok || !data.ok || !data.deck) {
        throw new Error(data.error ?? `Sync failed (${res.status})`);
      }
      if (queue.length > 0) {
        await clearQueue(queue.map((q) => q.qid));
      }
      await replaceDeck(data.deck);
      deckRef.current = data.deck;
      return data.deck;
    } finally {
      flushingRef.current = false;
    }
  }, []);

  // First load: drive from the local deck immediately, then reconcile with the
  // server if we're online.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = await getDeck();
      if (cancelled) return;
      if (local.length > 0) {
        deckRef.current = local;
        advance();
        setStatus("ready");
      }

      if (typeof navigator !== "undefined" && navigator.onLine) {
        try {
          await flushQueue();
          if (!cancelled) advance();
        } catch {
          if (!cancelled && deckRef.current.length === 0) setNeedsDownload(true);
        }
      } else if (local.length === 0) {
        setNeedsDownload(true);
      }
      if (!cancelled) setStatus("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [advance, flushQueue]);

  // Flush whatever's queued the moment we're back online.
  useEffect(() => {
    if (offline) return;
    flushQueue().catch(() => {
      // Still effectively offline — reviews stay queued.
    });
  }, [offline, flushQueue]);

  const rate = useCallback(
    async (rating: Rating, durationMs: number) => {
      const card = current;
      if (!card || submitting) return;
      setSubmitting(true);
      setError(null);
      const now = new Date();
      const updated = applyReview(card, rating, now);
      deckRef.current = deckRef.current.map((c) =>
        c.id === updated.id ? updated : c,
      );
      try {
        await putCard(updated);
        await enqueueReview({
          cardId: card.id,
          rating,
          durationMs,
          reviewedAt: now.getTime(),
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Couldn't save review locally",
        );
      }
      advance();
      setSubmitting(false);
      // Best-effort push; failures keep the review queued for the next sync.
      if (typeof navigator === "undefined" || navigator.onLine) {
        flushQueue().catch(() => {});
      }
    },
    [current, submitting, advance, flushQueue],
  );

  const previews = useMemo(
    () => (current ? previewsFor(current, new Date()) : null),
    [current],
  );

  return (
    <main className="flex flex-1 flex-col gap-4 pt-3 pb-16 font-sans md:gap-8 md:pt-16">
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
            {offline && (
              <>
                <span aria-hidden className="text-foreground/20">
                  ·
                </span>
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-500">
                  <CloudSlashIcon weight="bold" className="size-3.5" />
                  Offline
                </span>
              </>
            )}
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

      {status === "loading" ? (
        <Loading />
      ) : needsDownload ? (
        <NeedsDownload />
      ) : !current || !previews ? (
        <Done stats={stats} />
      ) : (
        <CardView
          key={current.id}
          card={current}
          previews={previews}
          submitting={submitting}
          onRate={(rating, durationMs) => void rate(rating, durationMs)}
        />
      )}
    </main>
  );
}

function CardView({
  card,
  previews,
  submitting,
  onRate,
}: {
  card: OfflineCard;
  previews: Record<Rating, Date>;
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
  const directionFrom = showGerman ? "DE" : "SR";
  const directionTo = showGerman ? "SR" : "DE";
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
          <span className="inline-flex items-center gap-1 tabular-nums">
            <span className="font-bold text-foreground">{directionFrom}</span>
            <ArrowRightIcon
              weight="bold"
              aria-hidden
              className="size-3 text-zinc-400"
            />
            <span className="font-bold text-foreground">{directionTo}</span>
          </span>
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
                    <p className="font-serif text-base leading-snug text-zinc-500 dark:text-zinc-400">
                      {ex.sr}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {card.entry.notes && (
              <p className="max-w-prose px-2 font-serif text-sm leading-relaxed text-zinc-500">
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
        <RatingGrid previews={previews} submitting={submitting} onRate={rate} />
      )}
    </section>
  );
}

function RatingGrid({
  previews,
  submitting,
  onRate,
}: {
  previews: Record<Rating, Date>;
  submitting: boolean;
  onRate: (rating: Rating) => void;
}) {
  return (
    <div className="grid w-full max-w-xl grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
      {RATING_BUTTONS.map((b) => (
        <RatingButton
          key={b.rating}
          button={b}
          preview={formatInterval(previews[b.rating])}
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
  const { color, label, key } = button;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group/btn flex w-full cursor-pointer items-center justify-center gap-2 bg-transparent py-2 font-sans",
        "disabled:cursor-not-allowed disabled:opacity-40",
      )}
    >
      <span
        aria-hidden
        className="inline-block size-2.5 shrink-0 rounded-full transition-transform duration-200 group-hover/btn:scale-125"
        style={{ backgroundColor: color }}
      />
      <span className="min-w-[3rem] text-left text-sm font-medium text-foreground">
        {label}
      </span>
      <kbd className="hidden font-sans text-[10px] uppercase tracking-wider tabular-nums text-zinc-400 sm:inline">
        {key}
      </kbd>
      <span className="min-w-[2.5rem] text-right font-sans text-[11px] uppercase tracking-wider tabular-nums text-zinc-500">
        {preview}
      </span>
    </button>
  );
}

function Loading() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-foreground/15 px-6 py-14 text-center">
      <p className="font-serif text-sm text-zinc-500">Loading deck…</p>
    </div>
  );
}

function NeedsDownload() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-foreground/15 px-6 py-14 text-center">
      <div
        className="flex size-10 items-center justify-center rounded-full"
        style={{ backgroundColor: "#FFB9001a", color: "#9A6B00" }}
      >
        <CloudSlashIcon weight="fill" className="size-5" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-serif text-base font-semibold text-foreground">
          Deck not downloaded
        </p>
        <p className="max-w-prose font-serif text-sm text-zinc-500">
          Connect to the internet once to download your cards. After that,
          reviews work offline and sync back when you reconnect.
        </p>
      </div>
    </div>
  );
}

function Done({ stats }: { stats: DeckStats }) {
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
        <p className="font-serif text-sm text-zinc-500">
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

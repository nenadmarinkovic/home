"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  ArrowRightIcon,
  DotsThreeVerticalIcon,
  PauseIcon,
  PencilSimpleIcon,
  PlayIcon,
  TrashIcon,
} from "@phosphor-icons/react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { TagChip } from "@/components/tag-chip";
import { cn } from "@/lib/utils";

import type { SrsCardRow } from "@/db/schema";
import type { VocabularyEntry } from "@/lib/vocabulary-db";

import { EntryEditor } from "../entry-editor";
import { SpeakButton } from "../speak-button";
import { entryToDraft, type DraftEntry } from "../types";
import { EntryChat } from "./entry-chat";

type Props = {
  entry: VocabularyEntry;
  cards: SrsCardRow[];
};

const CARD_STATE_LABEL: Record<number, string> = {
  0: "New",
  1: "Learning",
  2: "Review",
  3: "Relearning",
};

const DIRECTION_LABEL: Record<string, { from: string; to: string }> = {
  de_sr: { from: "DE", to: "SR" },
  sr_de: { from: "SR", to: "DE" },
};

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(d: Date): string {
  return new Date(d).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function relativeFromNow(d: Date, now: Date): string {
  const diffMs = new Date(d).getTime() - now.getTime();
  const diffMin = Math.round(diffMs / 60_000);
  const abs = Math.abs(diffMin);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (abs < 60) return rtf.format(diffMin, "minute");
  const diffHr = Math.round(diffMin / 60);
  if (Math.abs(diffHr) < 48) return rtf.format(diffHr, "hour");
  const diffDay = Math.round(diffHr / 24);
  if (Math.abs(diffDay) < 30) return rtf.format(diffDay, "day");
  const diffMon = Math.round(diffDay / 30);
  if (Math.abs(diffMon) < 12) return rtf.format(diffMon, "month");
  const diffYr = Math.round(diffDay / 365);
  return rtf.format(diffYr, "year");
}

const SECTION_ORDER = [
  "praesens",
  "perfekt",
  "partizip2",
  "genitiv_sg",
  "nominativ_pl",
  "praeteritum",
];

const SECTION_LABEL: Record<string, string> = {
  praesens: "Präsens",
  praeteritum: "Präteritum",
  perfekt: "Perfekt",
  partizip2: "Partizip II",
  genitiv_sg: "Genitiv Sg.",
  nominativ_pl: "Nominativ Pl.",
};

const PERSON_ORDER = ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"];

type ConjRow = { label: string; value: string };
type ConjSection = {
  heading: string;
  rows: ConjRow[];
  split: boolean;
  wide: boolean;
  order: number;
};

function rank(order: string[], key: string): number {
  const i = order.indexOf(key);
  return i === -1 ? order.length : i;
}

function labelFor(key: string): string {
  return SECTION_LABEL[key] ?? key;
}

function formatConjugations(conj: Record<string, unknown>): ConjSection[] {
  const sections: ConjSection[] = [];
  const forms: ConjRow[] = [];
  let formsOrder = SECTION_ORDER.length;
  const keys = Object.keys(conj).sort(
    (a, b) => rank(SECTION_ORDER, a) - rank(SECTION_ORDER, b),
  );

  for (const key of keys) {
    const value = conj[key];
    if (value === null || value === undefined || value === "") continue;

    if (Array.isArray(value)) {
      const rows = value
        .filter((v) => v !== null && v !== undefined && v !== "")
        .map((v, i) => ({ label: String(i + 1), value: String(v) }));
      if (rows.length) {
        sections.push({
          heading: labelFor(key),
          rows,
          split: rows.length >= 4,
          wide: false,
          order: rank(SECTION_ORDER, key),
        });
      }
      continue;
    }

    if (typeof value === "object") {
      const rows = Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => v !== null && v !== undefined && v !== "")
        .sort(([a], [b]) => rank(PERSON_ORDER, a) - rank(PERSON_ORDER, b))
        .map(([k, v]) => ({ label: k, value: String(v) }));
      if (rows.length) {
        sections.push({
          heading: labelFor(key),
          rows,
          split: rows.length >= 4,
          wide: false,
          order: rank(SECTION_ORDER, key),
        });
      }
      continue;
    }

    formsOrder = Math.min(formsOrder, rank(SECTION_ORDER, key));
    forms.push({ label: labelFor(key), value: String(value) });
  }

  if (forms.length) {
    sections.push({
      heading: "Forms",
      rows: forms,
      split: false,
      wide: true,
      order: formsOrder,
    });
  }
  return sections.sort((a, b) => a.order - b.order);
}

function ConjugationTable({ section }: { section: ConjSection }) {
  const half = section.split
    ? Math.ceil(section.rows.length / 2)
    : section.rows.length;
  const left = section.rows.slice(0, half);
  const right = section.split ? section.rows.slice(half) : [];
  const labelWidth = section.wide ? "w-32" : "w-24";

  return (
    <Table>
      <TableBody>
        {left.map((row, i) => (
          <TableRow key={row.label}>
            <TableHead scope="row" className={cn("h-auto py-2 pl-0", labelWidth)}>
              {row.label}
            </TableHead>
            <TableCell className="py-2 text-foreground sm:text-base">
              {row.value}
            </TableCell>
            {section.split ? (
              <>
                <TableHead
                  scope="row"
                  className={cn("h-auto py-2", labelWidth)}
                >
                  {right[i]?.label ?? ""}
                </TableHead>
                <TableCell className="py-2 pr-0 text-foreground sm:text-base">
                  {right[i]?.value ?? ""}
                </TableCell>
              </>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function EntryDetailClient({ entry, cards: initialCards }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [cards, setCards] = useState<SrsCardRow[]>(initialCards);
  const [togglingCardId, setTogglingCardId] = useState<number | null>(null);
  const [draft, setDraft] = useState<DraftEntry | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [enriching, setEnriching] = useState(false);
  const [generatingExamples, setGeneratingExamples] = useState(false);
  const [saving, setSaving] = useState(false);

  const [pendingDelete, setPendingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const now = useMemo(() => new Date(), []);
  const tags = useMemo(
    () =>
      entry.tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    [entry.tags],
  );
  const conjugationSections = useMemo(
    () => formatConjugations(entry.conjugations ?? {}),
    [entry.conjugations],
  );

  function openEdit() {
    setDraft(entryToDraft(entry));
    setEditorError(null);
  }

  async function enrichDraft() {
    if (!draft) return;
    const term = draft.term.trim();
    if (!term) return;
    setEnriching(true);
    setEditorError(null);
    try {
      const res = await fetch("/api/vocabulary/enrich", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ term }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        entry?: DraftEntry & { conjugations?: Record<string, unknown> };
        error?: string;
      };
      if (!res.ok || !data.ok || !data.entry) {
        setEditorError(data.error ?? `Enrich failed (${res.status})`);
        return;
      }
      setDraft({
        ...draft,
        term: data.entry.term,
        pos: data.entry.pos,
        gender: data.entry.gender ?? null,
        plural: data.entry.plural ?? null,
        aux: data.entry.aux ?? null,
        separable: data.entry.separable ?? null,
        level: data.entry.level ?? null,
        translationSr: data.entry.translationSr,
        examples: data.entry.examples ?? [],
        conjugations: data.entry.conjugations ?? {},
        notes: data.entry.notes ?? draft.notes,
        source: "mistral",
      });
    } catch (err) {
      setEditorError(err instanceof Error ? err.message : "Enrich failed");
    } finally {
      setEnriching(false);
    }
  }

  async function generateMoreExamples() {
    if (!draft) return;
    const term = draft.term.trim();
    if (!term) return;
    setGeneratingExamples(true);
    setEditorError(null);
    try {
      const res = await fetch("/api/vocabulary/examples", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ term }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        examples?: { de: string; sr: string }[];
        error?: string;
      };
      if (!res.ok || !data.ok || !data.examples) {
        setEditorError(data.error ?? `Examples failed (${res.status})`);
        return;
      }
      setDraft({
        ...draft,
        examples: [...draft.examples, ...data.examples],
      });
    } catch (err) {
      setEditorError(
        err instanceof Error ? err.message : "Couldn't generate examples",
      );
    } finally {
      setGeneratingExamples(false);
    }
  }

  async function saveDraft() {
    if (!draft) return;
    setSaving(true);
    setEditorError(null);
    try {
      const res = await fetch("/api/vocabulary/entries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setEditorError(data.error ?? `Save failed (${res.status})`);
        return;
      }
      setDraft(null);
      startTransition(() => router.refresh());
    } catch (err) {
      setEditorError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggleSuspend(cardId: number, next: boolean) {
    setTogglingCardId(cardId);
    try {
      const res = await fetch(`/api/vocabulary/cards/${cardId}/suspend`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ suspended: next }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        window.alert(data.error ?? `Update failed (${res.status})`);
        return;
      }
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, suspended: next } : c)),
      );
    } finally {
      setTogglingCardId(null);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/vocabulary/entries/${entry.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        window.alert(data.error ?? `Delete failed (${res.status})`);
        return;
      }
      router.push("/admin/vocabulary");
    } finally {
      setDeleting(false);
    }
  }

  const article =
    entry.pos === "noun" && entry.gender ? `${entry.gender} ` : "";

  return (
    <main className="flex flex-1 flex-col gap-4 pt-8 pb-16 font-sans md:gap-8 md:pt-16">
      <div className="flex items-center justify-between gap-2">
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
                <Link href="/admin/vocabulary">Vocabulary</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-56 truncate sm:max-w-wd">
                {entry.term}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Actions for ${entry.term}`}
              className="-my-2 text-zinc-600 dark:text-zinc-400"
            >
              <DotsThreeVerticalIcon weight="bold" className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={openEdit}>
              <PencilSimpleIcon weight="bold" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setPendingDelete(true)}
            >
              <TrashIcon weight="bold" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <header className="flex min-w-0 flex-col gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <h1 className="text-2xl font-normal text-balance text-foreground sm:text-4xl">
            <span className="text-foreground/40">{article}</span>
            {entry.term}
          </h1>
          <SpeakButton
            text={`${article}${entry.term}`}
            label="Listen to the German"
            size="icon"
            className="mt-0.5 shrink-0 sm:mt-1.5"
          />
        </div>
        <p className="text-sm italic leading-[1.55] text-balance text-foreground/70 sm:text-base">
          {entry.translationSr || "—"}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Pill>{entry.pos}</Pill>
            {entry.plural ? <Pill>plural: {entry.plural}</Pill> : null}
            {entry.aux ? <Pill>aux: {entry.aux}</Pill> : null}
            {entry.separable ? <Pill>separable</Pill> : null}
          </div>
          <EntryChat slug={entry.slug} term={entry.term} />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-10">
          <Section title="Examples">
            {entry.examples.length === 0 ? (
              <EmptyHint>No examples yet — add some via Edit.</EmptyHint>
            ) : (
              <ol className="flex flex-col divide-y divide-foreground/5">
                {entry.examples.map((ex, idx) => (
                  <li
                    key={idx}
                    className="flex items-start justify-between gap-2 py-3 first:pt-0 last:pb-0 sm:py-4"
                  >
                    <div className="flex min-w-0 flex-col gap-1 sm:gap-1.5">
                      <p className="text-base font-medium leading-snug text-foreground">
                        {ex.de || "—"}
                      </p>
                      <p className="text-sm leading-snug text-zinc-500 dark:text-zinc-500 sm:text-base">
                        {ex.sr || "—"}
                      </p>
                    </div>
                    <SpeakButton
                      text={ex.de}
                      label="Listen to the German"
                      className="-mt-0.5 shrink-0"
                    />
                  </li>
                ))}
              </ol>
            )}
          </Section>

          {entry.notes.trim().length > 0 && (
            <Section title="Notes">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 sm:text-base">
                {entry.notes}
              </p>
            </Section>
          )}

          {conjugationSections.map((section) => (
            <Section key={section.heading} title={section.heading}>
              <ConjugationTable section={section} />
            </Section>
          ))}
        </div>

        <aside className="flex flex-col gap-8">
          {tags.length > 0 && (
            <Section title="Tags" compact>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <TagChip key={tag} active>
                    {tag}
                  </TagChip>
                ))}
              </div>
            </Section>
          )}

          <Section title="SRS cards" compact>
            <ul className="flex flex-col divide-y divide-foreground/5">
              {cards.map((card) => {
                const dir = DIRECTION_LABEL[card.direction] ?? {
                  from: card.direction,
                  to: "",
                };
                const overdue =
                  !card.suspended &&
                  new Date(card.due).getTime() <= now.getTime();
                const stateLabel = card.suspended
                  ? "Suspended"
                  : (CARD_STATE_LABEL[card.state] ?? `state ${card.state}`);
                return (
                  <li
                    key={card.id}
                    className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 font-sans text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        <span className="font-semibold text-foreground">
                          {dir.from}
                        </span>
                        <ArrowRightIcon
                          weight="bold"
                          aria-hidden
                          className="size-3 text-zinc-400"
                        />
                        <span className="font-semibold text-foreground">
                          {dir.to}
                        </span>
                      </span>
                      <div className="flex items-center gap-1">
                        <span
                          className={
                            card.suspended
                              ? "inline-flex items-center rounded-full bg-foreground/6 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-500"
                              : overdue
                                ? "inline-flex items-center gap-1 rounded-full bg-[#0040ff]/10 px-2 py-0.5 text-[11px] font-medium text-[#0040ff] dark:bg-[#ffff01]/10 dark:text-[#ffff01]"
                                : "inline-flex items-center rounded-full bg-foreground/6 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300"
                          }
                        >
                          {stateLabel}
                        </span>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={
                                  card.suspended
                                    ? "Resume card"
                                    : "Suspend card"
                                }
                                disabled={togglingCardId === card.id}
                                onClick={() =>
                                  toggleSuspend(card.id, !card.suspended)
                                }
                                className="text-zinc-500 hover:text-foreground"
                              >
                                {card.suspended ? (
                                  <PlayIcon
                                    weight="bold"
                                    className="size-3.5"
                                  />
                                ) : (
                                  <PauseIcon
                                    weight="bold"
                                    className="size-3.5"
                                  />
                                )}
                              </Button>
                            }
                          />
                          <TooltipContent>
                            {card.suspended
                              ? "Resume — card returns to review queue"
                              : "Suspend — card skipped in review"}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <p className="font-sans text-xs text-zinc-500 dark:text-zinc-500">
                      <span title={formatDateTime(card.due)}>
                        Due {relativeFromNow(card.due, now)}
                      </span>
                      <span aria-hidden className="px-1.5 text-foreground/20">
                        ·
                      </span>
                      <span>
                        {card.reps} {card.reps === 1 ? "rep" : "reps"}
                      </span>
                      {card.lapses > 0 && (
                        <>
                          <span
                            aria-hidden
                            className="px-1.5 text-foreground/20"
                          >
                            ·
                          </span>
                          <span>{card.lapses} lapses</span>
                        </>
                      )}
                    </p>
                    {card.lastReview && (
                      <p className="font-sans text-xs text-zinc-500 dark:text-zinc-500">
                        <span title={formatDateTime(card.lastReview)}>
                          Last reviewed {relativeFromNow(card.lastReview, now)}
                        </span>
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </Section>

          <Section title="Saved" compact>
            <p className="font-sans text-xs text-zinc-500 dark:text-zinc-500">
              <span title={formatDateTime(entry.createdAt)}>
                {formatDate(entry.createdAt)}
              </span>
              {entry.updatedAt.getTime() !== entry.createdAt.getTime() && (
                <>
                  <span aria-hidden className="px-1.5 text-foreground/20">
                    ·
                  </span>
                  <span title={formatDateTime(entry.updatedAt)}>
                    updated {relativeFromNow(entry.updatedAt, now)}
                  </span>
                </>
              )}
            </p>
          </Section>
        </aside>
      </div>

      <EntryEditor
        open={draft !== null}
        draft={draft}
        allTags={tags}
        onChange={setDraft}
        onClose={() => setDraft(null)}
        onSave={saveDraft}
        onEnrich={enrichDraft}
        onGenerateExamples={generateMoreExamples}
        enriching={enriching}
        generatingExamples={generatingExamples}
        saving={saving}
        error={editorError}
      />

      <AlertDialog
        open={pendingDelete}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <code className="font-sans text-xs">{entry.term}</code> along with
              both SRS cards and their review history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-foreground/6 px-2 py-0.5 font-sans text-[11px] font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
      {children}
    </span>
  );
}

function Section({
  title,
  children,
  compact = false,
}: {
  title: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section
      className={compact ? "flex flex-col gap-2" : "flex flex-col gap-4"}
    >
      <h2 className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-foreground/15 px-4 py-6 text-center font-sans text-sm text-zinc-500 dark:text-zinc-500">
      {children}
    </p>
  );
}

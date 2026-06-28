"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

const DUE_TOOLTIP =
  "Each word becomes two flashcards — German→Serbian and Serbian→German. This counts how many of those are scheduled for review.";
import {
  ArrowRight,
  ArrowsDownUpIcon,
  BookOpen,
  CheckIcon,
  DotsThreeVertical,
  FunnelSimpleIcon,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  Trash,
  X as XIcon,
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
import { Input } from "@/components/ui/input";
import { TagChip } from "@/components/tag-chip";

import { EntryEditor } from "./entry-editor";
import { QuickAdd } from "./quick-add";
import {
  emptyDraft,
  entryToDraft,
  type ClientEntry,
  type DraftEntry,
} from "./types";

type Stats = {
  due: number;
  newCards: number;
  total: number;
};

type Props = {
  initialEntries: ClientEntry[];
  initialStats: Stats;
};

type SortKey = "newest" | "oldest" | "title-asc" | "title-desc" | "most-due";
type FilterKey = "all" | "nouns" | "verbs" | "phrases" | "sentences";

const SORT_LABELS: Record<SortKey, string> = {
  newest: "Newest",
  oldest: "Oldest",
  "title-asc": "Title A–Z",
  "title-desc": "Title Z–A",
  "most-due": "Most due",
};

const FILTER_LABELS: Record<FilterKey, string> = {
  all: "All",
  nouns: "Nouns",
  verbs: "Verbs",
  phrases: "Phrases",
  sentences: "Sentences",
};

function matchesFilter(pos: string, filter: FilterKey): boolean {
  if (filter === "all") return true;
  if (filter === "nouns") return pos === "noun";
  if (filter === "verbs") return pos === "verb";
  if (filter === "phrases") return pos === "phrase";
  if (filter === "sentences") return pos === "sentence";
  return true;
}

export function LibClient({ initialEntries, initialStats }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const entries = initialEntries;
  const stats = initialStats;
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const [draft, setDraft] = useState<DraftEntry | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [enriching, setEnriching] = useState(false);
  const [generatingExamples, setGeneratingExamples] = useState(false);
  const [saving, setSaving] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<ClientEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const out = entries.filter((e) => {
      if (q) {
        const matches =
          e.term.toLowerCase().includes(q) ||
          e.translationSr.toLowerCase().includes(q) ||
          e.tags.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (!matchesFilter(e.pos, filter)) return false;
      if (activeTags.length > 0) {
        const slugs = new Set(
          e.tags
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean),
        );
        for (const t of activeTags) if (!slugs.has(t)) return false;
      }
      return true;
    });

    const sorted = [...out];
    switch (sort) {
      case "newest":
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case "oldest":
        sorted.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        break;
      case "title-asc":
        sorted.sort((a, b) => a.term.localeCompare(b.term));
        break;
      case "title-desc":
        sorted.sort((a, b) => b.term.localeCompare(a.term));
        break;
      case "most-due":
        sorted.sort((a, b) => b.due - a.due);
        break;
    }
    return sorted;
  }, [entries, search, filter, sort, activeTags]);

  function toggleFilterTag(tag: string) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }
  const isFiltering = search.trim().length > 0 || activeTags.length > 0;

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) {
      for (const t of e.tags.split(",")) {
        const cleaned = t.trim().toLowerCase();
        if (cleaned) set.add(cleaned);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [entries]);

  function refresh() {
    startTransition(() => router.refresh());
  }

  function openNew() {
    setDraft(emptyDraft());
    setEditorError(null);
  }

  function openEdit(entry: ClientEntry) {
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
      const res = await fetch("/api/lib/enrich", {
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
      const res = await fetch("/api/lib/examples", {
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
      const res = await fetch("/api/lib/entries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setEditorError(data.error ?? `Save failed (${res.status})`);
        return;
      }
      setDraft(null);
      refresh();
    } catch (err) {
      setEditorError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/lib/entries/${pendingDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        window.alert(data.error ?? `Delete failed (${res.status})`);
        return;
      }
      setPendingDelete(null);
      refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-4 pt-8 pb-28 font-sans md:gap-8 md:pt-16 md:pb-16">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin">Admin</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Lib</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-serif text-3xl font-semibold leading-none tracking-tight text-foreground">
            Lib
          </h1>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
            <span>
              <span className="tabular-nums">{entries.length}</span> entries
            </span>
            <span aria-hidden className="text-foreground/20">
              ·
            </span>
            <span title={DUE_TOOLTIP}>
              <span className="tabular-nums">{stats.total}</span> cards
            </span>
            <span aria-hidden className="text-foreground/20">
              ·
            </span>
            {stats.due > 0 ? (
              <Link
                href="/admin/lib/review"
                title={DUE_TOOLTIP}
                className="text-[#5C8500] transition-opacity hover:underline hover:opacity-80 dark:text-[#7FBA00]"
              >
                <span className="tabular-nums">{stats.due}</span> to review
              </Link>
            ) : (
              <span title={DUE_TOOLTIP}>
                <span className="tabular-nums">{stats.due}</span> to review
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="h-9">
            <Link href="/admin/lib/review" className="group">
              <BookOpen weight="bold" />
              Review
              <ArrowRight
                weight="bold"
                className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </Button>
        </div>
      </header>

      <QuickAdd className="hidden md:flex" />

      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <SearchField search={search} onSearchChange={setSearch} />
          <FilterMenu filter={filter} onFilterChange={setFilter} />
          <SortMenu sort={sort} onSortChange={setSort} />
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {allTags.map((tag) => (
              <TagChip
                key={tag}
                active={activeTags.includes(tag)}
                onClick={() => toggleFilterTag(tag)}
              >
                {tag}
              </TagChip>
            ))}
            {activeTags.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setActiveTags([])}
                className="font-sans text-[11px] uppercase tracking-wider text-zinc-500"
              >
                <XIcon weight="bold" />
                Clear tags
              </Button>
            )}
          </div>
        )}

        {filtered.length === 0 ? (
          <Empty
            isSearching={isFiltering}
            onClear={() => {
              setSearch("");
              setActiveTags([]);
            }}
            onNew={openNew}
          />
        ) : (
          <ul className="flex flex-col divide-y divide-foreground/5">
            {filtered.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                onEdit={() => openEdit(entry)}
                onDelete={() => setPendingDelete(entry)}
              />
            ))}
          </ul>
        )}
      </section>

      <EntryEditor
        open={draft !== null}
        draft={draft}
        allTags={allTags}
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
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete ? (
                <>
                  This will permanently remove{" "}
                  <code className="font-sans text-xs">
                    {pendingDelete.term}
                  </code>{" "}
                  along with both SRS cards and their review history.
                </>
              ) : null}
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

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-background via-background/90 to-transparent px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-6 md:hidden">
        <div className="pointer-events-auto mx-auto max-w-2xl">
          <QuickAdd />
        </div>
      </div>
    </main>
  );
}

function EntryRow({
  entry,
  onEdit,
  onDelete,
}: {
  entry: ClientEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const article =
    entry.pos === "noun" && entry.gender ? `${entry.gender} ` : "";
  return (
    <li className="group/row flex items-center gap-4 py-3.5">
      <Link
        href={`/admin/lib/${entry.slug}`}
        className="-mx-2 -my-1 min-w-0 flex-1 rounded-md px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
      >
        <div className="flex items-center gap-2">
          <p className="truncate font-sans text-base font-semibold leading-tight text-foreground transition-opacity group-hover/row:opacity-70">
            <span className="font-normal text-zinc-400 dark:text-zinc-500">
              {article}
            </span>
            {entry.term}
          </p>
          <PosTag pos={entry.pos} />
          {entry.due > 0 && (
            <span
              aria-hidden
              title={`${entry.due} flashcard${entry.due === 1 ? "" : "s"} to review`}
              className="size-1.5 shrink-0 rounded-full bg-[#7FBA00]"
            />
          )}
        </div>
        <p className="mt-0.5 truncate font-sans text-sm text-zinc-500 dark:text-zinc-400">
          {entry.translationSr || "—"}
        </p>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Actions for ${entry.term}`}
            className="text-zinc-600 dark:text-zinc-400"
          >
            <DotsThreeVertical weight="bold" className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <PencilSimple weight="bold" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <Trash weight="bold" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

function PosTag({ pos }: { pos: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-foreground/[0.06] px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
      {pos}
    </span>
  );
}

function SearchField({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="relative flex-1">
      <MagnifyingGlass
        weight="regular"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
      />
      <Input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search term, translation, tag…"
        aria-label="Search entries"
        className="h-9 pl-9 pr-9 text-sm"
      />
      {search && (
        <button
          type="button"
          onClick={() => onSearchChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-zinc-500 transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <XIcon weight="bold" className="size-3" />
        </button>
      )}
    </div>
  );
}

function Empty({
  isSearching,
  onClear,
  onNew,
}: {
  isSearching: boolean;
  onClear: () => void;
  onNew: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-foreground/15 px-6 py-14 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-[#F25022]/10 text-[#F25022]">
        <BookOpen weight="regular" className="size-5" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-serif text-base font-semibold text-foreground">
          {isSearching ? "No matches" : "Nothing here yet"}
        </p>
        <p className="font-serif text-sm text-zinc-500 dark:text-zinc-500">
          {isSearching
            ? "Nothing here fits your search."
            : "Add a German term — Mistral fills in the rest."}
        </p>
      </div>
      {isSearching ? (
        <Button variant="outline" onClick={onClear} className="mt-2">
          Clear search
        </Button>
      ) : (
        <Button onClick={onNew} className="mt-2">
          <Plus weight="bold" />
          New entry
        </Button>
      )}
    </div>
  );
}

function FilterMenu({
  filter,
  onFilterChange,
}: {
  filter: FilterKey;
  onFilterChange: (filter: FilterKey) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={`Show: ${FILTER_LABELS[filter]}`}
          className="h-9 shrink-0 gap-1.5"
        >
          <FunnelSimpleIcon weight="bold" />
          <span className="hidden sm:inline">{FILTER_LABELS[filter]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {(Object.keys(FILTER_LABELS) as FilterKey[]).map((key) => (
          <DropdownMenuItem
            key={key}
            onClick={() => onFilterChange(key)}
            className="justify-between"
          >
            <span>{FILTER_LABELS[key]}</span>
            {filter === key && (
              <CheckIcon weight="bold" className="size-3.5 text-[#F25022]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SortMenu({
  sort,
  onSortChange,
}: {
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={`Sort: ${SORT_LABELS[sort]}`}
          className="h-9 shrink-0 gap-1.5"
        >
          <ArrowsDownUpIcon weight="bold" />
          <span className="hidden sm:inline">{SORT_LABELS[sort]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
          <DropdownMenuItem
            key={key}
            onClick={() => onSortChange(key)}
            className="justify-between"
          >
            <span>{SORT_LABELS[key]}</span>
            {sort === key && (
              <CheckIcon weight="bold" className="size-3.5 text-[#F25022]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

const CARDS_PER_ENTRY = 2;
const DUE_TOOLTIP =
  "Each word becomes two flashcards — German→Serbian and Serbian→German. This counts how many of those are scheduled for review.";
import {
  ArrowRight,
  BookOpen,
  DotsThreeVertical,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  Sparkle,
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

import { LogoutButton } from "../writing/logout-button";
import { BulkAddDialog } from "./bulk-add";
import { EntryEditor } from "./entry-editor";
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

export function LibClient({ initialEntries, initialStats }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const entries = initialEntries;
  const stats = initialStats;
  const [search, setSearch] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);

  const [draft, setDraft] = useState<DraftEntry | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [enriching, setEnriching] = useState(false);
  const [saving, setSaving] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<ClientEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.term.toLowerCase().includes(q) ||
        e.translationSr.toLowerCase().includes(q) ||
        e.tags.toLowerCase().includes(q),
    );
  }, [entries, search]);

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
            <span aria-hidden className="text-foreground/20">·</span>
            <span title={DUE_TOOLTIP}>
              <span className="tabular-nums">{stats.total}</span> cards
            </span>
            <span aria-hidden className="text-foreground/20">·</span>
            <span
              title={DUE_TOOLTIP}
              className={stats.due > 0 ? "text-blue-600 dark:text-blue-500" : ""}
            >
              <span className="tabular-nums">{stats.due}</span> to review
            </span>
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
          <LogoutButton />
        </div>
      </header>

      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <SearchField search={search} onSearchChange={setSearch} />
          <Button
            variant="outline"
            onClick={() => setBulkOpen(true)}
            className="h-9 shrink-0"
          >
            <Sparkle weight="bold" />
            <span className="hidden sm:inline">Bulk add</span>
          </Button>
          <Button onClick={openNew} className="h-9 shrink-0">
            <Plus weight="bold" />
            <span className="hidden sm:inline">New</span>
          </Button>
        </div>

        {filtered.length === 0 ? (
          <Empty
            isSearching={search.trim().length > 0}
            onClear={() => setSearch("")}
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
        onChange={setDraft}
        onClose={() => setDraft(null)}
        onSave={saveDraft}
        onEnrich={enrichDraft}
        enriching={enriching}
        saving={saving}
        error={editorError}
      />

      <BulkAddDialog
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onCompleted={refresh}
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
                  <code className="font-sans text-xs">{pendingDelete.term}</code>{" "}
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
    entry.pos === "noun" && entry.gender
      ? `${entry.gender} `
      : "";
  return (
    <li className="group/row flex items-center gap-4 py-3.5">
      <button
        type="button"
        onClick={onEdit}
        className="-mx-2 -my-1 min-w-0 flex-1 cursor-pointer rounded-md px-2 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
      >
        <div className="flex items-center gap-2">
          <p className="truncate font-serif text-base font-semibold leading-tight text-foreground transition-opacity group-hover/row:opacity-70">
            <span className="text-zinc-500 dark:text-zinc-500">{article}</span>
            {entry.term}
          </p>
          <PosTag pos={entry.pos} />
          {entry.level && <LevelTag level={entry.level} />}
          {entry.due > 0 && (
            <span
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-500"
              title={`${entry.due} of ${CARDS_PER_ENTRY} flashcards to review (German→Serbian and Serbian→German).`}
            >
              <span
                aria-hidden
                className="inline-block size-1.5 rounded-full bg-blue-600 dark:bg-blue-500"
              />
              {entry.due}/{CARDS_PER_ENTRY} cards
            </span>
          )}
        </div>
        <p className="mt-1 truncate font-serif text-sm italic text-zinc-600 dark:text-zinc-400">
          {entry.translationSr || "—"}
        </p>
      </button>
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
    <span className="inline-flex shrink-0 items-center rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
      {pos}
    </span>
  );
}

function LevelTag({ level }: { level: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-[#fd6401]/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-[#fd6401]">
      {level}
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
      <div className="flex size-10 items-center justify-center rounded-full bg-[#fd6401]/10 text-[#fd6401]">
        <BookOpen weight="regular" className="size-5" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-serif text-base font-semibold text-foreground">
          {isSearching ? "No matches" : "Nothing here yet"}
        </p>
        <p className="font-serif text-sm italic text-zinc-500 dark:text-zinc-500">
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

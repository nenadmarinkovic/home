"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  ArticleIcon,
  ArrowSquareOutIcon,
  ArrowsDownUpIcon,
  CheckIcon,
  CheckCircleIcon,
  DotsThreeVerticalIcon,
  FileTextIcon,
  FunnelSimpleIcon,
  GitCommitIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";

import Link from "next/link";

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

import { ArticleEditor, type EditorInitial } from "./article-editor";
import { ExportButton } from "./export-button";
import type { Article } from "../../writing/articles";

type AdminClientProps = {
  published: Article[];
  drafts: Article[];
  exported: string[];
};

function exportedKey(a: Pick<Article, "slug" | "language">): string {
  return `${a.language}:${a.slug}`;
}

type SortKey = "newest" | "oldest" | "title-asc" | "title-desc";
type FilterKey = "all" | "published" | "drafts";

const SORT_LABELS: Record<SortKey, string> = {
  newest: "Newest",
  oldest: "Oldest",
  "title-asc": "Title A–Z",
  "title-desc": "Title Z–A",
};

const FILTER_LABELS: Record<FilterKey, string> = {
  all: "All",
  published: "Published",
  drafts: "Drafts",
};

function applyControls(
  list: Article[],
  search: string,
  sort: SortKey,
): Article[] {
  const q = search.trim().toLowerCase();
  const filtered = q
    ? list.filter((a) => a.title.toLowerCase().includes(q))
    : list;
  const sorted = [...filtered];
  switch (sort) {
    case "newest":
      sorted.sort((a, b) => (a.date < b.date ? 1 : -1));
      break;
    case "oldest":
      sorted.sort((a, b) => (a.date < b.date ? -1 : 1));
      break;
    case "title-asc":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "title-desc":
      sorted.sort((a, b) => b.title.localeCompare(a.title));
      break;
  }
  return sorted;
}

export function AdminClient({ published, drafts, exported }: AdminClientProps) {
  const exportedSet = useMemo(() => new Set(exported), [exported]);
  const pendingExportCount = published.filter(
    (a) => !exportedSet.has(exportedKey(a)),
  ).length;
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editor, setEditor] = useState<{
    open: boolean;
    initial: EditorInitial | null;
    sessionId: number;
  }>({ open: false, initial: null, sessionId: 0 });
  const [pendingDelete, setPendingDelete] = useState<Article | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exportingKey, setExportingKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [filter, setFilter] = useState<FilterKey>("all");

  const list = useMemo(() => {
    const base =
      filter === "published"
        ? published
        : filter === "drafts"
          ? drafts
          : [...published, ...drafts];
    return applyControls(base, search, sort);
  }, [filter, published, drafts, search, sort]);
  const isFiltering = search.trim().length > 0;

  function openNew() {
    setEditor((prev) => ({
      open: true,
      initial: null,
      sessionId: prev.sessionId + 1,
    }));
  }

  function openEdit(article: Article) {
    setEditor((prev) => ({
      open: true,
      initial: {
        slug: article.slug,
        title: article.title,
        subtitle: article.subtitle,
        description: article.description,
        image: article.image,
        date: article.date,
        body: article.body,
        draft: article.draft,
      },
      sessionId: prev.sessionId + 1,
    }));
  }

  function closeEditor() {
    setEditor((prev) => ({ ...prev, open: false }));
  }

  async function exportArticle(article: Article) {
    if (article.draft) return;
    const key = exportedKey(article);
    setExportingKey(key);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: article.slug,
          language: article.language,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        window.alert(data?.error ?? `Export failed (${res.status})`);
        return;
      }
      startTransition(() => router.refresh());
    } finally {
      setExportingKey((curr) => (curr === key ? null : curr));
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/articles?slug=${encodeURIComponent(pendingDelete.slug)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        window.alert(data?.error ?? `Delete failed (${res.status})`);
        return;
      }
      setPendingDelete(null);
      startTransition(() => router.refresh());
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-4 pt-8 pb-16 font-sans md:gap-8 md:pt-16">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin">Admin</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Writing</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-normal text-balance text-foreground sm:text-4xl">
            Writing
          </h1>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
            <span>
              <span className="tabular-nums">{published.length}</span> published
            </span>
            {drafts.length > 0 && (
              <>
                <span aria-hidden className="text-foreground/20">
                  ·
                </span>
                <span>
                  <span className="tabular-nums">{drafts.length}</span> draft
                  {drafts.length === 1 ? "" : "s"}
                </span>
              </>
            )}
            {published.length > 0 && (
              <>
                <span aria-hidden className="text-foreground/20">
                  ·
                </span>
                {pendingExportCount === 0 ? (
                  <span
                    className="inline-flex items-center gap-1 text-[#0040ff] dark:text-[#ffff01]"
                    title="Every published article is committed to git."
                  >
                    <CheckCircleIcon weight="fill" className="size-3.5" />
                    All in git
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 text-[#0040ff] dark:text-[#ffff01]"
                    title="Articles edited since the last snapshot. Click Export to git to commit."
                  >
                    <span
                      aria-hidden
                      className="inline-block size-1.5 rounded-full bg-[#0040ff] dark:bg-[#ffff01]"
                    />
                    <span className="tabular-nums">{pendingExportCount}</span>{" "}
                    pending export
                  </span>
                )}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton pendingCount={pendingExportCount} />
        </div>
      </header>

      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <SearchField search={search} onSearchChange={setSearch} />
          <FilterMenu filter={filter} onFilterChange={setFilter} />
          <SortMenu sort={sort} onSortChange={setSort} />
          <Button onClick={openNew} className="h-9 shrink-0">
            <ArticleIcon weight="bold" />
            <span className="hidden sm:inline">New article</span>
          </Button>
        </div>

        {list.length === 0 ? (
          isFiltering ? (
            <NoResults onClear={() => setSearch("")} />
          ) : (
            <EmptyAll filter={filter} onNew={openNew} />
          )
        ) : (
          <ArticleList
            articles={list}
            exportedSet={exportedSet}
            exportingKey={exportingKey}
            onEdit={openEdit}
            onExport={exportArticle}
            onDeleteRequest={setPendingDelete}
          />
        )}
      </section>

      <ArticleEditor
        key={editor.sessionId}
        open={editor.open}
        initial={editor.initial}
        onClose={closeEditor}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this article?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete ? (
                <>
                  This will permanently remove{" "}
                  <code className="font-sans text-xs">
                    content/{pendingDelete.slug}.md
                  </code>
                  . The change is committed to git — recoverable from history,
                  but not from the UI.
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

function SearchField({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="relative flex-1">
      <MagnifyingGlassIcon
        weight="regular"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
      />
      <Input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search articles…"
        aria-label="Search articles by title"
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
      <DropdownMenuContent align="end" className="min-w-40">
        {(Object.keys(FILTER_LABELS) as FilterKey[]).map((key) => (
          <DropdownMenuItem
            key={key}
            onClick={() => onFilterChange(key)}
            className="justify-between"
          >
            <span>{FILTER_LABELS[key]}</span>
            {filter === key && (
              <CheckIcon
                weight="bold"
                className="size-3.5 text-[#0040ff] dark:text-[#ffff01]"
              />
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
      <DropdownMenuContent align="end" className="min-w-40">
        {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
          <DropdownMenuItem
            key={key}
            onClick={() => onSortChange(key)}
            className="justify-between"
          >
            <span>{SORT_LABELS[key]}</span>
            {sort === key && (
              <CheckIcon
                weight="bold"
                className="size-3.5 text-[#0040ff] dark:text-[#ffff01]"
              />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ArticleList({
  articles,
  exportedSet,
  exportingKey,
  onEdit,
  onExport,
  onDeleteRequest,
}: {
  articles: Article[];
  exportedSet: Set<string>;
  exportingKey: string | null;
  onEdit: (article: Article) => void;
  onExport: (article: Article) => void;
  onDeleteRequest: (article: Article) => void;
}) {
  return (
    <ul className="flex flex-col divide-y divide-foreground/5">
      {articles.map((a) => {
        const key = exportedKey(a);
        const isExported = !a.draft && exportedSet.has(key);
        const showUnexported = !a.draft && !isExported;
        const isExporting = exportingKey === key;
        return (
          <li
            key={a.slug}
            className="group/row flex items-center gap-4 py-3.5 transition-colors"
          >
            <button
              type="button"
              onClick={() => onEdit(a)}
              className="-mx-2 -my-1 min-w-0 flex-1 cursor-pointer rounded-md px-2 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
            >
              <div className="flex items-center gap-2">
                <p className="truncate text-base font-medium leading-tight text-foreground transition-opacity group-hover/row:opacity-70">
                  {a.title}
                </p>
                {a.draft && <DraftTag />}
                {showUnexported && <UnexportedTag />}
                {isExported && <ExportedTag />}
              </div>
              <p className="mt-1 truncate font-sans text-xs text-zinc-500 dark:text-zinc-500">
                /writing/{a.slug}
              </p>
            </button>
            <span className="shrink-0 font-sans text-xs font-medium uppercase tracking-wider tabular-nums text-zinc-500 dark:text-zinc-500">
              {a.dateLabel}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Actions for ${a.title}`}
                  className="text-zinc-600 dark:text-zinc-400"
                >
                  <DotsThreeVerticalIcon weight="bold" className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(a)}>
                  <PencilSimpleIcon weight="bold" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/writing/${a.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ArrowSquareOutIcon weight="bold" />
                    Open link
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onExport(a)}
                  disabled={a.draft || isExporting}
                >
                  <GitCommitIcon weight="bold" />
                  {isExporting
                    ? "Exporting…"
                    : isExported
                      ? "Re-export to Git"
                      : "Export to Git"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDeleteRequest(a)}
                >
                  <TrashIcon weight="bold" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        );
      })}
    </ul>
  );
}

function DraftTag() {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-foreground/6 px-2.5 py-0.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
      Draft
    </span>
  );
}

function UnexportedTag() {
  return (
    <span
      title="Not yet committed to git — click Export to git to snapshot."
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#0040ff]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#0040ff] dark:bg-[#ffff01]/10 dark:text-[#ffff01]"
    >
      <span
        aria-hidden
        className="inline-block size-1.5 rounded-full bg-[#0040ff] dark:bg-[#ffff01]"
      />
      Pending export
    </span>
  );
}

function ExportedTag() {
  return (
    <span
      title="Committed to git — content matches the latest snapshot."
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#0040ff]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#0040ff] dark:bg-[#ffff01]/10 dark:text-[#ffff01]"
    >
      <CheckCircleIcon weight="fill" className="size-3" />
      In git
    </span>
  );
}

function EmptyAll({ filter, onNew }: { filter: FilterKey; onNew: () => void }) {
  const copy: Record<FilterKey, { title: string; description: string }> = {
    all: {
      title: "Nothing here yet",
      description: "Start writing — your first article will appear here.",
    },
    published: {
      title: "No published articles",
      description: "Drafts you publish will show up here.",
    },
    drafts: {
      title: "No drafts",
      description: "Save an article as draft to keep it private.",
    },
  };
  const { title, description } = copy[filter];

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-foreground/15 px-6 py-14 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-[#0040ff]/10 text-[#0040ff] dark:bg-[#ffff01]/10 dark:text-[#ffff01]">
        <FileTextIcon weight="regular" className="size-5" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-base font-medium text-foreground">{title}</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          {description}
        </p>
      </div>
      <Button onClick={onNew} className="mt-2">
        <ArticleIcon weight="bold" />
        New article
      </Button>
    </div>
  );
}

function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-foreground/15 px-6 py-14 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-foreground/4 text-zinc-500 dark:text-zinc-500">
        <MagnifyingGlassIcon weight="regular" className="size-5" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">No matches</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          Nothing here fits your search.
        </p>
      </div>
      <Button onClick={onClear} variant="outline" className="mt-2">
        Clear search
      </Button>
    </div>
  );
}

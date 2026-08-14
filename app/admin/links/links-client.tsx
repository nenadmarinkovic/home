"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowSquareOutIcon,
  ArrowsClockwiseIcon,
  ArrowsDownUpIcon,
  CheckCircleIcon,
  CheckIcon,
  CopyIcon,
  DotsThreeVerticalIcon,
  FunnelSimpleIcon,
  KeyIcon,
  LinkSimpleIcon,
  MagicWandIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";

import { TagChip } from "@/components/tag-chip";
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
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogFooterActions,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { hostnameOf } from "@/lib/url-utils";
import { cn } from "@/lib/utils";

type ClientTag = { id: number; slug: string; name: string; count: number };
type ClientLink = {
  id: number;
  url: string;
  title: string;
  type: string;
  note: string;
  createdAt: string;
  tags: { id: number; slug: string; name: string }[];
};

type Props = {
  initialTags: ClientTag[];
  initialLinks: ClientLink[];
  initialToken: string | null;
};

const ACCESS = new Set(["public"]);

type SortKey = "newest" | "oldest" | "title-asc" | "title-desc";
type FilterKey = "all" | "public" | "private";

const SORT_LABELS: Record<SortKey, string> = {
  newest: "Newest",
  oldest: "Oldest",
  "title-asc": "Title A–Z",
  "title-desc": "Title Z–A",
};

const FILTER_LABELS: Record<FilterKey, string> = {
  all: "All",
  public: "Public",
  private: "Private",
};

function dateLabelFor(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function applyControls(
  links: ClientLink[],
  search: string,
  filter: FilterKey,
  activeTags: string[],
  sort: SortKey,
): ClientLink[] {
  const q = search.trim().toLowerCase();
  let out = links;

  if (filter !== "all") {
    out = out.filter((l) => {
      const isPublic = l.tags.some((t) => t.slug === "public");
      return filter === "public" ? isPublic : !isPublic;
    });
  }

  if (activeTags.length > 0) {
    out = out.filter((l) => {
      const slugs = new Set(l.tags.map((t) => t.slug));
      for (const s of activeTags) if (!slugs.has(s)) return false;
      return true;
    });
  }

  if (q) {
    out = out.filter((l) => {
      const haystack =
        `${l.title} ${l.note} ${l.url} ${hostnameOf(l.url)}`.toLowerCase();
      return haystack.includes(q);
    });
  }

  const sorted = [...out];
  switch (sort) {
    case "newest":
      sorted.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      break;
    case "oldest":
      sorted.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
      break;
    case "title-asc":
      sorted.sort((a, b) => (a.title || a.url).localeCompare(b.title || b.url));
      break;
    case "title-desc":
      sorted.sort((a, b) => (b.title || b.url).localeCompare(a.title || a.url));
      break;
  }
  return sorted;
}

export function LinksAdminClient({
  initialTags,
  initialLinks,
  initialToken,
}: Props) {
  const [tags, setTags] = useState<ClientTag[]>(initialTags);
  const [links, setLinks] = useState<ClientLink[]>(initialLinks);
  const [token, setToken] = useState<string | null>(initialToken);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const [editing, setEditing] = useState<ClientLink | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ClientLink | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [tagsDialogOpen, setTagsDialogOpen] = useState(false);
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);

  const visibleLinks = useMemo(
    () => applyControls(links, search, filter, activeTags, sort),
    [links, search, filter, activeTags, sort],
  );

  const publicCount = useMemo(
    () => links.filter((l) => l.tags.some((t) => t.slug === "public")).length,
    [links],
  );

  const isFiltering =
    search.trim().length > 0 || filter !== "all" || activeTags.length > 0;

  function toggleFilterTag(slug: string) {
    setActiveTags((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  function clearAllFilters() {
    setSearch("");
    setFilter("all");
    setActiveTags([]);
  }

  async function rotateToken() {
    const res = await fetch("/api/admin/api-token", { method: "POST" });
    if (!res.ok) return;
    const data = (await res.json()) as { token: string };
    setToken(data.token);
  }

  async function refreshTags() {
    const res = await fetch("/api/admin/tags");
    if (!res.ok) return;
    const data = (await res.json()) as { tags: ClientTag[] };
    setTags(data.tags);
  }

  function reloadAfterTagMutation() {
    window.location.reload();
  }

  async function deleteLink(link: ClientLink) {
    const res = await fetch(`/api/admin/links/${link.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setLinks((prev) => prev.filter((l) => l.id !== link.id));
    }
    setPendingDelete(null);
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
            <BreadcrumbPage>Links</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-normal text-balance text-foreground sm:text-4xl">
            Links
          </h1>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
            <span>
              <span className="tabular-nums">{links.length}</span> saved
            </span>
            <span aria-hidden className="text-foreground/20">
              ·
            </span>
            <span>
              <span className="tabular-nums">{tags.length}</span> tag
              {tags.length === 1 ? "" : "s"}
            </span>
            <span aria-hidden className="text-foreground/20">
              ·
            </span>
            <span className="inline-flex items-center gap-1 text-[#0040ff] dark:text-[#ffff01]">
              <CheckCircleIcon weight="fill" className="size-3.5" />
              <span className="tabular-nums">{publicCount}</span> public
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-9"
            onClick={() => setTagsDialogOpen(true)}
          >
            <TagIcon weight="bold" />
            <span className="hidden sm:inline">Tags</span>
          </Button>
          <Button
            variant="outline"
            className="h-9"
            onClick={() => setTokenDialogOpen(true)}
          >
            <KeyIcon weight="bold" />
            <span className="hidden sm:inline">API token</span>
          </Button>
          <Button className="h-9" onClick={() => setSaveDialogOpen(true)}>
            <LinkSimpleIcon weight="bold" />
            <span className="hidden sm:inline">Save link</span>
          </Button>
        </div>
      </header>

      <section className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <SearchField search={search} onSearchChange={setSearch} />
          <FilterMenu filter={filter} onFilterChange={setFilter} />
          <SortMenu sort={sort} onSortChange={setSort} />
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map((tag) => (
              <TagChip
                key={tag.slug}
                active={activeTags.includes(tag.slug)}
                onClick={() => toggleFilterTag(tag.slug)}
              >
                {tag.name}
                <span className="ml-1.5 tabular-nums opacity-60">
                  {tag.count}
                </span>
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

        {visibleLinks.length === 0 ? (
          isFiltering ? (
            <NoResults onClear={clearAllFilters} />
          ) : (
            <EmptyAll onNew={() => setSaveDialogOpen(true)} />
          )
        ) : (
          <LinkList
            links={visibleLinks}
            onEdit={setEditing}
            onDeleteRequest={setPendingDelete}
          />
        )}
      </section>

      <SaveLinkDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        tags={tags}
        onSaved={(link) => {
          setLinks((prev) => [link, ...prev.filter((l) => l.id !== link.id)]);
          setSaveDialogOpen(false);
        }}
      />

      <TagsDialog
        open={tagsDialogOpen}
        onOpenChange={setTagsDialogOpen}
        tags={tags}
        onChanged={refreshTags}
        onAfterMutate={reloadAfterTagMutation}
      />

      <TokenDialog
        open={tokenDialogOpen}
        onOpenChange={setTokenDialogOpen}
        token={token}
        onRotate={rotateToken}
      />

      {editing && (
        <EditLinkDialog
          link={editing}
          tags={tags}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setLinks((prev) =>
              prev.map((l) => (l.id === updated.id ? updated : l)),
            );
            setEditing(null);
          }}
        />
      )}

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete link?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.title || pendingDelete?.url}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDelete && deleteLink(pendingDelete)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
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
        placeholder="Search links…"
        aria-label="Search links"
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

function LinkList({
  links,
  onEdit,
  onDeleteRequest,
}: {
  links: ClientLink[];
  onEdit: (link: ClientLink) => void;
  onDeleteRequest: (link: ClientLink) => void;
}) {
  return (
    <ul className="flex flex-col divide-y divide-foreground/5">
      {links.map((link) => {
        const isPublic = link.tags.some((t) => t.slug === "public");
        return (
          <li
            key={link.id}
            className="group/row flex items-start gap-2 py-3.5 transition-colors"
          >
            <button
              type="button"
              onClick={() => onEdit(link)}
              className="-mx-2 -my-1 min-w-0 flex-1 cursor-pointer rounded-md px-2 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
            >
              <p className="mb-1 font-sans text-xs font-medium uppercase tracking-wider tabular-nums text-zinc-500 dark:text-zinc-500">
                {dateLabelFor(link.createdAt)}
              </p>
              <div className="flex items-center gap-2">
                <p className="wrap-break-word text-lg font-medium leading-tight text-foreground transition-opacity group-hover/row:opacity-70">
                  {link.title || link.url}
                </p>
                <span className="hidden sm:contents">
                  {isPublic ? <PublicTag /> : <PrivateTag />}
                </span>
              </div>
              {link.note && (
                <p className="mt-1 line-clamp-2 text-sm leading-snug text-zinc-600 dark:text-zinc-400">
                  {link.note}
                </p>
              )}
              <p className="mt-1 truncate font-sans text-xs text-zinc-500 dark:text-zinc-500">
                {hostnameOf(link.url)}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 sm:hidden">
                {isPublic ? <PublicTag /> : <PrivateTag />}
              </div>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Actions for ${link.title || link.url}`}
                  className="text-zinc-600 dark:text-zinc-400"
                >
                  <DotsThreeVerticalIcon weight="bold" className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onEdit(link)}>
                  <PencilSimpleIcon weight="bold" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <ArrowSquareOutIcon weight="bold" />
                    Open link
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => onDeleteRequest(link)}
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

function PublicTag() {
  return (
    <span
      title="Visible on the public /links page."
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#0040ff]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#0040ff] dark:bg-[#ffff01]/10 dark:text-[#ffff01]"
    >
      <CheckCircleIcon weight="fill" className="size-3" />
      Public
    </span>
  );
}

function PrivateTag() {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-foreground/6 px-2.5 py-0.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
      Private
    </span>
  );
}

function EmptyAll({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-foreground/15 px-6 py-14 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-[#0040ff]/10 text-[#0040ff] dark:bg-[#ffff01]/10 dark:text-[#ffff01]">
        <LinkSimpleIcon weight="regular" className="size-5" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-base font-medium text-foreground">
          Nothing here yet
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          Save your first link — manually or from the extension.
        </p>
      </div>
      <Button onClick={onNew} className="mt-2">
        <LinkSimpleIcon weight="bold" />
        Save link
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
          Nothing here fits the current filters.
        </p>
      </div>
      <Button onClick={onClear} variant="outline" className="mt-2">
        Clear filters
      </Button>
    </div>
  );
}

function TokenDialog({
  open,
  onOpenChange,
  token,
  onRotate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string | null;
  onRotate: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extension API token</DialogTitle>
            <DialogDescription>
              Paste this into the Chrome extension settings. Anyone with the
              token can post links — rotate it if it leaks.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="flex items-start gap-2 rounded bg-foreground/4 px-3 py-2">
              <code className="flex-1 break-all font-mono text-xs leading-relaxed text-foreground">
                {token ?? "Not generated yet."}
              </code>
              {token && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={copy}
                  aria-label="Copy token"
                  className="shrink-0 text-zinc-600 hover:bg-foreground/4 dark:text-zinc-400"
                >
                  {copied ? (
                    <CheckIcon
                      weight="bold"
                      className="text-[#0040ff] dark:text-[#ffff01]"
                    />
                  ) : (
                    <CopyIcon weight="bold" />
                  )}
                </Button>
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => (token ? setConfirming(true) : onRotate())}
            >
              <ArrowsClockwiseIcon weight="bold" />
              {token ? "Rotate" : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rotate token?</AlertDialogTitle>
            <AlertDialogDescription>
              The current token will stop working. You&apos;ll need to paste the
              new one into the extension.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirming(false);
                onRotate();
              }}
            >
              Rotate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function TagsDialog({
  open,
  onOpenChange,
  tags,
  onChanged,
  onAfterMutate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: ClientTag[];
  onChanged: () => void;
  onAfterMutate: () => void;
}) {
  const [newName, setNewName] = useState("");
  const [renaming, setRenaming] = useState<{ id: number; name: string } | null>(
    null,
  );
  const [pendingDelete, setPendingDelete] = useState<ClientTag | null>(null);
  const [busyCreating, setBusyCreating] = useState(false);

  async function createTag(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const res = await fetch("/api/admin/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    if (res.ok) {
      onChanged();
      return true;
    }
    return false;
  }

  async function onAddSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busyCreating) return;
    setBusyCreating(true);
    const ok = await createTag(newName);
    setBusyCreating(false);
    if (ok) setNewName("");
  }

  async function commitRename() {
    if (!renaming) return;
    const res = await fetch(`/api/admin/tags/${renaming.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: renaming.name }),
    });
    if (res.ok) {
      setRenaming(null);
      onChanged();
      onAfterMutate();
    }
  }

  async function commitDelete() {
    if (!pendingDelete) return;
    const res = await fetch(`/api/admin/tags/${pendingDelete.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setPendingDelete(null);
      onChanged();
      onAfterMutate();
    }
  }

  const sortedTags = [...tags].sort((a, b) => {
    if (a.slug === "public" && b.slug !== "public") return -1;
    if (b.slug === "public" && a.slug !== "public") return 1;
    return b.count - a.count || a.name.localeCompare(b.name);
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tags</DialogTitle>
            <DialogDescription>
              Tag a link <strong>public</strong> to surface it on /links —
              everything else is for organizing.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            <form onSubmit={onAddSubmit} className="flex items-center gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New tag name"
                className="flex-1"
                disabled={busyCreating}
              />
              <Button
                type="submit"
                variant="outline"
                className="h-9 shrink-0"
                disabled={busyCreating || !newName.trim()}
              >
                <PlusIcon weight="bold" />
                Add tag
              </Button>
            </form>

            {sortedTags.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No tags yet — add one above.
              </p>
            ) : (
              <ul className="-mx-1 flex max-h-96 flex-col divide-y divide-foreground/5 overflow-y-auto px-1">
                {sortedTags.map((tag) => (
                  <TagRow
                    key={tag.id}
                    tag={tag}
                    isAccess={ACCESS.has(tag.slug)}
                    isRenaming={renaming?.id === tag.id}
                    renamingValue={renaming?.name ?? ""}
                    onRenamingChange={(name) =>
                      setRenaming({ id: tag.id, name })
                    }
                    onStartRename={() =>
                      setRenaming({ id: tag.id, name: tag.name })
                    }
                    onCommitRename={commitRename}
                    onCancelRename={() => setRenaming(null)}
                    onDelete={() => setPendingDelete(tag)}
                  />
                ))}
              </ul>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete tag “{pendingDelete?.name}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The tag is removed from every link it was attached to. Links
              themselves stay.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={commitDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function SaveLinkDialog({
  open,
  onOpenChange,
  tags,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: ClientTag[];
  onSaved: (link: ClientLink) => void;
}) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setUrl("");
    setTitle("");
    setDescription("");
    setSelected([]);
    setError(null);
    setSummarizing(false);
  }

  async function runSummarize() {
    if (!url.trim() || summarizing) return;
    setSummarizing(true);
    setError(null);
    try {
      const res = await fetch("/api/links/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        summary?: string;
        error?: string;
      };
      if (!res.ok || !data.summary) {
        setError(data.error ?? "Could not summarize this page.");
      } else {
        setDescription(data.summary);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSummarizing(false);
    }
  }

  function toggleTag(slug: string) {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  async function submit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!url.trim()) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: url.trim(),
        title: title.trim(),
        note: description.trim(),
        tags: selected,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Failed to save");
      return;
    }
    const data = (await res.json()) as { link: ClientLink };
    onSaved(data.link);
    reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save a link</DialogTitle>
          <DialogDescription>
            Add a URL, optionally a title and description, and tag it.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={submit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <DialogBody className="flex flex-col gap-3">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              required
              autoFocus
            />
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
            />
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="save-link-description"
                  className="font-sans text-[11px] font-medium uppercase tracking-wider text-zinc-500"
                >
                  Description
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={runSummarize}
                  disabled={!url.trim() || summarizing}
                  className="font-sans text-[11px] uppercase tracking-wider text-[#0040ff] hover:bg-[#0040ff]/10 hover:text-[#0040ff] dark:text-[#ffff01] dark:hover:bg-[#ffff01]/10 dark:hover:text-[#ffff01]"
                >
                  <MagicWandIcon weight="bold" />
                  {summarizing ? "Summarizing…" : "Summarize"}
                </Button>
              </div>
              <Textarea
                id="save-link-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A sentence or two — or let AI write a 3-sentence summary."
                rows={3}
              />
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <TagChip
                    key={tag.slug}
                    active={selected.includes(tag.slug)}
                    onClick={() => toggleTag(tag.slug)}
                  >
                    {tag.name}
                  </TagChip>
                ))}
              </div>
            )}
            {error && (
              <p className="font-sans text-xs text-destructive">{error}</p>
            )}
          </DialogBody>
          <DialogFooter>
            <DialogFooterActions>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy || !url.trim()}>
                <PlusIcon weight="bold" />
                {busy ? "Saving…" : "Save link"}
              </Button>
            </DialogFooterActions>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditLinkDialog({
  link,
  tags,
  onClose,
  onSaved,
}: {
  link: ClientLink;
  tags: ClientTag[];
  onClose: () => void;
  onSaved: (link: ClientLink) => void;
}) {
  const [title, setTitle] = useState(link.title);
  const [description, setDescription] = useState(link.note);
  const [selected, setSelected] = useState<string[]>(
    link.tags.map((t) => t.slug),
  );
  const [busy, setBusy] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleTag(slug: string) {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  async function runSummarize() {
    if (summarizing) return;
    setSummarizing(true);
    setError(null);
    try {
      const res = await fetch("/api/links/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: link.url }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        summary?: string;
        error?: string;
      };
      if (!res.ok || !data.summary) {
        setError(data.error ?? "Could not summarize this page.");
      } else {
        setDescription(data.summary);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSummarizing(false);
    }
  }

  async function save() {
    setBusy(true);
    const res = await fetch(`/api/admin/links/${link.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, note: description, tags: selected }),
    });
    setBusy(false);
    if (!res.ok) return;
    const data = (await res.json()) as { link: ClientLink };
    onSaved(data.link);
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit link</DialogTitle>
          <DialogDescription className="break-all font-mono text-xs">
            {link.url}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="edit-link-description"
                className="font-sans text-[11px] font-medium uppercase tracking-wider text-zinc-500"
              >
                Description
              </label>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={runSummarize}
                disabled={summarizing}
                className="font-sans text-[11px] uppercase tracking-wider text-[#0040ff] hover:bg-[#0040ff]/10 hover:text-[#0040ff] dark:text-[#ffff01] dark:hover:bg-[#ffff01]/10 dark:hover:text-[#ffff01]"
              >
                <MagicWandIcon weight="bold" />
                {summarizing ? "Summarizing…" : "Summarize"}
              </Button>
            </div>
            <Textarea
              id="edit-link-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A sentence or two — or let AI write a 3-sentence summary."
              rows={3}
            />
          </div>
          {error && (
            <p className="font-sans text-xs text-destructive">{error}</p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <TagChip
                key={tag.slug}
                active={selected.includes(tag.slug)}
                onClick={() => toggleTag(tag.slug)}
              >
                {tag.name}
              </TagChip>
            ))}
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogFooterActions>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={save} disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </Button>
          </DialogFooterActions>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TagRow({
  tag,
  isAccess,
  isRenaming,
  renamingValue,
  onRenamingChange,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onDelete,
}: {
  tag: ClientTag;
  isAccess: boolean;
  isRenaming: boolean;
  renamingValue: string;
  onRenamingChange: (name: string) => void;
  onStartRename: () => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onDelete: () => void;
}) {
  if (isRenaming) {
    return (
      <li className="flex items-center gap-1 px-1 py-2.5">
        <Input
          autoFocus
          value={renamingValue}
          onChange={(e) => onRenamingChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onCommitRename();
            }
            if (e.key === "Escape") onCancelRename();
          }}
          className="h-8 flex-1 text-sm"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onCommitRename}
          aria-label="Save"
        >
          <CheckIcon weight="bold" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onCancelRename}
          aria-label="Cancel"
        >
          <XIcon weight="bold" />
        </Button>
      </li>
    );
  }

  const countLabel =
    tag.count === 0
      ? "No links"
      : `${tag.count} link${tag.count === 1 ? "" : "s"}`;

  return (
    <li className="flex items-center gap-3 px-1 py-2.5">
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-base font-medium leading-tight",
            isAccess ? "text-[#0040ff] dark:text-[#ffff01]" : "text-foreground",
          )}
        >
          {tag.name}
        </p>
        <p className="mt-0.5 truncate font-sans text-xs text-zinc-500">
          #{tag.slug}
        </p>
      </div>
      <span
        className={cn(
          "shrink-0 font-sans text-[11px] font-medium uppercase tracking-wider tabular-nums",
          tag.count === 0 ? "text-zinc-400 italic" : "text-zinc-500",
        )}
      >
        {countLabel}
      </span>
      {!isAccess && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Actions for ${tag.name}`}
              className="shrink-0 text-zinc-600 dark:text-zinc-400"
            >
              <DotsThreeVerticalIcon weight="bold" className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onStartRename}>
              <PencilSimpleIcon weight="bold" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <TrashIcon weight="bold" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </li>
  );
}

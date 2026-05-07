"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Article as ArticleIcon,
  DotsThreeVertical,
  FileText,
  PencilSimple,
  Trash,
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { ArticleEditor, type EditorInitial } from "./article-editor";
import { LogoutButton } from "./logout-button";
import type { Article } from "../writing/articles";

type AdminClientProps = {
  published: Article[];
  drafts: Article[];
};

export function AdminClient({ published, drafts }: AdminClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editor, setEditor] = useState<{
    open: boolean;
    initial: EditorInitial | null;
  }>({ open: false, initial: null });
  const [pendingDelete, setPendingDelete] = useState<Article | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openNew() {
    setEditor({ open: true, initial: null });
  }

  function openEdit(article: Article) {
    setEditor({
      open: true,
      initial: {
        slug: article.slug,
        title: article.title,
        subtitle: article.subtitle,
        description: article.description,
        date: article.date,
        body: article.body,
        draft: article.draft,
      },
    });
  }

  function closeEditor() {
    setEditor((prev) => ({ ...prev, open: false }));
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
    <main className="flex flex-1 flex-col gap-12 py-16 font-sans">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground">
            Admin
          </h1>
          <p className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-500">
            <span className="tabular-nums">
              {published.length} published
            </span>
            <span
              aria-hidden="true"
              className="size-1 rounded-full bg-[#fd6401]"
            />
            <span className="tabular-nums">
              {drafts.length} {drafts.length === 1 ? "draft" : "drafts"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LogoutButton />
          <Button onClick={openNew} size="lg">
            <ArticleIcon weight="bold" />
            New article
          </Button>
        </div>
      </header>

      <Tabs defaultValue="published" className="gap-8">
        <TabsList>
          <TabsTrigger value="published" className="group/trigger">
            Published
            <span className="ml-1 tabular-nums font-normal text-zinc-500 transition-colors group-data-[state=active]/trigger:text-[#fd6401] dark:text-zinc-500">
              {published.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="drafts" className="group/trigger">
            Drafts
            <span className="ml-1 tabular-nums font-normal text-zinc-500 transition-colors group-data-[state=active]/trigger:text-[#fd6401] dark:text-zinc-500">
              {drafts.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="published">
          <ArticleList
            articles={published}
            empty={
              <EmptyState
                title="No articles yet"
                description="Drafts you publish will appear here."
                action={
                  <Button onClick={openNew}>
                    <ArticleIcon weight="bold" />
                    Create one
                  </Button>
                }
              />
            }
            onEdit={openEdit}
            onDeleteRequest={setPendingDelete}
          />
        </TabsContent>

        <TabsContent value="drafts">
          <ArticleList
            articles={drafts}
            empty={
              <EmptyState
                title="No drafts"
                description="Start writing — save as draft to keep it private."
                action={
                  <Button onClick={openNew}>
                    <ArticleIcon weight="bold" />
                    New draft
                  </Button>
                }
              />
            }
            onEdit={openEdit}
            onDeleteRequest={setPendingDelete}
          />
        </TabsContent>
      </Tabs>

      <ArticleEditor
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
                  <code className="font-mono text-xs">
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

function ArticleList({
  articles,
  empty,
  onEdit,
  onDeleteRequest,
}: {
  articles: Article[];
  empty: React.ReactNode;
  onEdit: (article: Article) => void;
  onDeleteRequest: (article: Article) => void;
}) {
  if (articles.length === 0) {
    return <>{empty}</>;
  }

  return (
    <ul className="-mx-3 flex flex-col">
      {articles.map((a) => (
        <li
          key={a.slug}
          className="group/row flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-foreground/[0.04]"
        >
          <button
            type="button"
            onClick={() => onEdit(a)}
            className="-mx-1 -my-1 min-w-0 flex-1 cursor-pointer rounded-md px-1 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
          >
            <p className="truncate text-sm font-medium text-foreground">
              {a.title}
            </p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-500">
              /writing/{a.slug}
            </p>
          </button>
          <span className="shrink-0 tabular-nums text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
            {a.dateLabel}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${a.title}`}
                className="text-zinc-500 dark:text-zinc-500"
              >
                <DotsThreeVertical weight="bold" className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(a)}>
                <PencilSimple weight="bold" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDeleteRequest(a)}
              >
                <Trash weight="bold" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-foreground/15 px-6 py-14 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-[#fd6401]/10 text-[#fd6401]">
        <FileText weight="regular" className="size-5" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          {description}
        </p>
      </div>
      <div className="mt-2">{action}</div>
    </div>
  );
}

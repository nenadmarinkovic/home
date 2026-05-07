"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  DotsThreeVertical,
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
        // For now surface as alert; AlertDialog stays open if it fails.
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
    <>
      <Button onClick={openNew} size="lg" className="self-start">
        New article
      </Button>

      <Tabs defaultValue="published" className="gap-6">
        <TabsList>
          <TabsTrigger value="published">
            Published
            <span className="font-normal text-zinc-500 dark:text-zinc-500">
              {published.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="drafts">
            Drafts
            <span className="font-normal text-zinc-500 dark:text-zinc-500">
              {drafts.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="published">
          <ArticleList
            articles={published}
            emptyText="No published articles yet."
            onEdit={openEdit}
            onDeleteRequest={setPendingDelete}
          />
        </TabsContent>

        <TabsContent value="drafts">
          <ArticleList
            articles={drafts}
            emptyText="No drafts yet. Click New article and choose Save as draft."
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
              className="bg-[#fd6401] text-background hover:bg-[#fd6401]/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ArticleList({
  articles,
  emptyText,
  onEdit,
  onDeleteRequest,
}: {
  articles: Article[];
  emptyText: string;
  onEdit: (article: Article) => void;
  onDeleteRequest: (article: Article) => void;
}) {
  if (articles.length === 0) {
    return (
      <p className="font-sans text-sm text-zinc-500 dark:text-zinc-500">
        {emptyText}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-foreground/10">
      {articles.map((a) => (
        <li
          key={a.slug}
          className="flex items-center justify-between gap-6 py-3"
        >
          <button
            type="button"
            onClick={() => onEdit(a)}
            className="-mx-2 -my-1 min-w-0 flex-1 cursor-pointer rounded-md px-2 py-1 text-left transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
          >
            <p className="truncate font-sans text-sm font-medium text-foreground">
              {a.title}
            </p>
            <p className="truncate font-sans text-xs text-zinc-500 dark:text-zinc-500">
              /writing/{a.slug}
            </p>
          </button>
          <span className="font-sans text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            {a.dateLabel}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${a.title}`}
                className="text-zinc-600 dark:text-zinc-400"
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

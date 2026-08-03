"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { DotsThreeVertical, PencilSimple, Trash } from "@phosphor-icons/react";

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
import { useAuthed } from "@/lib/use-authed";
import { cn } from "@/lib/utils";

import type { EditorInitial } from "@/app/admin/writing/article-editor";
import type { Article } from "@/app/writing/articles";

const ArticleEditor = dynamic(
  () =>
    import("@/app/admin/writing/article-editor").then((m) => m.ArticleEditor),
  { ssr: false },
);

type Props = {
  article: Article;
  className?: string;
};

export function AdminActions({ article, className }: Props) {
  const router = useRouter();
  const authed = useAuthed();
  const [, startTransition] = useTransition();
  const [editorOpen, setEditorOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!authed) return null;

  const initial: EditorInitial = {
    slug: article.slug,
    title: article.title,
    subtitle: article.subtitle,
    description: article.description,
    image: article.image,
    date: article.date,
    body: article.body,
    draft: article.draft,
  };

  async function confirmDelete() {
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/articles?slug=${encodeURIComponent(article.slug)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        window.alert(data?.error ?? `Delete failed (${res.status})`);
        return;
      }
      setPendingDelete(false);
      startTransition(() => router.refresh());
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Admin actions for ${article.title}`}
            className={cn("text-zinc-600 dark:text-zinc-400", className)}
          >
            <DotsThreeVertical weight="bold" className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditorOpen(true)}>
            <PencilSimple weight="bold" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setPendingDelete(true)}
          >
            <Trash weight="bold" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ArticleEditor
        open={editorOpen}
        initial={initial}
        onClose={() => setEditorOpen(false)}
      />

      <AlertDialog
        open={pendingDelete}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this article?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <code className="font-sans text-xs">
                content/{article.slug}.md
              </code>
              . The change is committed to git — recoverable from history, but
              not from the UI.
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
    </>
  );
}

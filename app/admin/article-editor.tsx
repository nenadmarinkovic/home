"use client";

import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { format, parseISO } from "date-fns";
import {
  CalendarBlank,
  ListBullets,
  Quotes,
  TextB,
  TextHOne,
  TextHTwo,
  TextItalic,
  Link as LinkIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type EditorInitial = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  date: string;
  body: string;
  draft: boolean;
};

type Props = {
  open: boolean;
  initial: EditorInitial | null;
  onClose: () => void;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ArticleEditor({ open, initial, onClose }: Props) {
  const router = useRouter();
  const isEditing = initial !== null;

  // Form state seeds directly from `initial`. The parent gives this component a
  // fresh `key` per open, so React mounts a new instance whenever the target
  // article changes — no effect-driven sync needed.
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(initial?.date ?? todayIso());
  const [error, setError] = useState<string | null>(null);
  const [pendingMode, setPendingMode] = useState<"draft" | "publish" | null>(
    null,
  );
  const [, startTransition] = useTransition();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false },
      }),
      Placeholder.configure({
        placeholder: "Start writing the essay…",
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
        bulletListMarker: "-",
        linkify: true,
        breaks: false,
      }),
    ],
    content: initial?.body ?? "",
    editorProps: {
      attributes: {
        class:
          "h-full font-sans text-sm leading-[1.55] text-foreground outline-none",
        spellcheck: "false",
      },
    },
  });

  async function save(mode: "draft" | "publish") {
    if (!editor) return;
    if (!title.trim()) {
      setError("Title required");
      return;
    }
    const body = (
      editor.storage as unknown as {
        markdown: { getMarkdown: () => string };
      }
    ).markdown.getMarkdown();
    if (!body.trim()) {
      setError("Body required");
      return;
    }
    setError(null);
    setPendingMode(mode);
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: initial?.slug,
          title: title.trim(),
          subtitle: subtitle.trim(),
          description: description.trim(),
          date,
          body,
          draft: mode === "draft",
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data?.error ?? `Save failed (${res.status})`);
        return;
      }
      startTransition(() => {
        onClose();
        router.refresh();
      });
    } finally {
      setPendingMode(null);
    }
  }

  const slug = title.trim()
    ? initial?.slug && initial.title.trim() === title.trim()
      ? initial.slug
      : slugify(title.trim())
    : "";

  const pending = pendingMode !== null;
  const isPublishedEdit = isEditing && initial && !initial.draft;
  const dialogTitle = isEditing
    ? initial.draft
      ? "Edit draft"
      : "Edit article"
    : "New article";

  const draftLabel = isPublishedEdit ? "Move to drafts" : "Save as draft";
  const draftPending = isPublishedEdit ? "Moving…" : "Saving…";
  const publishLabel = isPublishedEdit
    ? "Save changes"
    : isEditing
      ? "Publish"
      : "Publish";
  const publishPending = isPublishedEdit ? "Saving…" : "Publishing…";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-h-[calc(100dvh-1.5rem)] sm:w-[min(95vw,72rem)] sm:max-h-[92vh]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            Saves a <code className="font-mono text-xs">.md</code> file to{" "}
            <code className="font-mono text-xs">content/</code>. Drafts are
            hidden from the public site; publish to make it live.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="grid grid-cols-1 gap-0 p-0 sm:p-0 lg:grid-cols-[22rem_1fr]">
          <aside className="flex flex-col gap-5 border-foreground/10 px-5 py-4 sm:px-6 sm:py-5 lg:border-r">
            <SectionLabel>Frontmatter</SectionLabel>

            <FieldRow>
              <Label htmlFor="title">
                Title
                <RequiredMark />
              </Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="The Quiet Craft"
                className="h-10 font-sans text-sm"
              />
              {slug && (
                <p className="font-mono text-xs text-zinc-500 dark:text-zinc-500">
                  /writing/{slug}
                </p>
              )}
            </FieldRow>

            <FieldRow>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Notes on slow software."
                className="h-10 font-sans text-sm"
              />
            </FieldRow>

            <FieldRow>
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-full justify-start gap-2 px-3 text-sm font-normal"
                  >
                    <CalendarBlank
                      weight="regular"
                      className="size-4 text-zinc-500"
                    />
                    {format(parseISO(date), "MMMM d, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={parseISO(date)}
                    onSelect={(d) => {
                      if (d) setDate(format(d, "yyyy-MM-dd"));
                    }}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </FieldRow>

            <FieldRow>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Why the most lasting tools are the ones that disappear into the work…"
              />
              <p className="font-sans text-xs text-zinc-500 dark:text-zinc-500">
                Used in metadata, RSS, and the OG image.
              </p>
            </FieldRow>
          </aside>

          <section className="flex min-h-[40dvh] flex-col gap-3 px-5 py-4 sm:px-6 sm:py-5 lg:min-h-[60vh]">
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
              <SectionLabel>Body</SectionLabel>
              {editor && <EditorToolbar editor={editor} />}
            </div>
            <div className="flex-1 overflow-y-auto rounded-md border border-foreground/15 bg-field px-4 py-3 font-sans text-sm transition-colors focus-within:border-foreground/40 sm:px-5 sm:py-4">
              <EditorContent editor={editor} className="h-full" />
            </div>
          </section>
        </DialogBody>

        {error && (
          <div className="border-t border-foreground/10 bg-destructive/5 px-5 py-2.5 sm:px-6 sm:py-3">
            <p role="alert" className="font-sans text-sm text-destructive">
              {error}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            variant="ghost"
            onClick={() => save("draft")}
            disabled={pending || !title.trim()}
          >
            {pendingMode === "draft" ? draftPending : draftLabel}
          </Button>
          <Button
            size="lg"
            onClick={() => save("publish")}
            disabled={pending || !title.trim()}
          >
            {pendingMode === "publish" ? publishPending : publishLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
      {children}
    </p>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5">{children}</div>;
}

function RequiredMark() {
  return (
    <span className="text-[#fd6401]" aria-hidden="true">
      *
    </span>
  );
}

function EditorToolbar({ editor }: { editor: Editor }) {
  const buttons: Array<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    run: () => void;
  }> = [
    {
      label: "H2",
      icon: <TextHOne weight="bold" />,
      isActive: editor.isActive("heading", { level: 2 }),
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "H3",
      icon: <TextHTwo weight="bold" />,
      isActive: editor.isActive("heading", { level: 3 }),
      run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "Bold",
      icon: <TextB weight="bold" />,
      isActive: editor.isActive("bold"),
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: <TextItalic weight="bold" />,
      isActive: editor.isActive("italic"),
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Quote",
      icon: <Quotes weight="bold" />,
      isActive: editor.isActive("blockquote"),
      run: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: "List",
      icon: <ListBullets weight="bold" />,
      isActive: editor.isActive("bulletList"),
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Link",
      icon: <LinkIcon weight="bold" />,
      isActive: editor.isActive("link"),
      run: () => {
        const url = window.prompt("URL");
        if (!url) return;
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url })
          .run();
      },
    },
  ];

  return (
    <div className="flex flex-wrap gap-1">
      {buttons.map((b) => (
        <Button
          key={b.label}
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={b.run}
          aria-label={b.label}
          aria-pressed={b.isActive}
          title={b.label}
          className={cn(
            b.isActive
              ? "bg-[#fd6401]/10 text-[#fd6401] hover:bg-[#fd6401]/15 hover:text-[#fd6401]"
              : "text-zinc-600 dark:text-zinc-400",
          )}
        >
          {b.icon}
        </Button>
      ))}
    </div>
  );
}

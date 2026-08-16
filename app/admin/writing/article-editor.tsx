"use client";

import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { Markdown } from "tiptap-markdown";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { format, parseISO } from "date-fns";
import {
  CalendarBlankIcon,
  ImageIcon,
  ListBulletsIcon,
  QuotesIcon,
  TextBIcon,
  TextHThreeIcon,
  TextHTwoIcon,
  TextItalicIcon,
  TrashIcon,
  LinkIcon,
} from "@phosphor-icons/react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogFooterActions,
  DialogFooterStart,
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
import { PREVIEW_WINDOW, writePreview } from "@/lib/preview";
import { cn } from "@/lib/utils";

export type EditorInitial = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
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

const ESCAPED_FOOTNOTE = /\\\[\^([^\]\s]+)\\\]/g;

function bodyMarkdown(editor: Editor): string {
  const markdown = (
    editor.storage as unknown as { markdown: { getMarkdown: () => string } }
  ).markdown.getMarkdown();
  return markdown.replace(ESCAPED_FOOTNOTE, "[^$1]");
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

  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [date, setDate] = useState(initial?.date ?? todayIso());
  const [error, setError] = useState<string | null>(null);
  const [pendingMode, setPendingMode] = useState<"draft" | "publish" | null>(
    null,
  );
  const [previewing, setPreviewing] = useState(false);
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
      Image.configure({ inline: false, allowBase64: false }),
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
    const body = bodyMarkdown(editor);
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
          image,
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
        dismiss();
        router.refresh();
      });
    } finally {
      setPendingMode(null);
    }
  }

  async function uploadShareImage(file: File) {
    setImageUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload/image", {
        method: "POST",
        body: form,
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        setError(data.error ?? `Upload failed (${res.status})`);
        return;
      }
      setError(null);
      setImage(data.url);
    } finally {
      setImageUploading(false);
    }
  }

  const slug = title.trim()
    ? initial?.slug && initial.title.trim() === title.trim()
      ? initial.slug
      : slugify(title.trim())
    : "";

  const pushPreview = useCallback(() => {
    if (!editor) return;
    writePreview({
      slug,
      title: title.trim(),
      subtitle: subtitle.trim(),
      date,
      body: bodyMarkdown(editor),
      draft: initial?.draft ?? true,
    });
  }, [editor, slug, title, subtitle, date, initial?.draft]);

  useEffect(() => {
    if (!previewing || !editor) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(pushPreview, 400);
    };
    schedule();
    editor.on("update", schedule);
    return () => {
      editor.off("update", schedule);
      if (timer) clearTimeout(timer);
    };
  }, [previewing, editor, pushPreview]);

  function dismiss() {
    setPreviewing(false);
    onClose();
  }

  function openPreview() {
    pushPreview();
    setPreviewing(true);
    window.open("/writing/preview", PREVIEW_WINDOW);
  }

  const pending = pendingMode !== null;
  const isPublishedEdit = isEditing && initial && !initial.draft;
  const dialogTitle = isEditing
    ? initial.draft
      ? "Edit draft"
      : "Edit article"
    : "New article";

  const draftLabel = isPublishedEdit ? "Move to drafts" : "Save draft";
  const draftPending = isPublishedEdit ? "Moving…" : "Saving…";
  const publishLabel = isPublishedEdit
    ? "Save changes"
    : isEditing
      ? "Publish"
      : "Publish";
  const publishPending = isPublishedEdit ? "Saving…" : "Publishing…";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && dismiss()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-h-[calc(100dvh-var(--inset-top)-var(--inset-bottom)-2rem)] sm:w-[min(95vw,72rem)] sm:max-h-[92vh]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            Saves a <code className="font-sans text-xs">.md</code> file to{" "}
            <code className="font-sans text-xs">content/</code>. Drafts are
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
                <p className="font-sans text-xs text-zinc-500 dark:text-zinc-500">
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
                    <CalendarBlankIcon
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
                className="resize-none field-sizing-content"
              />
              <p className="font-sans text-xs text-zinc-500 dark:text-zinc-500">
                Used in metadata, RSS, and the OG image.
              </p>
            </FieldRow>

            <FieldRow>
              <Label>Share image</Label>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadShareImage(file);
                  e.target.value = "";
                }}
              />
              <SharePreview
                image={image}
                title={title.trim() || "Untitled"}
                subtitle={subtitle.trim()}
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={imageUploading}
                  onClick={() => imageInputRef.current?.click()}
                >
                  <ImageIcon weight="regular" className="size-4" />
                  {imageUploading
                    ? "Uploading…"
                    : image
                      ? "Replace"
                      : "Add photo"}
                </Button>
                {image && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={imageUploading}
                    onClick={() => setImage("")}
                  >
                    <TrashIcon weight="regular" className="size-4" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="font-sans text-xs text-zinc-500 dark:text-zinc-500">
                PNG or JPEG, 1200x630 or wider. Shown when the post is linked on
                social media; without one the card is type only. Takes effect
                once saved.
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
          <DialogFooterStart>
            <Button
              type="button"
              variant="outline"
              onClick={openPreview}
              disabled={!editor}
              title="Open this article in a new tab, exactly as the page renders it"
            >
              {previewing ? "Preview open" : "Preview"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => save("draft")}
              disabled={pending || !title.trim()}
            >
              {pendingMode === "draft" ? draftPending : draftLabel}
            </Button>
          </DialogFooterStart>
          <DialogFooterActions>
            <Button variant="outline" onClick={dismiss} disabled={pending}>
              Cancel
            </Button>
            <Button
              onClick={() => save("publish")}
              disabled={pending || !title.trim()}
            >
              {pendingMode === "publish" ? publishPending : publishLabel}
            </Button>
          </DialogFooterActions>
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
    <span className="text-destructive" aria-hidden="true">
      *
    </span>
  );
}

function SharePreview({
  image,
  title,
  subtitle,
}: {
  image: string;
  title: string;
  subtitle: string;
}) {
  const ink = image ? "#ffffff" : "#000000";

  return (
    <div
      className="w-full overflow-hidden rounded-md border border-foreground/15"
      style={{ containerType: "inline-size" }}
    >
      <div
        className="relative flex flex-col justify-between font-sans"
        style={{
          aspectRatio: "1200 / 630",
          padding: "6.67cqw",
          background: image ? "#151515" : "#fafafa",
          color: ink,
        }}
      >
        {image && (
          <img
            src={image}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        )}
        {image && (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.12) 24%, rgba(0,0,0,0) 46%)",
            }}
          />
        )}
        <Logo
          className="relative w-auto self-start"
          style={{ height: "2.33cqw" }}
        />
        {!image && (
          <div className="relative flex flex-col" style={{ gap: "1.67cqw" }}>
            <div
              className="line-clamp-3"
              style={{
                fontSize: "5cqw",
                fontWeight: 600,
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div
                className="line-clamp-2"
                style={{
                  fontSize: "2.5cqw",
                  fontStyle: "italic",
                  lineHeight: 1.25,
                  color: "rgba(0,0,0,0.56)",
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EditorToolbar({ editor }: { editor: Editor }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imageSelected, setImageSelected] = useState(false);

  useEffect(() => {
    const sync = () => setImageSelected(editor.isActive("image"));
    sync();
    editor.on("selectionUpdate", sync);
    editor.on("update", sync);
    editor.on("transaction", sync);
    return () => {
      editor.off("selectionUpdate", sync);
      editor.off("update", sync);
      editor.off("transaction", sync);
    };
  }, [editor]);

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload/image", {
        method: "POST",
        body: form,
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        window.alert(data.error ?? `Upload failed (${res.status})`);
        return;
      }
      editor
        .chain()
        .focus()
        .setImage({ src: data.url, alt: file.name.replace(/\.[^.]+$/, "") })
        .run();
    } finally {
      setUploading(false);
    }
  }

  const buttons: Array<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    run: () => void;
    tone?: "danger";
  }> = [
    {
      label: "H2",
      icon: <TextHTwoIcon weight="bold" />,
      isActive: editor.isActive("heading", { level: 2 }),
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "H3",
      icon: <TextHThreeIcon weight="bold" />,
      isActive: editor.isActive("heading", { level: 3 }),
      run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "Bold",
      icon: <TextBIcon weight="bold" />,
      isActive: editor.isActive("bold"),
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: <TextItalicIcon weight="bold" />,
      isActive: editor.isActive("italic"),
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Quote",
      icon: <QuotesIcon weight="bold" />,
      isActive: editor.isActive("blockquote"),
      run: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: "List",
      icon: <ListBulletsIcon weight="bold" />,
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
    {
      label: uploading ? "Uploading…" : "Image",
      icon: <ImageIcon weight="bold" />,
      isActive: false,
      run: () => fileInputRef.current?.click(),
    },
    ...(imageSelected
      ? [
          {
            label: "Remove image",
            icon: <TrashIcon weight="bold" />,
            isActive: false,
            run: () => editor.chain().focus().deleteSelection().run(),
            tone: "danger" as const,
          },
        ]
      : []),
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
          disabled={b.label === "Image" && uploading}
          className={cn(
            b.tone === "danger"
              ? "text-red-500 hover:bg-red-500/10 hover:text-red-500 dark:text-red-400 dark:hover:text-red-400"
              : b.isActive
                ? "bg-[#0040ff]/10 text-[#0040ff] hover:bg-[#0040ff]/15 hover:text-[#0040ff] dark:bg-[#ffff01]/10 dark:text-[#ffff01] dark:hover:bg-[#ffff01]/15 dark:hover:text-[#ffff01]"
                : "text-zinc-600 dark:text-zinc-400",
          )}
        >
          {b.icon}
        </Button>
      ))}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          await handleImageUpload(file);
        }}
      />
    </div>
  );
}

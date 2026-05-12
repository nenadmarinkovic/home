"use client";

import { useState } from "react";
import {
  ArrowRightIcon,
  Plus,
  Sparkle,
  X as XIcon,
} from "@phosphor-icons/react";

import { TagChip } from "@/components/tag-chip";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { AUX_VALUES, GENDER_VALUES, POS_VALUES } from "@/db/schema";
import type { DraftEntry, Example } from "./types";

type Props = {
  open: boolean;
  draft: DraftEntry | null;
  allTags: string[];
  onChange: (next: DraftEntry) => void;
  onClose: () => void;
  onSave: () => Promise<void> | void;
  onEnrich?: () => Promise<void> | void;
  onGenerateExamples?: () => Promise<void> | void;
  enriching?: boolean;
  generatingExamples?: boolean;
  saving?: boolean;
  error?: string | null;
};

function parseTags(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

function joinTags(list: string[]): string {
  return Array.from(
    new Set(list.map((t) => t.trim().toLowerCase()).filter(Boolean)),
  ).join(", ");
}

export function EntryEditor({
  open,
  draft,
  allTags,
  onChange,
  onClose,
  onSave,
  onEnrich,
  onGenerateExamples,
  enriching,
  generatingExamples,
  saving,
  error,
}: Props) {
  const [newTag, setNewTag] = useState("");

  if (!draft) return null;

  const selectedTags = parseTags(draft.tags);
  const selectedSet = new Set(selectedTags);
  const knownTags = Array.from(new Set([...allTags, ...selectedTags])).sort(
    (a, b) => a.localeCompare(b),
  );

  function setSelected(next: string[]) {
    onChange({ ...draft!, tags: joinTags(next) });
  }
  function toggleTag(tag: string) {
    if (selectedSet.has(tag)) {
      setSelected(selectedTags.filter((t) => t !== tag));
    } else {
      setSelected([...selectedTags, tag]);
    }
  }
  function commitNewTag() {
    const cleaned = newTag.trim().toLowerCase();
    if (!cleaned) return;
    if (!selectedSet.has(cleaned)) {
      setSelected([...selectedTags, cleaned]);
    }
    setNewTag("");
  }

  const canSave =
    !saving && draft.term.trim().length > 0 && draft.translationSr.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-h-[calc(100dvh-1.5rem)] sm:w-[min(95vw,72rem)] sm:max-h-[92vh]">
        <DialogHeader>
          <DialogTitle>
            {draft.id ? "Edit entry" : "New entry"}
          </DialogTitle>
          <DialogDescription className="flex flex-col gap-1.5">
            <span>German term plus the metadata used for the two SRS cards.</span>
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-xs font-medium uppercase tracking-wider text-zinc-500">
              <span className="inline-flex items-center gap-1">
                DE
                <ArrowRightIcon
                  weight="bold"
                  aria-hidden
                  className="size-3 text-zinc-400"
                />
                SR
              </span>
              <span aria-hidden className="text-foreground/20">
                ·
              </span>
              <span className="inline-flex items-center gap-1">
                SR
                <ArrowRightIcon
                  weight="bold"
                  aria-hidden
                  className="size-3 text-zinc-400"
                />
                DE
              </span>
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="grid grid-cols-1 gap-0 p-0 sm:p-0 lg:grid-cols-[22rem_1fr]">
          <aside className="flex flex-col gap-5 border-foreground/10 px-5 py-4 sm:px-6 sm:py-5 lg:border-r">
            <SectionLabel>Headword</SectionLabel>

            <FieldRow>
              <Label htmlFor="entry-term">
                Term <RequiredMark />
              </Label>
              <Input
                id="entry-term"
                value={draft.term}
                onChange={(e) => onChange({ ...draft, term: e.target.value })}
                placeholder="Haus"
                autoFocus={!draft.id}
                className="h-10 font-sans text-sm"
              />
            </FieldRow>

            <FieldRow>
              <Label htmlFor="entry-translation">
                Translation (Serbian) <RequiredMark />
              </Label>
              <Input
                id="entry-translation"
                value={draft.translationSr}
                onChange={(e) =>
                  onChange({ ...draft, translationSr: e.target.value })
                }
                placeholder="kuća"
                className="h-10 font-sans text-sm"
              />
            </FieldRow>

            <div className="grid grid-cols-2 gap-3">
              <FieldRow>
                <Label htmlFor="entry-pos">Part of speech</Label>
                <Select
                  value={draft.pos}
                  onValueChange={(value) => onChange({ ...draft, pos: value })}
                >
                  <SelectTrigger id="entry-pos" className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POS_VALUES.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldRow>
              <FieldRow>
                <Label htmlFor="entry-gender">Gender</Label>
                <Select
                  value={draft.gender ?? "__none"}
                  onValueChange={(value) =>
                    onChange({
                      ...draft,
                      gender: value === "__none" ? null : value,
                    })
                  }
                >
                  <SelectTrigger id="entry-gender" className="h-10">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">—</SelectItem>
                    {GENDER_VALUES.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldRow>
            </div>

            {draft.pos === "noun" && (
              <FieldRow>
                <Label htmlFor="entry-plural">Plural</Label>
                <Input
                  id="entry-plural"
                  value={draft.plural ?? ""}
                  onChange={(e) =>
                    onChange({ ...draft, plural: e.target.value || null })
                  }
                  placeholder="Häuser"
                  className="h-10 font-sans text-sm"
                />
              </FieldRow>
            )}

            {draft.pos === "verb" && (
              <div className="grid grid-cols-2 gap-3">
                <FieldRow>
                  <Label htmlFor="entry-aux">Auxiliary</Label>
                  <Select
                    value={draft.aux ?? "__none"}
                    onValueChange={(value) =>
                      onChange({
                        ...draft,
                        aux: value === "__none" ? null : value,
                      })
                    }
                  >
                    <SelectTrigger id="entry-aux" className="h-10">
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">—</SelectItem>
                      {AUX_VALUES.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldRow>
                <FieldRow>
                  <Label htmlFor="entry-separable">Separable</Label>
                  <Select
                    value={
                      draft.separable === null
                        ? "__none"
                        : draft.separable
                          ? "yes"
                          : "no"
                    }
                    onValueChange={(value) =>
                      onChange({
                        ...draft,
                        separable:
                          value === "__none"
                            ? null
                            : value === "yes"
                              ? true
                              : false,
                      })
                    }
                  >
                    <SelectTrigger id="entry-separable" className="h-10">
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">—</SelectItem>
                      <SelectItem value="yes">yes</SelectItem>
                      <SelectItem value="no">no</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldRow>
              </div>
            )}

            <FieldRow>
              <Label htmlFor="entry-notes">Notes</Label>
              <Textarea
                id="entry-notes"
                value={draft.notes}
                onChange={(e) => onChange({ ...draft, notes: e.target.value })}
                placeholder="Usage notes, false friends, register…"
                rows={3}
                className="resize-none [field-sizing:content]"
              />
            </FieldRow>
          </aside>

          <section className="flex min-h-[40dvh] flex-col gap-6 px-5 py-4 sm:px-6 sm:py-5 lg:min-h-[60vh]">
            <div className="flex min-h-0 flex-1 flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <SectionLabel>Examples</SectionLabel>
                <div className="flex items-center gap-1">
                  {onGenerateExamples && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => void onGenerateExamples()}
                      disabled={
                        generatingExamples || !draft.term.trim()
                      }
                    >
                      <Sparkle weight="bold" />
                      {generatingExamples ? "Generating…" : "Generate"}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onChange({
                        ...draft,
                        examples: [
                          ...draft.examples,
                          { de: "", sr: "" },
                        ],
                      })
                    }
                  >
                    <Plus weight="bold" />
                    Add
                  </Button>
                </div>
              </div>
              {draft.examples.length > 0 && (
                <p className="font-sans text-xs text-zinc-500">
                  Removed examples aren&apos;t soft-deleted; save the entry to
                  commit.
                </p>
              )}
              <ExamplesEditor
                examples={draft.examples}
                onChange={(examples) => onChange({ ...draft, examples })}
              />
            </div>

            <div className="flex flex-col gap-3">
              <SectionLabel>Tags</SectionLabel>
              <div className="flex flex-col gap-2">
                {knownTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {knownTags.map((tag) => (
                      <TagChip
                        key={tag}
                        active={selectedSet.has(tag)}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </TagChip>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        commitNewTag();
                      }
                    }}
                    placeholder="Add a new tag"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={commitNewTag}
                    disabled={!newTag.trim()}
                  >
                    <Plus weight="bold" />
                    Add
                  </Button>
                </div>
              </div>
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

        <DialogFooter className="justify-between sm:justify-between">
          {onEnrich ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => void onEnrich()}
              disabled={enriching || !draft.term.trim()}
            >
              <Sparkle weight="bold" />
              {enriching ? "Asking Mistral…" : "Enrich with AI"}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={() => void onSave()} disabled={!canSave}>
              {saving ? "Saving…" : draft.id ? "Save" : "Create entry"}
            </Button>
          </div>
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
    <span className="text-[#F25022]" aria-hidden="true">
      *
    </span>
  );
}

function ExamplesEditor({
  examples,
  onChange,
}: {
  examples: Example[];
  onChange: (next: Example[]) => void;
}) {
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const pending =
    pendingDelete !== null ? examples[pendingDelete] : undefined;

  function removeAt(idx: number) {
    const next = examples.slice();
    next.splice(idx, 1);
    onChange(next);
  }

  function onRemoveClick(idx: number) {
    const example = examples[idx];
    const isEmpty = !example.de.trim() && !example.sr.trim();
    if (isEmpty) {
      removeAt(idx);
      return;
    }
    setPendingDelete(idx);
  }

  return (
    <>
      <ul className="-mx-1 min-h-0 flex-1 space-y-3 overflow-y-auto px-1">
        {examples.length === 0 && (
          <li className="rounded-md border border-dashed border-foreground/15 px-3 py-6 text-center text-sm text-zinc-500">
            No examples yet — add one to give the card context.
          </li>
        )}
        {examples.map((example, idx) => (
          <li
            key={idx}
            className="group/example relative rounded-md border border-foreground/10 bg-foreground/[0.02] p-3"
          >
            <div className="flex flex-col gap-2 pr-8">
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                  Deutsch
                </Label>
                <Input
                  value={example.de}
                  placeholder="Ich gehe nach Hause."
                  onChange={(e) => {
                    const next = examples.slice();
                    next[idx] = { ...example, de: e.target.value };
                    onChange(next);
                  }}
                  className="font-sans text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                  Srpski
                </Label>
                <Input
                  value={example.sr}
                  placeholder="Idem kući."
                  onChange={(e) => {
                    const next = examples.slice();
                    next[idx] = { ...example, sr: e.target.value };
                    onChange(next);
                  }}
                  className="font-sans text-sm"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Remove example"
              onClick={() => onRemoveClick(idx)}
              className="absolute right-1.5 top-1.5 text-zinc-500 hover:text-destructive"
            >
              <XIcon weight="bold" className="size-3.5" />
            </Button>
          </li>
        ))}
      </ul>
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this example?</AlertDialogTitle>
            <AlertDialogDescription>
              The card content below will be dropped from this entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {pending && (
            <div className="flex flex-col gap-2 rounded-md border border-foreground/10 bg-foreground/[0.03] px-4 py-3">
              <p className="font-serif text-base leading-snug text-foreground">
                {pending.de || "—"}
              </p>
              <p className="font-serif text-sm leading-snug text-zinc-500">
                {pending.sr || "—"}
              </p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete !== null) removeAt(pendingDelete);
                setPendingDelete(null);
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

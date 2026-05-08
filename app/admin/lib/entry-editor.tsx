"use client";

import { Plus, Sparkle, Trash, X as XIcon } from "@phosphor-icons/react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  AUX_VALUES,
  CEFR_VALUES,
  GENDER_VALUES,
  POS_VALUES,
} from "@/db/schema";
import type { DraftEntry, Example } from "./types";

type Props = {
  open: boolean;
  draft: DraftEntry | null;
  onChange: (next: DraftEntry) => void;
  onClose: () => void;
  onSave: () => Promise<void> | void;
  onEnrich?: () => Promise<void> | void;
  enriching?: boolean;
  saving?: boolean;
  error?: string | null;
};

export function EntryEditor({
  open,
  draft,
  onChange,
  onClose,
  onSave,
  onEnrich,
  enriching,
  saving,
  error,
}: Props) {
  if (!draft) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{draft.id ? "Edit entry" : "New entry"}</DialogTitle>
          <DialogDescription>
            German term and the metadata used for SRS cards.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
            <div className="space-y-1.5">
              <Label htmlFor="entry-term">Term (German)</Label>
              <Input
                id="entry-term"
                value={draft.term}
                onChange={(e) => onChange({ ...draft, term: e.target.value })}
                placeholder="Haus"
                autoFocus={!draft.id}
              />
            </div>
            {onEnrich && (
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void onEnrich()}
                  disabled={enriching || !draft.term.trim()}
                  className="h-9"
                >
                  <Sparkle weight="bold" />
                  {enriching ? "Asking…" : "Enrich"}
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Part of speech">
              <Select
                value={draft.pos}
                options={POS_VALUES}
                onChange={(value) => onChange({ ...draft, pos: value })}
              />
            </Field>
            <Field label="Gender">
              <Select
                value={draft.gender ?? ""}
                options={GENDER_VALUES}
                placeholder="—"
                onChange={(value) =>
                  onChange({ ...draft, gender: value || null })
                }
              />
            </Field>
            <Field label="CEFR">
              <Select
                value={draft.level ?? ""}
                options={CEFR_VALUES}
                placeholder="—"
                onChange={(value) =>
                  onChange({ ...draft, level: value || null })
                }
              />
            </Field>
            {draft.pos === "noun" && (
              <Field label="Plural" className="sm:col-span-2">
                <Input
                  value={draft.plural ?? ""}
                  onChange={(e) =>
                    onChange({ ...draft, plural: e.target.value || null })
                  }
                  placeholder="Häuser"
                />
              </Field>
            )}
            {draft.pos === "verb" && (
              <>
                <Field label="Auxiliary">
                  <Select
                    value={draft.aux ?? ""}
                    options={AUX_VALUES}
                    placeholder="—"
                    onChange={(value) =>
                      onChange({ ...draft, aux: value || null })
                    }
                  />
                </Field>
                <Field label="Separable">
                  <Select
                    value={
                      draft.separable === null
                        ? ""
                        : draft.separable
                          ? "yes"
                          : "no"
                    }
                    options={["yes", "no"] as const}
                    placeholder="—"
                    onChange={(value) =>
                      onChange({
                        ...draft,
                        separable:
                          value === "" ? null : value === "yes" ? true : false,
                      })
                    }
                  />
                </Field>
              </>
            )}
          </div>

          <Field label="Translation (Serbian)">
            <Input
              value={draft.translationSr}
              onChange={(e) =>
                onChange({ ...draft, translationSr: e.target.value })
              }
              placeholder="kuća"
            />
          </Field>

          <ExamplesEditor
            examples={draft.examples}
            onChange={(examples) => onChange({ ...draft, examples })}
          />

          <Field label="Tags">
            <Input
              value={draft.tags}
              onChange={(e) => onChange({ ...draft, tags: e.target.value })}
              placeholder="family, home"
            />
          </Field>
          <Field label="Notes">
            <Textarea
              value={draft.notes}
              onChange={(e) => onChange({ ...draft, notes: e.target.value })}
              placeholder="Usage notes, false friends, register…"
              rows={3}
            />
          </Field>

          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={() => void onSave()}
            disabled={
              saving ||
              !draft.term.trim() ||
              !draft.translationSr.trim()
            }
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={"space-y-1.5 " + (className ?? "")}>
      <Label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </Label>
      {children}
    </div>
  );
}

function Select<T extends string>({
  value,
  options,
  onChange,
  placeholder,
}: {
  value: string;
  options: readonly T[];
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-md border border-foreground/10 bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function ExamplesEditor({
  examples,
  onChange,
}: {
  examples: Example[];
  onChange: (next: Example[]) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Examples
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange([...examples, { de: "", sr: "" }])}
        >
          <Plus weight="bold" />
          Add
        </Button>
      </div>
      <ul className="space-y-2">
        {examples.length === 0 && (
          <li className="rounded-md border border-dashed border-foreground/15 px-3 py-3 text-sm italic text-zinc-500">
            No examples yet.
          </li>
        )}
        {examples.map((example, idx) => (
          <li key={idx} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <Input
              value={example.de}
              placeholder="Deutsch"
              onChange={(e) => {
                const next = examples.slice();
                next[idx] = { ...example, de: e.target.value };
                onChange(next);
              }}
            />
            <Input
              value={example.sr}
              placeholder="Srpski"
              onChange={(e) => {
                const next = examples.slice();
                next[idx] = { ...example, sr: e.target.value };
                onChange(next);
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove example"
              onClick={() => {
                const next = examples.slice();
                next.splice(idx, 1);
                onChange(next);
              }}
            >
              <XIcon weight="bold" className="size-4" />
            </Button>
          </li>
        ))}
      </ul>
      <p className="text-xs text-zinc-500">
        <Trash weight="regular" className="mr-1 inline size-3 align-text-top" />
        Removed examples are not soft-deleted; save the entry to commit.
      </p>
    </div>
  );
}

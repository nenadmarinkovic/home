"use client";

import { useRef, useState } from "react";
import { CheckCircle, Sparkle, WarningCircle } from "@phosphor-icons/react";

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { DraftEntry } from "./types";

type Props = {
  open: boolean;
  onClose: () => void;
  onCompleted: () => void;
};

type RowStatus = "pending" | "enriching" | "saving" | "saved" | "error";

type Row = {
  id: number;
  term: string;
  status: RowStatus;
  message?: string;
  draft?: DraftEntry;
};

let nextRowId = 1;

export function BulkAddDialog({ open, onClose, onCompleted }: Props) {
  const [text, setText] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);
  const cancelledRef = useRef(false);

  function reset() {
    setText("");
    setRows([]);
    setRunning(false);
    cancelledRef.current = false;
  }

  async function start() {
    const terms = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .filter((line, idx, arr) => arr.indexOf(line) === idx);
    if (terms.length === 0) return;

    cancelledRef.current = false;
    const seeded: Row[] = terms.map((term) => ({
      id: nextRowId++,
      term,
      status: "pending",
    }));
    setRows(seeded);
    setRunning(true);

    let savedCount = 0;
    for (let i = 0; i < seeded.length; i++) {
      if (cancelledRef.current) break;
      const row = seeded[i];
      setRows((curr) =>
        curr.map((r) => (r.id === row.id ? { ...r, status: "enriching" } : r)),
      );

      try {
        const enrichRes = await fetch("/api/lib/enrich", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ term: row.term }),
        });
        const enrichData = (await enrichRes.json()) as {
          ok?: boolean;
          entry?: DraftEntry & { conjugations?: Record<string, unknown> };
          error?: string;
        };
        if (!enrichRes.ok || !enrichData.ok || !enrichData.entry) {
          throw new Error(
            enrichData.error ?? `Enrich failed (${enrichRes.status})`,
          );
        }
        const enriched = enrichData.entry;

        setRows((curr) =>
          curr.map((r) =>
            r.id === row.id ? { ...r, status: "saving", draft: enriched } : r,
          ),
        );

        const saveRes = await fetch("/api/lib/entries", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            term: enriched.term,
            pos: enriched.pos,
            gender: enriched.gender ?? null,
            plural: enriched.plural ?? null,
            aux: enriched.aux ?? null,
            separable: enriched.separable ?? null,
            level: enriched.level ?? null,
            translationSr: enriched.translationSr,
            examples: enriched.examples ?? [],
            conjugations: enriched.conjugations ?? {},
            notes: enriched.notes ?? "",
            tags: "",
            source: "mistral",
          }),
        });
        const saveData = (await saveRes.json()) as {
          ok?: boolean;
          error?: string;
        };
        if (!saveRes.ok || !saveData.ok) {
          throw new Error(saveData.error ?? `Save failed (${saveRes.status})`);
        }
        savedCount += 1;
        setRows((curr) =>
          curr.map((r) => (r.id === row.id ? { ...r, status: "saved" } : r)),
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setRows((curr) =>
          curr.map((r) =>
            r.id === row.id ? { ...r, status: "error", message } : r,
          ),
        );
      }
    }

    setRunning(false);
    if (savedCount > 0) onCompleted();
  }

  function cancel() {
    cancelledRef.current = true;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) return;
        if (running) {
          cancel();
          return;
        }
        reset();
        onClose();
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Bulk add</DialogTitle>
          <DialogDescription>
            One German term or phrase per line. Mistral fills in gender,
            translation, examples, and conjugations.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bulk-input">Terms</Label>
            <Textarea
              id="bulk-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"Haus\ngehen\ndoch"}
              rows={8}
              disabled={running}
              className="font-mono text-sm"
            />
          </div>

          {rows.length > 0 && (
            <ul className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-foreground/10 px-2 py-2 text-sm">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-3 px-2 py-1"
                >
                  <span className="truncate font-mono">{row.term}</span>
                  <RowStatusBadge row={row} />
                </li>
              ))}
            </ul>
          )}
        </DialogBody>
        <DialogFooter>
          {running ? (
            <Button variant="outline" onClick={cancel}>
              Stop
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                reset();
                onClose();
              }}
            >
              Close
            </Button>
          )}
          <Button
            onClick={() => void start()}
            disabled={running || text.trim().length === 0}
          >
            <Sparkle weight="bold" />
            {running ? "Enriching…" : "Enrich and save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RowStatusBadge({ row }: { row: Row }) {
  switch (row.status) {
    case "pending":
      return (
        <span className="text-xs uppercase tracking-wider text-zinc-500">
          Queued
        </span>
      );
    case "enriching":
      return (
        <span className="text-xs uppercase tracking-wider text-blue-600">
          Enriching…
        </span>
      );
    case "saving":
      return (
        <span className="text-xs uppercase tracking-wider text-blue-600">
          Saving…
        </span>
      );
    case "saved":
      return (
        <span className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-emerald-600">
          <CheckCircle weight="fill" className="size-3.5" />
          Saved
        </span>
      );
    case "error":
      return (
        <span
          className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-destructive"
          title={row.message}
        >
          <WarningCircle weight="fill" className="size-3.5" />
          Error
        </span>
      );
  }
}

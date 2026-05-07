"use client";

import { useState } from "react";
import { GitCommit } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";

type Status = "idle" | "running" | "ok" | "error";

export function ExportButton() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function run() {
    setStatus("running");
    setMessage(null);
    try {
      const res = await fetch("/api/export", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        count?: number;
        mode?: string;
        commitUrl?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setStatus("error");
        setMessage(data.error ?? `Export failed (${res.status})`);
        return;
      }
      setStatus("ok");
      const where = data.mode === "github" ? "git" : "local";
      setMessage(
        data.count === 0
          ? "Nothing to export."
          : `Snapshotted ${data.count} article${data.count === 1 ? "" : "s"} to ${where}.`,
      );
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Export failed");
    }
  }

  return (
    <div className="flex items-center gap-2">
      {message && (
        <span
          className={
            status === "error"
              ? "font-sans text-xs text-destructive"
              : "font-sans text-xs text-zinc-500 dark:text-zinc-500"
          }
        >
          {message}
        </span>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={run}
        disabled={status === "running"}
        className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
      >
        <GitCommit weight="bold" />
        {status === "running" ? "Exporting…" : "Export to git"}
      </Button>
    </div>
  );
}

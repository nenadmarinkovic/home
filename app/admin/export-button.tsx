"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { CheckCircle, GitCommit, WarningCircle } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";

type Status = "idle" | "running" | "ok" | "error";

type ExportButtonProps = {
  pendingCount: number;
};

export function ExportButton({ pendingCount }: ExportButtonProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (clearTimer.current) clearTimeout(clearTimer.current);
    },
    [],
  );

  function flashSuccess(text: string) {
    setStatus("ok");
    setMessage(text);
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => {
      setStatus("idle");
      setMessage(null);
    }, 4000);
  }

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
      const where = data.mode === "github" ? "git" : "local";
      flashSuccess(
        data.count === 0
          ? "Nothing to export — already in git."
          : `Snapshotted ${data.count} article${data.count === 1 ? "" : "s"} to ${where}.`,
      );
      startTransition(() => router.refresh());
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Export failed");
    }
  }

  const disabled = status === "running" || pendingCount === 0;
  const label =
    status === "running"
      ? "Exporting…"
      : pendingCount > 0
        ? `Export ${pendingCount} to git`
        : "Export to git";

  return (
    <div className="flex items-center gap-2">
      {message && (
        <span
          className={
            status === "error"
              ? "inline-flex items-center gap-1 font-sans text-xs text-destructive"
              : "inline-flex items-center gap-1 font-sans text-xs text-emerald-600 dark:text-emerald-500"
          }
        >
          {status === "error" ? (
            <WarningCircle weight="fill" className="size-3.5" />
          ) : (
            <CheckCircle weight="fill" className="size-3.5" />
          )}
          {message}
        </span>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={run}
        disabled={disabled}
        title={
          pendingCount === 0
            ? "All published articles are already in git."
            : undefined
        }
        className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
      >
        <GitCommit weight="bold" />
        {label}
      </Button>
    </div>
  );
}

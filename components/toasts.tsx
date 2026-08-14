"use client";

import * as React from "react";
import {
  CheckCircleIcon,
  CircleNotchIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

export type ToastStatus = "pending" | "success" | "error";

export type Toast = {
  id: string;
  title: string;
  message?: string;
  status: ToastStatus;
};

type ToastInit = {
  id?: string;
  title: string;
  message?: string;
  status?: ToastStatus;
};

type Ctx = {
  push: (init: ToastInit) => string;
  update: (id: string, patch: Partial<Omit<Toast, "id">>) => void;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<Ctx | null>(null);

export function useToasts(): Ctx {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToasts must be used inside <ToastProvider>");
  }
  return ctx;
}

const SUCCESS_TTL_MS = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const idRef = React.useRef(0);
  const timersRef = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const push = React.useCallback((init: ToastInit): string => {
    const id = init.id ?? `t${Date.now()}_${++idRef.current}`;
    setToasts((prev) => [
      ...prev,
      {
        id,
        title: init.title,
        message: init.message,
        status: init.status ?? "pending",
      },
    ]);
    return id;
  }, []);

  const update = React.useCallback(
    (id: string, patch: Partial<Omit<Toast, "id">>) => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      );
      if (patch.status === "success") {
        const existing = timersRef.current.get(id);
        if (existing) clearTimeout(existing);
        const t = setTimeout(() => dismiss(id), SUCCESS_TTL_MS);
        timersRef.current.set(id, t);
      }
    },
    [dismiss],
  );

  React.useEffect(() => {
    return () => {
      for (const t of timersRef.current.values()) clearTimeout(t);
      timersRef.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ push, update, dismiss }}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function Toaster({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[calc(var(--safe-top)+0.75rem)] z-60 flex flex-col items-center gap-2 px-3 lg:inset-x-auto lg:right-4 lg:bottom-[max(1rem,var(--safe-bottom))] lg:top-auto lg:flex-col-reverse lg:items-end lg:px-0">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-foreground/10 bg-card px-4 py-3 font-sans",
        "animate-in fade-in-0 slide-in-from-top-2 duration-200 lg:slide-in-from-bottom-2",
      )}
    >
      {toast.status === "pending" && (
        <CircleNotchIcon
          weight="regular"
          className="mt-0.5 size-4 shrink-0 animate-spin text-zinc-500"
        />
      )}
      {toast.status === "success" && (
        <CheckCircleIcon
          weight="regular"
          className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
        />
      )}
      {toast.status === "error" && (
        <WarningCircleIcon
          weight="regular"
          className="mt-0.5 size-4 shrink-0 text-destructive"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-tight tracking-tight text-foreground">
          {toast.title}
        </p>
        {toast.message && (
          <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-zinc-500 dark:text-zinc-400">
            {toast.message}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="-mr-1 -mt-1 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-foreground/6 hover:text-foreground"
      >
        <XIcon weight="bold" className="size-3.5" />
      </button>
    </div>
  );
}

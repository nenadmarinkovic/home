"use client";

import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function safeRedirectTarget(raw: string | null): string {
  if (!raw) return "/admin";
  if (raw.length > 512) return "/admin";
  if (!raw.startsWith("/")) return "/admin";
  if (raw.startsWith("//") || raw.startsWith("/\\")) return "/admin";
  if (raw.includes("\\")) return "/admin";
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data?.error ?? "Login failed");
      return;
    }
    startTransition(() => {
      const fromParam = new URLSearchParams(window.location.search).get("from");
      const from = safeRedirectTarget(fromParam);
      router.push(from);
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-sm flex-col gap-5 self-center rounded-2xl border border-foreground/10 bg-card/60 p-6 font-sans sm:p-7"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            autoFocus
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 pr-11 text-base"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-r-md text-zinc-600 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 dark:text-zinc-400"
          >
            {showPassword ? (
              <EyeSlashIcon className="size-5" />
            ) : (
              <EyeIcon className="size-5" />
            )}
          </button>
        </div>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-md bg-[#F25022]/10 px-3 py-2 text-sm text-[#F25022]"
        >
          {error}
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        disabled={Boolean(pending) || password.length === 0}
        className="h-11 w-full text-base"
      >
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { SignOut } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** When true, render as an icon-only button (for tight nav layouts). */
  iconOnly?: boolean;
};

export function NavSignOut({ className, iconOnly = false }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    startTransition(() => {
      router.push("/login");
      router.refresh();
    });
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={logout}
        disabled={pending}
        aria-label={pending ? "Signing out…" : "Sign out"}
        title="Sign out"
        className={cn(
          "inline-flex cursor-pointer items-center justify-center transition-colors hover:text-foreground disabled:opacity-50",
          className,
        )}
      >
        <SignOut weight="bold" className="size-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      className={cn(
        "cursor-pointer text-left transition-colors hover:text-foreground disabled:opacity-50",
        className,
      )}
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}

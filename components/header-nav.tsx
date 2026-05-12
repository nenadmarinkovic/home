"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

import {
  baseNavItems,
  getAuthNavItem,
  isNavActive,
} from "@/components/nav-items";
import { Button } from "@/components/ui/button";
import { useAuthed } from "@/lib/use-authed";
import { cn } from "@/lib/utils";

export function HeaderNav() {
  const pathname = usePathname();
  const router = useRouter();
  const authed = useAuthed();
  const [pending, startTransition] = useTransition();

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    startTransition(() => {
      router.push("/login");
      router.refresh();
    });
  }

  const authItem = getAuthNavItem(authed);
  const authActive = authItem ? isNavActive(pathname, authItem.href) : false;
  const navClass =
    "hidden flex-row items-center gap-5 font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 md:flex dark:text-zinc-400";
  const linkClass = "py-0.5 transition-colors hover:text-foreground";

  return (
    <nav className={navClass}>
      {baseNavItems.map((item) => {
        const active = isNavActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(linkClass, active && "text-foreground")}
          >
            {item.label}
          </Link>
        );
      })}
      {authItem && (
        <Link
          href={authItem.href}
          aria-current={authActive ? "page" : undefined}
          className={cn(linkClass, authActive && "text-foreground")}
        >
          {authItem.label}
        </Link>
      )}
      {authed && (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={logout}
          disabled={pending}
          className="h-auto rounded-none border-0 px-0 py-0.5 font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 hover:bg-transparent hover:text-foreground dark:text-zinc-400"
        >
          {pending ? "Signing out…" : "Sign out"}
        </Button>
      )}
    </nav>
  );
}

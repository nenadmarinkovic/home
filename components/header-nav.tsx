"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  baseNavItems,
  getAuthNavItem,
  isNavActive,
} from "@/components/nav-items";
import { useAuthed } from "@/lib/use-authed";
import { cn } from "@/lib/utils";

export function HeaderNav() {
  const pathname = usePathname();
  const authed = useAuthed();
  const isArticle = pathname.startsWith("/writing/");

  if (isArticle) {
    return (
      <nav className="hidden font-sans text-sm font-medium uppercase tracking-wider text-zinc-600 md:block dark:text-zinc-400">
        <Link href="/writing" className="block py-0.5 hover:text-foreground">
          ← Writing
        </Link>
      </nav>
    );
  }

  const authItem = getAuthNavItem(authed);
  const authActive = isNavActive(pathname, authItem.href);

  return (
    <nav className="hidden flex-col items-end font-sans text-sm font-medium uppercase tracking-wider text-zinc-600 md:flex dark:text-zinc-400">
      {baseNavItems.map((item) => {
        const active = isNavActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "py-0.5 hover:text-foreground",
              active && "text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
      <Link
        href={authItem.href}
        aria-current={authActive ? "page" : undefined}
        className={cn(
          "py-0.5 hover:text-foreground",
          authActive && "text-foreground",
        )}
      >
        {authItem.label}
      </Link>
    </nav>
  );
}

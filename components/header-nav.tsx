"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isNavActive, navItems } from "@/components/nav-items";
import { cn } from "@/lib/utils";

export function HeaderNav() {
  const pathname = usePathname();
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

  return (
    <nav className="hidden flex-col items-end font-sans text-sm font-medium uppercase tracking-wider text-zinc-600 md:flex dark:text-zinc-400">
      {navItems.map((item) => {
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
    </nav>
  );
}

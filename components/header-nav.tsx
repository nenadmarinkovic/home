"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  { href: "/writing", label: "Writing" },
  { href: "/projects", label: "Projects" },
  { href: "/tools", label: "Tools" },
  { href: "/infrastructure", label: "Infrastructure" },
  { href: "/login", label: "Login" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col items-end gap-0.5 font-sans text-sm font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "hover:text-foreground",
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { isNavActive, navItems } from "@/components/nav-items";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span aria-hidden="true" className="relative block h-3.5 w-4">
      <span
        className={cn(
          "absolute left-0 block h-px w-full bg-current transition-all duration-200",
          open ? "top-[6.5px] rotate-45" : "top-0",
        )}
      />
      <span
        className={cn(
          "absolute left-0 top-[6.5px] block h-px w-full bg-current transition-opacity duration-200",
          open && "opacity-0",
        )}
      />
      <span
        className={cn(
          "absolute left-0 block h-px w-full bg-current transition-all duration-200",
          open ? "top-[6.5px] -rotate-45" : "top-[13px]",
        )}
      />
    </span>
  );
}

export function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="relative z-[60] flex cursor-pointer items-center justify-center text-foreground"
      >
        <HamburgerIcon open={open} />
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full max-w-none border-0 bg-background p-0 shadow-none sm:max-w-none"
        >
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="flex h-full flex-col px-6 pt-24 pb-8">
            <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
              Navigate
            </p>
            <nav className="mt-4 flex flex-col items-start gap-4 font-sans text-3xl font-medium tracking-tight text-zinc-600 dark:text-zinc-400">
              {navItems.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "leading-none transition-colors duration-150 hover:text-foreground",
                      active && "text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto flex flex-col gap-5 border-t border-foreground/10 pt-8">
              <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                Elsewhere
              </p>
              <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                <a
                  href="https://github.com/nenadmarinkovic"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors duration-150 hover:text-foreground"
                >
                  GitHub
                </a>
                <a
                  href="https://bsky.app/profile/nenadmarinkovic.bsky.social"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors duration-150 hover:text-foreground"
                >
                  Bluesky
                </a>
                <a
                  href="mailto:nenadmarinkovic@protonmail.com"
                  className="transition-colors duration-150 hover:text-foreground"
                >
                  Email
                </a>
                <a href="/rss.xml" className="hover:text-foreground">
                  RSS
                </a>
              </nav>
              <div className="flex items-center justify-between gap-4">
                <span className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                  Theme
                </span>
                <ThemeToggle />
              </div>
              <p className="border-t border-foreground/10 pt-5 font-sans text-xs text-zinc-500 dark:text-zinc-500">
                © {new Date().getFullYear()} Nenad Marinković
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

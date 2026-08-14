"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  BookOpenIcon,
  PaperclipIcon,
  PencilSimpleLineIcon,
  PulseIcon,
} from "@phosphor-icons/react";

import {
  baseNavItems,
  getAuthNavItem,
  isNavActive,
} from "@/components/nav-items";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuthed } from "@/lib/use-authed";
import { cn } from "@/lib/utils";

const CONTACT_HREF = "/contact";

const ADMIN_TOOLS = [
  { href: "/admin/writing", name: "Writing", Icon: PencilSimpleLineIcon },
  { href: "/admin/lib", name: "Lib", Icon: BookOpenIcon },
  { href: "/admin/log", name: "Log", Icon: PulseIcon },
  { href: "/admin/links", name: "Links", Icon: PaperclipIcon },
] as const;

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span aria-hidden="true" className="relative block h-2.5 w-4.5">
      <span
        className={cn(
          "absolute left-0 block h-0.5 w-full rounded-full bg-current transition-all duration-200",
          open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0",
        )}
      />
      <span
        className={cn(
          "absolute left-0 block h-0.5 w-full rounded-full bg-current transition-all duration-200",
          open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0",
        )}
      />
    </span>
  );
}

export function MobileMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const authed = useAuthed();
  const authItem = getAuthNavItem(authed);
  const authActive = authItem ? isNavActive(pathname, authItem.href) : false;
  const contactItem = baseNavItems.find((item) => item.href === CONTACT_HREF);
  const inlineNavItems = baseNavItems.filter(
    (item) => item.href !== CONTACT_HREF,
  );
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const previous = {
      htmlOverflow: html.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
    };
    html.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    return () => {
      html.style.overflow = previous.htmlOverflow;
      body.style.position = previous.bodyPosition;
      body.style.top = previous.bodyTop;
      body.style.width = previous.bodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  const close = () => setOpen(false);

  async function logout() {
    close();
    await fetch("/api/logout", { method: "POST" });
    startTransition(() => {
      router.push("/login");
      router.refresh();
    });
  }

  const linkClass =
    "flex min-h-11 w-full cursor-pointer touch-manipulation items-center leading-none transition-colors duration-150 hover:text-foreground focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground focus-visible:rounded-sm";

  return (
    <div className="md:hidden" data-mobile-menu>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="relative z-60 -m-3 flex cursor-pointer touch-manipulation items-center justify-center p-3 text-foreground"
      >
        <HamburgerIcon open={open} />
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          ref={popupRef}
          initialFocus={popupRef}
          tabIndex={-1}
          side="right"
          showCloseButton={false}
          className="w-full max-w-none border-0 bg-background p-0 shadow-none outline-none sm:max-w-none"
        >
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="flex h-full flex-col overflow-y-auto overscroll-contain pt-[calc(var(--safe-top)+3.5rem)] pr-(--safe-x-right) pb-[max(2rem,var(--safe-bottom))] pl-(--safe-x-left)">
            <nav className="flex flex-col items-start gap-0 font-sans text-md font-normal tracking-tight text-zinc-600 dark:text-zinc-400">
              <Link
                href="/"
                onClick={close}
                aria-current={pathname === "/" ? "page" : undefined}
                className={cn(linkClass, pathname === "/" && "text-foreground")}
              >
                Home
              </Link>
              {inlineNavItems.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={cn(linkClass, active && "text-foreground")}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {authItem && (
                <div className="w-full">
                  <Link
                    href={authItem.href}
                    onClick={close}
                    aria-current={authActive ? "page" : undefined}
                    className={cn(linkClass, authActive && "text-foreground")}
                  >
                    {authItem.label}
                  </Link>
                  <div className="flex flex-col items-start gap-0 pb-1 pl-4 font-sans text-sm font-normal tracking-tight text-zinc-500 dark:text-zinc-500">
                    {ADMIN_TOOLS.map((tool) => {
                      const active = isNavActive(pathname, tool.href);
                      return (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          onClick={close}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex min-h-10 w-full cursor-pointer touch-manipulation items-center gap-2.5 leading-none transition-colors duration-150 hover:text-foreground focus:outline-none focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
                            active && "text-foreground",
                          )}
                        >
                          <tool.Icon
                            weight="regular"
                            aria-hidden
                            className="size-4 shrink-0"
                          />
                          {tool.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </nav>

            <div className="mt-auto flex flex-col gap-8 pt-8">
              <div className="flex flex-col gap-3">
                <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Elsewhere
                </p>
                <nav className="flex flex-wrap items-center gap-x-5 gap-y-1 font-sans text-sm text-zinc-600 dark:text-zinc-400">
                  <a
                    href="https://github.com/nenadmarinkovic"
                    target="_blank"
                    rel="noreferrer"
                    className="py-1 transition-colors duration-150 hover:text-foreground"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://bsky.app/profile/nenadmarinkovic.com"
                    target="_blank"
                    rel="noreferrer"
                    className="py-1 transition-colors duration-150 hover:text-foreground"
                  >
                    Bluesky
                  </a>
                  <a
                    href="mailto:nenadmarinkovic@protonmail.com"
                    className="py-1 transition-colors duration-150 hover:text-foreground"
                  >
                    Email
                  </a>
                  <a
                    href="/rss.xml"
                    className="py-1 transition-colors duration-150 hover:text-foreground"
                  >
                    RSS
                  </a>
                </nav>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Theme
                </span>
                <ThemeToggle />
              </div>
              <div className="flex flex-col gap-2">
                {contactItem && (
                  <Link
                    href={contactItem.href}
                    onClick={close}
                    aria-current={
                      isNavActive(pathname, contactItem.href)
                        ? "page"
                        : undefined
                    }
                    className="flex h-9 w-full cursor-pointer touch-manipulation items-center justify-center rounded-md bg-foreground font-sans text-xs font-medium uppercase tracking-[0.06em] text-background transition-opacity duration-150 hover:opacity-90 active:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                  >
                    {contactItem.label}
                  </Link>
                )}
                {!authed && (
                  <Link
                    href="/login"
                    onClick={close}
                    className="flex h-9 w-full cursor-pointer touch-manipulation items-center justify-center rounded-md border border-foreground/20 font-sans text-xs font-medium uppercase tracking-[0.06em] text-foreground transition-colors duration-150 hover:border-foreground/40 active:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                  >
                    Log in
                  </Link>
                )}
                {authed && (
                  <button
                    type="button"
                    onClick={logout}
                    disabled={pending}
                    className="flex h-9 w-full cursor-pointer touch-manipulation items-center justify-center rounded-md border border-foreground/20 font-sans text-xs font-medium uppercase tracking-[0.06em] text-foreground transition-colors duration-150 hover:border-foreground/40 active:bg-foreground/5 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                  >
                    {pending ? "Logging out…" : "Log out"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

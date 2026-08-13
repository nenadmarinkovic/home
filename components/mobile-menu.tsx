"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  baseNavItems,
  getAuthNavItem,
  isNavActive,
} from "@/components/nav-items";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuthed } from "@/lib/use-authed";
import { cn } from "@/lib/utils";

const ADMIN_TOOLS = [
  { href: "/admin/writing", name: "Writing" },
  { href: "/admin/lib", name: "Lib" },
  { href: "/admin/log", name: "Log" },
  { href: "/admin/links", name: "Links" },
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
              {baseNavItems.map((item) => {
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
                <Accordion
                  type="single"
                  collapsible
                  defaultValue={authActive ? "admin" : undefined}
                  className="w-full"
                >
                  <AccordionItem value="admin" className="border-b-0">
                    <AccordionHeader className="justify-between">
                      <Link
                        href={authItem.href}
                        onClick={close}
                        aria-current={authActive ? "page" : undefined}
                        className={cn(
                          linkClass,
                          "min-w-0 flex-1",
                          authActive && "text-foreground",
                        )}
                      >
                        {authItem.label}
                      </Link>
                      <AccordionTrigger
                        aria-label="Show admin tools"
                        className="min-h-11 flex-none justify-center px-2 py-0"
                      />
                    </AccordionHeader>
                    <AccordionContent className="pb-0 pl-4 pr-0 pt-0">
                      <div className="flex flex-col items-start gap-0 font-sans text-md font-normal tracking-tight text-zinc-500 dark:text-zinc-500">
                        {ADMIN_TOOLS.map((tool) => {
                          const active = isNavActive(pathname, tool.href);
                          return (
                            <Link
                              key={tool.href}
                              href={tool.href}
                              onClick={close}
                              aria-current={active ? "page" : undefined}
                              className={cn(
                                linkClass,
                                active && "text-foreground",
                              )}
                            >
                              {tool.name}
                            </Link>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </nav>

            {authed && (
              <button
                type="button"
                onClick={logout}
                disabled={pending}
                className={cn(
                  linkClass,
                  "font-sans text-md font-normal tracking-tight text-zinc-600 disabled:opacity-50 dark:text-zinc-400",
                )}
              >
                {pending ? "Signing out…" : "Sign out"}
              </button>
            )}

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
              <p className="font-sans text-xs text-zinc-600 dark:text-zinc-400">
                © {new Date().getFullYear()} Nenad Marinković
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

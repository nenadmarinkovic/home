"use client";

import { usePathname } from "next/navigation";

const DEFAULT_BIO =
  "Long-form notes on software, design, and how the work actually gets done.";

const bios: Record<string, string> = {
  "/": "Hi, I’m Nenad — software developer in Vienna. I build for the web and write about it here.",
  "/contact": "I prefer email. Slow to reply, but I always do.",
  "/links": "A handful of sites — friends, tools, and quiet corners of the web.",
  "/tools": "Software I use every day, and a few I built myself.",
  "/infrastructure": "How this site is hosted, built, and put together.",
};

function getBio(pathname: string): string {
  return bios[pathname] ?? DEFAULT_BIO;
}

export function HeaderBio() {
  const pathname = usePathname();
  const bio = getBio(pathname);

  return (
    <p className="max-w-xs font-serif text-base italic leading-snug text-zinc-600 dark:text-zinc-400">
      {bio}
    </p>
  );
}

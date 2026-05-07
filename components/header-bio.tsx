"use client";

import { usePathname } from "next/navigation";

const bios: Record<string, string> = {
  "/": "Hi, I’m Nenad — software developer in Vienna. I build for the web and write about it here.",
  "/writing": "Long-form notes on software, design, and how the work actually gets done.",
  "/contact": "I prefer email. Slow to reply, but I always do.",
  "/projects": "An incomplete log of things I’ve built and shipped over the years.",
  "/tools": "Software I use every day, and a few I built myself.",
  "/infrastructure": "How this site is hosted, built, and put together.",
  "/login": "Sign in to your account to continue.",
  "/admin": "Everything written, drafted, and published.",
};

function getBio(pathname: string): string | null {
  if (pathname.startsWith("/writing/")) return null;
  return bios[pathname] ?? null;
}

export function HeaderBio() {
  const pathname = usePathname();
  const bio = getBio(pathname);
  if (!bio) return null;

  return (
    <p className="max-w-xs font-serif text-sm italic leading-snug text-zinc-600 dark:text-zinc-400">
      {bio}
    </p>
  );
}

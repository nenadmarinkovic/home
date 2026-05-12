import { ThemeToggle } from "@/components/theme-toggle";

export function SiteFooter() {
  return (
    <footer className="flex flex-col items-start gap-6 pt-8 pb-8 font-sans text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between dark:text-zinc-400">
      <p>© {new Date().getFullYear()} Nenad Marinković</p>
      <nav className="hidden flex-wrap items-center gap-x-4 gap-y-2 text-xs uppercase tracking-wider sm:flex">
        <a
          href="https://github.com/nenadmarinkovic"
          target="_blank"
          rel="noreferrer"
          className="py-1.5 hover:text-foreground"
        >
          GitHub
        </a>
        <a
          href="https://bsky.app/profile/nenadmarinkovic.com"
          target="_blank"
          rel="noreferrer"
          className="py-1.5 hover:text-foreground"
        >
          Bluesky
        </a>
        <a
          href="mailto:nenadmarinkovic@protonmail.com"
          className="py-1.5 hover:text-foreground"
        >
          Email
        </a>
        <a href="/rss.xml" className="py-1.5 hover:text-foreground">
          RSS
        </a>
      </nav>
      <div className="hidden sm:block">
        <ThemeToggle />
      </div>
    </footer>
  );
}

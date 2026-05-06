import { ThemeToggle } from "@/components/theme-toggle";

export function SiteFooter() {
  return (
    <footer className="flex items-end justify-between gap-6 pt-8 pb-4 font-sans text-sm text-zinc-600 dark:text-zinc-400">
      <p>© {new Date().getFullYear()} Nenad Marinković</p>
      <nav className="flex items-center gap-4 text-xs uppercase tracking-wider">
        <a
          href="https://github.com/nenadmarinkovic"
          target="_blank"
          rel="noreferrer"
          className="hover:text-foreground"
        >
          GitHub
        </a>
        <a
          href="mailto:nenadmarinkovic@protonmail.com"
          className="hover:text-foreground"
        >
          Email
        </a>
        <a href="/rss.xml" className="hover:text-foreground">
          RSS
        </a>
      </nav>
      <ThemeToggle />
    </footer>
  );
}

import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="flex items-start justify-between pt-16">
      <div className="flex flex-col items-start gap-2">
        <Link href="/" className="flex items-center gap-2">
          <div
            aria-label="Logo"
            className="size-3.5 rounded-full bg-[#FD6401]"
          />
          <span className="font-serif text-base italic leading-snug text-foreground">
            Nenad Marinković
          </span>
        </Link>
        <p className="max-w-xs font-serif text-sm italic leading-snug text-zinc-600 dark:text-zinc-400">
          Hi, I’m Nenad — a software developer building thoughtful tools and
          writing about the craft.
        </p>
      </div>
      <nav className="flex flex-col items-end gap-0.5 font-sans text-sm font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
        <Link href="/platform" className="hover:text-foreground">
          Platform
        </Link>
        <Link href="/structure" className="hover:text-foreground">
          Structure
        </Link>
        <Link href="/register" className="hover:text-foreground">
          Register
        </Link>
        <Link href="/faq" className="hover:text-foreground">
          FAQ
        </Link>
        <Link href="/login" className="hover:text-foreground">
          Login
        </Link>
      </nav>
    </header>
  );
}

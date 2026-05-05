import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-start bg-background">
      <div className="flex w-full max-w-3xl flex-1 flex-col bg-background">
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
        <main className="flex flex-1 flex-col items-start gap-12 py-20">
          <hgroup className="max-w-prose self-center space-y-3 text-center">
            <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
              October 20, 2025
            </p>
            <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-pretty">
              Beyond the Machine
            </h1>
            <p className="font-serif text-2xl italic leading-snug text-zinc-600 dark:text-zinc-400">
              Creative agency in the AI landscape.
            </p>
          </hgroup>
          <div className="max-w-prose self-center space-y-3 text-center font-serif italic leading-snug text-pretty text-zinc-600 dark:text-zinc-400">
            <p>
              This talk was given on October 14, 2025 at Kinference in Brooklyn,
              New York.
            </p>
            <p>
              Spoiler alert: the last part of the talk covers plot points of the
              movie Spirited Away. Another warning is included right before the
              spoilers with a jump forward link to the spoiler-free conclusion.
            </p>
          </div>

          <article className="max-w-2xl self-center space-y-8 font-serif text-(length:--unit-lg) leading-[1.5] text-pretty oldstyle-nums">
            <p>
              I am so tired of hearing about AI. Unfortunately, this is a talk
              about AI.
            </p>
            <p>
              I’m trying to figure out how to use generative AI as a designer
              without feeling like shit. I am fascinated with what it can do,
              impressed and repulsed by what it makes, and distrustful of its
              owners. I am deeply ambivalent about it all. The believers demand
              devotion, the critics demand abstinence, and to see AI as just
              another technology is to be a heretic twice over.
            </p>
            <p>
              Today, I’d like to try to open things up a bit. I want to frame
              the technology more like an instrument, and get away from GenAI as
              an intelligence, an ideology, a tool, a crutch, or a weapon. I
              find the instrument framing more appealing as a person who has
              spent decades honing a set of skills. I want a way of working that
              relies on my capabilities and discernment rather than something so
              amorphous and transient as taste. (If taste exists in technology,
              it needs to be smuggled in.)
            </p>
            <p>
              I’m trying to figure out how to use generative AI as a designer
              without feeling like shit. I am fascinated with what it can do,
              impressed and repulsed by what it makes, and distrustful of its
              owners. I am deeply ambivalent about it all. The believers demand
              devotion, the critics demand abstinence, and to see AI as just
              another technology is to be a heretic twice over.
            </p>
            <p>
              Today, I’d like to try to open things up a bit. I want to frame
              the technology more like an instrument, and get away from GenAI as
              an intelligence, an ideology, a tool, a crutch, or a weapon. I
              find the instrument framing more appealing as a person who has
              spent decades honing a set of skills. I want a way of working that
              relies on my capabilities and discernment rather than something so
              amorphous and transient as taste. (If taste exists in technology,
              it needs to be smuggled in.)
            </p>
            <p>
              I’m trying to figure out how to use generative AI as a designer
              without feeling like shit. I am fascinated with what it can do,
              impressed and repulsed by what it makes, and distrustful of its
              owners. I am deeply ambivalent about it all. The believers demand
              devotion, the critics demand abstinence, and to see AI as just
              another technology is to be a heretic twice over.
            </p>
            <p>
              Today, I’d like to try to open things up a bit. I want to frame
              the technology more like an instrument, and get away from GenAI as
              an intelligence, an ideology, a tool, a crutch, or a weapon. I
              find the instrument framing more appealing as a person who has
              spent decades honing a set of skills. I want a way of working that
              relies on my capabilities and discernment rather than something so
              amorphous and transient as taste. (If taste exists in technology,
              it needs to be smuggled in.)
            </p>
          </article>
        </main>
        <footer className="flex items-end justify-between gap-6 pt-8 pb-4 font-sans text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex flex-col gap-1">
            <p>© {new Date().getFullYear()} Nenad Marinković</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              Made with care in Vienna. Built with Next.js & Tailwind.
            </p>
          </div>
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
      </div>
    </div>
  );
}

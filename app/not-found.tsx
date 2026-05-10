import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-start gap-12 py-20">
      <hgroup className="max-w-prose self-center space-y-3 text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          404
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-pretty">
          Page not found.
        </h1>
        <p className="font-serif text-2xl italic leading-snug text-zinc-600 dark:text-zinc-400">
          The page you’re looking for isn’t here.
        </p>
      </hgroup>
      <p className="self-center font-sans text-sm font-medium uppercase tracking-wider">
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 text-zinc-600 transition-opacity hover:opacity-70 dark:text-zinc-400"
        >
          <ArrowLeft
            weight="bold"
            className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          Home
        </Link>
      </p>
    </main>
  );
}

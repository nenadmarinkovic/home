import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-start gap-12 pb-20 pt-12 md:pt-20">
      <hgroup className="max-w-[46ch] self-center space-y-4 text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.06em] text-zinc-600 dark:text-zinc-400">
          404
        </p>
        <h1 className="text-3xl font-normal text-balance text-foreground sm:text-4xl">
          Page not found.
        </h1>
        <p className="text-base font-light italic leading-[1.5] text-balance text-zinc-600 dark:text-zinc-400">
          The page you&rsquo;re looking for isn&rsquo;t here.
        </p>
      </hgroup>
      <p className="self-center text-xs font-medium uppercase tracking-[0.06em]">
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

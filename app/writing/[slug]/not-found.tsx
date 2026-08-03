import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";

export default function ArticleNotFound() {
  return (
    <main className="flex flex-1 flex-col items-start gap-12 pb-20 pt-12 md:pt-20">
      <hgroup className="max-w-prose self-center text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.08em] text-foreground/50">
          404
        </p>
        <h1 className="mt-2 text-3xl font-normal tracking-tight text-balance text-foreground sm:text-4xl">
          Article not found.
        </h1>
        <p className="mt-4 text-base italic leading-normal text-balance text-foreground/70">
          That essay isn’t here — it may have moved or never existed.
        </p>
      </hgroup>
      <p className="self-center text-xs font-medium uppercase tracking-[0.06em]">
        <Link
          href="/writing"
          className="group inline-flex items-center gap-1.5 text-zinc-600 transition-opacity hover:opacity-70 dark:text-zinc-400"
        >
          <ArrowLeftIcon
            weight="bold"
            className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          All writing
        </Link>
      </p>
    </main>
  );
}

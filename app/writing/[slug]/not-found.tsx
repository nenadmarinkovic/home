import Link from "next/link";

export default function ArticleNotFound() {
  return (
    <main className="flex flex-1 flex-col items-start gap-12 py-20">
      <hgroup className="max-w-prose self-center space-y-3 text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          404
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-pretty">
          Article not found.
        </h1>
        <p className="font-serif text-2xl italic leading-snug text-zinc-600 dark:text-zinc-400">
          That essay isn’t here — it may have moved or never existed.
        </p>
      </hgroup>
      <p className="self-center font-sans text-sm font-medium uppercase tracking-wider">
        <Link
          href="/writing"
          className="text-zinc-600 transition-opacity hover:opacity-70 dark:text-zinc-400"
        >
          ← All writing
        </Link>
      </p>
    </main>
  );
}

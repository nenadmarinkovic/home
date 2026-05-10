import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Links · Admin",
  robots: { index: false, follow: false },
};

export default function AdminLinksPage() {
  return (
    <main className="flex flex-1 flex-col items-start gap-12 py-20">
      <hgroup className="max-w-prose self-center space-y-3 text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-500">
          Admin · Links
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-pretty">
          Saved reading.
        </h1>
        <p className="font-serif text-2xl italic leading-snug text-zinc-600 dark:text-zinc-400">
          A quiet shelf for things worth keeping.
        </p>
      </hgroup>

      <p className="self-center font-sans text-xs font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-500">
        Coming soon
      </p>
    </main>
  );
}

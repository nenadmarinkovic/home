import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "An incomplete log of things I've built and shipped over the years.",
};

export default function ProjectsPage() {
  return (
    <main className="flex flex-1 flex-col items-start gap-12 py-20">
      <hgroup className="max-w-prose self-center space-y-3 text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Projects
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-pretty">
          Things I’ve made.
        </h1>
        <p className="font-serif text-2xl italic leading-snug text-zinc-600 dark:text-zinc-400">
          An incomplete log of things I’ve built and shipped over the years.
        </p>
      </hgroup>
    </main>
  );
}

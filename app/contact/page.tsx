import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Nenad Marinković.",
};

const links = [
  {
    label: "Email",
    value: "nenadmarinkovic@protonmail.com",
    href: "mailto:nenadmarinkovic@protonmail.com",
  },
  {
    label: "GitHub",
    value: "github.com/nenadmarinkovic",
    href: "https://github.com/nenadmarinkovic",
  },
  {
    label: "RSS",
    value: "/rss.xml",
    href: "/rss.xml",
  },
];

export default function ContactPage() {
  return (
    <main className="flex flex-1 flex-col items-start gap-12 pb-20 pt-12 md:pt-20">
      <hgroup className="max-w-prose self-center space-y-3 text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Contact
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-pretty">
          Get in touch.
        </h1>
        <p className="font-serif text-2xl italic leading-snug text-zinc-600 dark:text-zinc-400">
          Email is best. I read everything.
        </p>
      </hgroup>
      <dl className="divide-y divide-foreground/10">
        {links.map((l) => (
          <div
            key={l.label}
            className="flex items-baseline gap-6 py-5 first:pt-0 last:pb-0"
          >
            <dt className="w-24 shrink-0 font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              {l.label}
            </dt>
            <dd className="font-serif text-(length:--unit-lg) leading-[1.5] text-pretty">
              <a
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                className="transition-opacity hover:opacity-70"
              >
                {l.value}
              </a>
            </dd>
          </div>
        ))}
      </dl>
    </main>
  );
}

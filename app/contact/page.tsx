import type { Metadata } from "next";

import { ContactForm } from "@/components/contact-form";
import { ContactQR } from "@/components/contact-qr";

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
    label: "Bluesky",
    value: "@nenadmarinkovic.com",
    href: "https://bsky.app/profile/nenadmarinkovic.com",
  },
  {
    label: "RSS",
    value: "/rss.xml",
    href: "/rss.xml",
  },
];

export default function ContactPage() {
  return (
    <main className="flex flex-1 flex-col items-start gap-14 pb-20 pt-12 md:pt-20">
      <hgroup className="max-w-prose self-center space-y-3 text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Contact
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-pretty">
          Get in touch
        </h1>
        <p className="font-serif text-2xl italic leading-snug text-zinc-600 dark:text-zinc-400">
          Ideas, collaborations, or a hello.
        </p>
      </hgroup>
      <section className="grid w-full gap-10 md:grid-cols-[auto_minmax(0,1fr)] md:items-start md:gap-14">
        <aside className="flex flex-col items-center gap-6 md:items-start">
          <ContactQR />
          <dl className="flex w-full flex-col items-center gap-4 text-center md:items-start md:text-left">
            {links.map((l) => (
              <div key={l.label} className="flex flex-col gap-1">
                <dt className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  {l.label}
                </dt>
                <dd className="font-serif text-sm leading-[1.3] text-pretty break-words">
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
        </aside>
        <div className="flex flex-col gap-6">
          <p className="font-serif text-md leading-relaxed text-pretty text-zinc-600 dark:text-zinc-400">
            Feel free to get in touch. I would love to hear from you and
            discuss any inquiries, collaborations, or opportunities.
          </p>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}

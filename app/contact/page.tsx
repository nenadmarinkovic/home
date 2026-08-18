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
    value: "nenadmarinkovic.com/rss.xml",
    href: "/rss.xml",
  },
];

export default function ContactPage() {
  return (
    <main className="flex flex-1 flex-col items-start gap-14 pb-20 pt-12 md:pt-20">
      <hgroup className="max-w-prose self-center text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.08em] text-foreground/70">
          Contact
        </p>
        <h1 className="mt-2 text-3xl font-normal tracking-tight text-balance text-foreground sm:text-4xl">
          Get in touch
        </h1>
        <p className="mt-4 text-base italic leading-normal text-balance text-foreground/70">
          Feel free to get in touch with me.
          <br />I will probably respond in less than 48h.
        </p>
      </hgroup>
      <section className="grid w-full gap-10 md:grid-cols-[auto_minmax(0,1fr)] md:items-start md:gap-14">
        <aside className="flex flex-col items-center gap-6 md:items-start">
          <ContactQR />
          <dl className="flex w-full flex-col items-center gap-4 text-center md:items-start md:text-left">
            {links.map((l) => (
              <div key={l.label} className="flex flex-col gap-1">
                <dt className="font-sans text-xs font-medium uppercase tracking-[0.06em] text-zinc-600 dark:text-zinc-400">
                  {l.label}
                </dt>
                <dd className="font-sans text-sm leading-[1.35] text-pretty wrap-break-word">
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
        <div className="flex flex-col gap-4">
          <ContactForm />
        </div>
      </section>
    </main>
  );
}

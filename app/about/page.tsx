import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import portrait from "@/public/images/photo.webp";

export const metadata: Metadata = {
  title: "About",
  description:
    "Nenad Marinković, a Vienna-based software developer building fast, well-crafted websites and web products.",
};

const facts = [
  { label: "Location", value: "Vienna, Austria" },
  { label: "Experience", value: "Since 2017" },
  { label: "Core stack", value: "TypeScript, React, Next.js, Node.js" },
];

const testimonials = {
  hakon: {
    quote:
      "It is a true pleasure working with Nenad. He successfully implemented our new branding and web design into our new and lightning-fast website. Nenad is thorough, highly skilled, communicative and a pleasure to work with!",
    name: "Håkon Kalbakk",
    role: "Founder of",
    company: "Modulize",
    href: "https://www.modulize.com/",
  },
  toni: {
    quote:
      "Nenad is a world class developer. Amazing communicator, very thorough in his work, and his code is outstanding.",
    name: "Toni Gemayel",
    role: "Founder of",
    company: "Wager API",
    href: "https://www.wagerapi.com/",
  },
};

const linkClass =
  "font-semibold text-[#0040ff] transition-opacity hover:opacity-70 dark:text-[#ffff01]";
const paragraphClass =
  "text-base leading-[1.55] text-pretty text-foreground/70";
const labelClass =
  "font-sans text-xs font-medium uppercase tracking-[0.06em] text-zinc-600 dark:text-zinc-400";

function External({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={linkClass}>
      {children}
    </a>
  );
}

function Testimonial({ t }: { t: (typeof testimonials)["hakon"] }) {
  return (
    <figure className="relative pl-10 sm:pl-12">
      <span
        aria-hidden
        className="absolute -top-2 left-0 font-serif text-6xl leading-none text-[#0040ff] dark:text-[#ffff01]"
      >
        &ldquo;
      </span>
      <blockquote className="text-base leading-[1.55] text-pretty text-foreground sm:text-[19px]">
        {t.quote}
      </blockquote>
      <figcaption className="mt-4 flex flex-col gap-1">
        <span className="text-sm font-medium text-foreground">{t.name}</span>
        <span className="font-sans text-[11px] font-medium uppercase tracking-[0.06em] text-zinc-600 dark:text-zinc-400">
          {t.role} <External href={t.href}>{t.company}</External>
        </span>
      </figcaption>
    </figure>
  );
}

export default function AboutPage() {
  return (
    <main className="flex flex-1 flex-col items-start gap-14 pb-20 pt-12 md:pt-20">
      <hgroup className="max-w-prose self-center text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.08em] text-foreground/70">
          About
        </p>
        <h1 className="mt-2 text-3xl font-normal tracking-tight text-balance text-foreground sm:text-4xl">
          A bit about me
        </h1>
        <p className="mt-4 text-base italic leading-normal text-balance text-foreground/70">
          I build fast, well-crafted websites and web products, from the
          interface down to the server.
        </p>
      </hgroup>
      <section className="flow-root w-full space-y-4">
        <aside className="mb-12 flex flex-col items-center gap-6 text-center sm:flex-row sm:gap-8 sm:text-left md:float-right md:mb-6 md:ml-12 md:mt-1 md:flex-col md:items-start md:gap-6">
          <Image
            src={portrait}
            alt="Nenad Marinković"
            sizes="(min-width: 768px) 176px, 144px"
            placeholder="blur"
            loading="eager"
            className="size-32 shrink-0 rounded-full object-cover sm:size-36 md:size-44"
          />
          <dl className="grid w-full gap-4 sm:grid-cols-2 sm:gap-x-8 md:grid-cols-1">
            {facts.map((f) => (
              <div
                key={f.label}
                className="flex flex-col gap-1 last:sm:col-span-2 last:md:col-span-1"
              >
                <dt className={labelClass}>{f.label}</dt>
                <dd className="font-sans text-sm leading-[1.35] text-pretty">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        </aside>
        <p className={paragraphClass}>
          Since 2017, I&rsquo;ve worked with a wide range of clients, from
          creative agencies to tech startups and large companies, building
          well-designed, fast, and user-friendly websites and applications.
        </p>
        <p className={paragraphClass}>
          My career began with an internship at{" "}
          <External href="https://www.vegaitglobal.com/">Vega IT</External> in
          Novi Sad, Serbia. From there I moved to the web agency{" "}
          <External href="https://www.popwebdesign.net/">
            PopArt Studio
          </External>
          , where I built custom websites and learned the craft by working
          closely with project managers and designers.
        </p>
        <p className={paragraphClass}>
          After moving to Vienna, I worked with companies such as{" "}
          <External href="https://www.dccs.at/">DCCS</External>, where our team
          built the Techem Kundenportal, a large Vue.js and Java application for
          energy consumption billing. Later, as a front-end developer at{" "}
          <External href="https://www.nexxar.com/">nexxar</External>, I created
          digital annual reports for international clients such as Johnson &amp;
          Johnson, Volkswagen, and OMV.
        </p>
        <p className={paragraphClass}>
          Alongside full-time roles, I&rsquo;ve freelanced for startups and
          clients around the world, mostly with React and Next.js.
        </p>
        <div className="py-6">
          <Testimonial t={testimonials.hakon} />
        </div>
        <p className={paragraphClass}>
          These days my work reaches well past the interface. I run my own
          server in the EU and build things from the database up. Right now
          I&rsquo;m developing a German-learning platform and laying the
          groundwork for my first software studio. I also love experimenting and
          playing with code, usually on small side projects for learning and
          fun.
        </p>
        <div className="py-6">
          <Testimonial t={testimonials.toni} />
        </div>
        <p className={paragraphClass}>
          When I&rsquo;m not coding, I love spending time with my wife and our
          daughter, playing together or taking long walks on the Donauinsel.
          Otherwise, I split my time between the gym, nonfiction books, and the
          endless challenge of memorizing German noun articles.
        </p>
        <h2 className="mt-6 text-xl font-medium text-foreground sm:text-2xl">
          About this website
        </h2>
        <p className={paragraphClass}>
          This site is built with Next.js and runs on my own Hetzner VPS. Behind the
          public pages sit a few small tools I use every day. The code is open
          source on{" "}
          <External href="https://github.com/nenadmarinkovic/home">
            GitHub
          </External>
          .
        </p>
        <p className={paragraphClass}>
          If you&rsquo;d like to work together or just say hi, the{" "}
          <Link href="/contact" className={linkClass}>
            contact
          </Link>{" "}
          page is the best place to start.
        </p>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { site } from "@/lib/site";
import { articles, getAdjacent, getArticle } from "../articles";

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const isExternal = /^https?:\/\//.test(match[2]);
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
      >
        {match[1]}
      </a>,
    );
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const url = `${site.url}/writing/${article.slug}`;
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
      url,
      publishedTime: article.date,
      authors: [site.author.name],
    },
    twitter: {
      title: article.title,
      description: article.description,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const { prev, next } = getAdjacent(slug);

  const articleUrl = `${site.url}/writing/${article.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.date,
    url: articleUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    author: {
      "@type": "Person",
      name: site.author.name,
      url: site.url,
    },
    publisher: {
      "@type": "Person",
      name: site.author.name,
      url: site.url,
    },
    image: `${articleUrl}/opengraph-image`,
  };

  return (
    <main className="flex flex-1 flex-col items-start gap-12 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <hgroup className="max-w-prose self-center space-y-3 text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          {article.dateLabel}
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-pretty">
          {article.title}
        </h1>
        <p className="font-serif text-2xl italic leading-snug text-zinc-600 dark:text-zinc-400">
          {article.subtitle}
        </p>
      </hgroup>
      {article.note && (
        <div className="max-w-prose self-center space-y-3 text-center font-serif italic leading-snug text-pretty text-zinc-600 dark:text-zinc-400">
          {article.note.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
      <article className="space-y-8 font-serif text-(length:--unit-lg) leading-[1.5] text-pretty oldstyle-nums">
        {article.body.map((block, i) => {
          if (typeof block === "string") {
            return <p key={i}>{renderInline(block)}</p>;
          }
          if (block.type === "quote") {
            return (
              <blockquote key={i}>
                {block.lines.map((line, j) => (
                  <p key={j}>{renderInline(line)}</p>
                ))}
              </blockquote>
            );
          }
          if (block.type === "pull") {
            return (
              <p key={i} className="pull-quote">
                {renderInline(block.text)}
              </p>
            );
          }
          return null;
        })}
      </article>
      {(prev || next) && (
        <nav
          aria-label="More writing"
          className="grid w-full grid-cols-2 gap-8 border-t border-foreground/10 pt-8 font-sans text-sm"
        >
          <div className="flex flex-col gap-1">
            {prev && (
              <Link
                href={`/writing/${prev.slug}`}
                className="group flex flex-col gap-1"
              >
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  ← Older
                </span>
                <span className="font-serif text-base font-semibold leading-tight text-pretty text-foreground transition-opacity group-hover:opacity-70">
                  {prev.title}
                </span>
              </Link>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            {next && (
              <Link
                href={`/writing/${next.slug}`}
                className="group flex flex-col items-end gap-1"
              >
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Newer →
                </span>
                <span className="font-serif text-base font-semibold leading-tight text-pretty text-foreground transition-opacity group-hover:opacity-70">
                  {next.title}
                </span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </main>
  );
}

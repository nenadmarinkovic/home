import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";

import { AdminActions } from "@/components/admin-actions";
import { renderMarkdown } from "@/lib/markdown";
import { site } from "@/lib/site";
import { getAdjacent, getArticle } from "../articles";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
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
  const article = await getArticle(slug);
  if (!article) notFound();

  const { prev, next } = await getAdjacent(slug);

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
    <main className="flex flex-1 flex-col items-start gap-12 pb-20 pt-12 md:pt-20">
      <script
        type="application/ld+json"
        // Escape `<` so a title/description containing `</script>` can't break
        // out of the JSON-LD block. JSON.stringify alone doesn't do this.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="relative w-full max-w-prose self-center">
        <hgroup className="space-y-3 text-center">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.06em] text-[#ff000e] dark:text-[#ffff01]">
            {article.dateLabel}
          </p>
          <h1 className="text-3xl font-normal text-balance text-foreground sm:text-4xl">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="text-base leading-[1.55] text-balance text-foreground/70">
              {article.subtitle}
            </p>
          )}
        </hgroup>
        <div className="absolute right-0 top-0">
          <AdminActions article={article} />
        </div>
      </div>
      <article
        className="space-y-6 text-base leading-[1.5] text-pretty text-foreground/70 oldstyle-nums"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(article.body) }}
      />
      {(prev || next) && (
        <nav
          aria-label="More writing"
          className="grid w-full grid-cols-2 gap-8 pt-8 font-sans text-sm"
        >
          <div className="flex flex-col gap-1">
            {prev && (
              <Link
                href={`/writing/${prev.slug}`}
                className="group flex flex-col gap-1"
              >
                <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.06em] text-foreground/70 transition-colors group-hover:text-foreground">
                  <ArrowLeft
                    weight="bold"
                    className="size-3 transition-transform duration-200 group-hover:-translate-x-0.5"
                  />
                  Older
                </span>
                <span className="text-base font-normal leading-tight text-pretty text-foreground/70 transition-colors group-hover:text-foreground">
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
                <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.06em] text-foreground/70 transition-colors group-hover:text-foreground">
                  Newer
                  <ArrowRight
                    weight="bold"
                    className="size-3 transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </span>
                <span className="text-base font-normal leading-tight text-pretty text-foreground/70 transition-colors group-hover:text-foreground">
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

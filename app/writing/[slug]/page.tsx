import { createHash } from "node:crypto";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";

import { AdminActions } from "@/components/admin-actions";
import { ArticleNotice } from "@/components/article-notice";
import { ArticleView } from "@/components/article-view";
import { getAuthedFromCookie } from "@/lib/auth-server";
import { embedOrigins } from "@/lib/embeds";
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

  const version = createHash("sha1")
    .update(`${article.title}\n${article.subtitle}\n${article.image}`)
    .digest("hex")
    .slice(0, 12);
  const ogImage = {
    url: `${url}/opengraph-image?v=${version}`,
    width: 1200,
    height: 630,
    alt: article.title,
  };
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: url },
    ...(article.draft ? { robots: { index: false, follow: false } } : {}),

    openGraph: {
      type: "article",
      siteName: site.title,
      title: article.title,
      description: article.description,
      url,
      publishedTime: article.date,
      authors: [site.author.name],
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [ogImage],
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

  const authed = await getAuthedFromCookie();
  if (article.draft && !authed) notFound();

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
    <ArticleView
      title={article.title}
      subtitle={article.subtitle}
      dateLabel={article.dateLabel}
      html={renderMarkdown(article.body)}
      embedOrigins={embedOrigins()}
      actions={<AdminActions article={article} />}
      banner={article.draft ? <DraftBanner slug={article.slug} /> : undefined}
    >
      {!article.draft && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      {(prev || next) && (
        <nav
          aria-label="More writing"
          className="grid w-full grid-cols-2 gap-8 border-t border-border pt-8 font-sans text-sm"
        >
          <div className="flex flex-col gap-1">
            {prev && (
              <Link
                href={`/writing/${prev.slug}`}
                className="group flex flex-col gap-1"
              >
                <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.06em] text-zinc-500 transition-colors group-hover:text-[#0040ff] dark:text-zinc-500 dark:group-hover:text-[#ffff01]">
                  <ArrowLeftIcon
                    weight="bold"
                    className="size-3 transition-transform duration-200 group-hover:-translate-x-0.5"
                  />
                  Older
                </span>
                <span className="text-base font-normal leading-tight text-pretty text-foreground/80 transition-colors group-hover:text-foreground">
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
                <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.06em] text-zinc-500 transition-colors group-hover:text-[#0040ff] dark:text-zinc-500 dark:group-hover:text-[#ffff01]">
                  Newer
                  <ArrowRightIcon
                    weight="bold"
                    className="size-3 transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </span>
                <span className="text-base font-normal leading-tight text-pretty text-foreground/80 transition-colors group-hover:text-foreground">
                  {next.title}
                </span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </ArticleView>
  );
}

function DraftBanner({ slug }: { slug: string }) {
  return (
    <ArticleNotice label="Draft" slug={slug}>
      <span className="hidden sm:inline">Visible only to you</span>
      <Link
        href="/admin/writing"
        className="transition-colors hover:text-foreground"
      >
        Admin
      </Link>
    </ArticleNotice>
  );
}

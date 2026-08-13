import { ArticleCode } from "@/components/article-code";
import { ArticleEmbeds } from "@/components/article-embeds";

type Props = {
  title: string;
  subtitle: string;
  dateLabel: string;
  html: string;
  embedOrigins: string[];
  actions?: React.ReactNode;
  banner?: React.ReactNode;
  children?: React.ReactNode;
  revision?: number;
};

export function ArticleView({
  title,
  subtitle,
  dateLabel,
  html,
  embedOrigins,
  actions,
  banner,
  children,
  revision = 0,
}: Props) {
  return (
    <main className="flex flex-1 flex-col items-start gap-12 pb-20 pt-12 md:pt-20">
      {banner}
      <div className="relative w-full max-w-prose self-center">
        <hgroup className="text-center">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.08em] text-foreground/50">
            {dateLabel}
          </p>
          <h1 className="mt-2 text-3xl font-normal tracking-tight text-balance text-foreground sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-5 text-md italic leading-snug text-balance text-foreground/60">
              {subtitle}
            </p>
          )}
        </hgroup>
        {actions && <div className="absolute right-0 top-0">{actions}</div>}
      </div>
      <article
        className="w-full text-md text-pretty text-foreground/90 oldstyle-nums"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <noscript
        dangerouslySetInnerHTML={{
          __html: "<style>article .embed-card{display:flex}</style>",
        }}
      />
      <ArticleCode key={`code-${revision}`} />
      <ArticleEmbeds key={`embeds-${revision}`} origins={embedOrigins} />
      {children}
    </main>
  );
}

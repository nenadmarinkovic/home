import { cn } from "@/lib/utils";

type Props = {
  label: string;
  slug?: string;
  children?: React.ReactNode;
  className?: string;
};

export function ArticleNotice({ label, slug, children, className }: Props) {
  return (
    <div
      className={cn(
        "sticky top-0 z-20 w-full bg-background/85 py-2 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-center gap-x-3 rounded-full border border-foreground/10 bg-foreground/4 py-1.5 pl-2 pr-4 font-sans">
        <span className="shrink-0 rounded-full bg-[#0040ff]/10 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#0040ff] dark:bg-[#ffff01]/10 dark:text-[#ffff01]">
          {label}
        </span>
        {slug && (
          <span className="min-w-0 flex-1 truncate text-xs text-zinc-500 dark:text-zinc-500">
            /writing/{slug}
          </span>
        )}
        <span className="ml-auto flex shrink-0 items-center gap-3 text-xs text-zinc-500 dark:text-zinc-500">
          {children}
        </span>
      </div>
    </div>
  );
}

export function PulseDot() {
  return (
    <span className="relative flex size-1.5" aria-hidden>
      <span className="absolute inline-flex size-full animate-[ping_0.9s_cubic-bezier(0,0,0.2,1)_1] rounded-full bg-[#0040ff] opacity-70 dark:bg-[#ffff01]" />
      <span className="relative inline-flex size-1.5 rounded-full bg-[#0040ff] dark:bg-[#ffff01]" />
    </span>
  );
}

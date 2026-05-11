"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TagChip({
  active,
  onClick,
  children,
  className,
  ...rest
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      size="xs"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full px-3 font-sans text-[11px] font-medium uppercase tracking-wider",
        active
          ? "bg-foreground text-background hover:bg-foreground/90"
          : "border-foreground/15 bg-transparent text-zinc-600 hover:border-foreground/30 hover:bg-transparent hover:text-foreground dark:text-zinc-400",
        className,
      )}
      {...rest}
    >
      {children}
    </Button>
  );
}

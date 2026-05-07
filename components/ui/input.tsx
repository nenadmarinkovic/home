import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-foreground/15 bg-field px-3 py-1.5 font-sans text-sm text-foreground transition-[color,box-shadow,border-color] outline-none",
        "placeholder:text-zinc-500 dark:placeholder:text-zinc-500",
        "focus-visible:border-foreground/40 focus-visible:ring-2 focus-visible:ring-foreground/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

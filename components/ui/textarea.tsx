import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full resize-y rounded-md border border-foreground/15 bg-field px-3 py-2 font-sans text-base leading-relaxed text-foreground transition-[color,box-shadow,border-color] outline-none md:text-sm",
        "placeholder:text-zinc-500 dark:placeholder:text-zinc-500",
        "focus-visible:border-foreground/40 focus-visible:ring-2 focus-visible:ring-foreground/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

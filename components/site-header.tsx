import Link from "next/link";

import { HeaderBio } from "@/components/header-bio";
import { HeaderNav } from "@/components/header-nav";

export function SiteHeader() {
  return (
    <header className="flex items-start justify-between pt-16">
      <div className="flex flex-col items-start gap-2">
        <Link href="/" className="flex items-center gap-2">
          <div
            aria-label="Logo"
            className="size-3.5 rounded-full bg-[#FD6401]"
          />
          <span className="font-serif text-base italic leading-snug text-foreground">
            Nenad Marinković
          </span>
        </Link>
        <HeaderBio />
      </div>
      <HeaderNav />
    </header>
  );
}

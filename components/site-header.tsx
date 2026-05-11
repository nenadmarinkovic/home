import Link from "next/link";

import { HeaderBio } from "@/components/header-bio";
import { HeaderNav } from "@/components/header-nav";
import { MobileMenu } from "@/components/mobile-menu";

export function SiteHeader() {
  return (
    <header className="flex items-baseline justify-between gap-6 pt-8 md:pt-12">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div
              aria-label="Logo"
              className="size-3 rounded-full bg-[#F25022]"
            />
            <span className="relative top-px font-serif text-lg italic leading-none text-foreground">
              Nenad Marinković
            </span>
          </Link>
          <MobileMenu />
        </div>
        <HeaderBio />
      </div>
      <HeaderNav />
    </header>
  );
}

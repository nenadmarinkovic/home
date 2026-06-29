import Link from "next/link";

import { HeaderNav } from "@/components/header-nav";
import { Logo } from "@/components/logo";
import { MobileMenu } from "@/components/mobile-menu";

export function SiteHeader() {
  return (
    <header className="flex items-baseline justify-between gap-6 pt-[27px] md:pt-12">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-6">
          <Link
            href="/"
            aria-label="Nenad Marinković — home"
            className="flex items-center text-foreground"
          >
            <Logo className="h-6 w-auto" />
          </Link>
          <MobileMenu />
        </div>
      </div>
      <HeaderNav />
    </header>
  );
}

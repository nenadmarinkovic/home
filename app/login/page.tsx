import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to write, learn, watch, and save.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-start gap-12 pb-20 pt-12 md:pt-20">
      <hgroup className="max-w-prose self-center text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.08em] text-foreground/50">
          Sign in
        </p>
        <h1 className="mt-2 text-3xl font-normal tracking-tight text-balance text-foreground sm:text-4xl">
          Welcome back
        </h1>
        <p className="mt-4 text-base italic leading-normal text-balance text-foreground/70">
          Your admin tools, all in one place.
        </p>
      </hgroup>
      <LoginForm />
      <Link
        href="/"
        className="group inline-flex items-center gap-1.5 self-center text-xs font-medium uppercase tracking-[0.06em] text-zinc-500 transition-colors hover:text-foreground dark:text-zinc-500"
      >
        <ArrowLeftIcon
          weight="bold"
          className="size-3 transition-transform duration-200 group-hover:-translate-x-0.5"
        />
        Back to the site
      </Link>
    </main>
  );
}

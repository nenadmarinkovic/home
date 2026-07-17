import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to write, learn, watch, and save.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-start gap-12 pb-20 pt-12 md:pt-20">
      <hgroup className="max-w-prose self-center space-y-3 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-600 dark:text-zinc-400">
          Sign in
        </p>
        <h1 className="text-3xl font-normal text-balance text-foreground sm:text-4xl">
          Welcome back
        </h1>
        <p className="text-base font-light italic leading-[1.5] text-balance text-zinc-600 dark:text-zinc-400">
          Your admin tools, all in one place.
        </p>
      </hgroup>
      <LoginForm />
      <Link
        href="/"
        className="group inline-flex items-center gap-1.5 self-center text-xs font-medium uppercase tracking-[0.12em] text-zinc-500 transition-colors hover:text-foreground dark:text-zinc-500"
      >
        <ArrowLeft
          weight="bold"
          className="size-3 transition-transform duration-200 group-hover:-translate-x-0.5"
        />
        Back to the site
      </Link>
    </main>
  );
}

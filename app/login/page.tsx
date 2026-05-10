import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to write, edit, and publish.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-start gap-12 py-20">
      <hgroup className="max-w-prose self-center space-y-3 text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Sign in
        </p>
        <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-pretty">
          Welcome back.
        </h1>
        <p className="font-serif text-2xl italic leading-snug text-zinc-600 dark:text-zinc-400">
          The quiet side of the site — write, edit, publish.
        </p>
      </hgroup>
      <LoginForm />
      <Link
        href="/"
        className="group inline-flex items-center gap-1.5 self-center font-sans text-xs font-medium uppercase tracking-wider text-zinc-500 transition-colors hover:text-foreground dark:text-zinc-500"
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

import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your account to continue.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-start gap-10 py-20 font-sans">
      <h1 className="self-center text-2xl font-semibold leading-tight tracking-tight text-foreground">
        Sign in
      </h1>
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}

import type { Metadata } from "next";

import { articles, draftArticles } from "../writing/articles";
import { AdminClient } from "./admin-client";
import { LogoutButton } from "./logout-button";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main className="flex flex-1 flex-col gap-10 py-20 font-sans">
      <header className="flex items-baseline justify-between gap-6">
        <h1 className="font-sans text-2xl font-semibold leading-tight tracking-tight text-foreground">
          Admin
        </h1>
        <LogoutButton />
      </header>

      <AdminClient published={articles} drafts={draftArticles} />
    </main>
  );
}

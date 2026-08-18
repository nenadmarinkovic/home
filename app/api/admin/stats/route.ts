import { NextResponse } from "next/server";

import { getArticles, getDraftArticles } from "@/app/writing/articles";
import { getAuthedFromCookie } from "@/lib/auth-server";
import { getDueStats } from "@/lib/vocabulary-db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getAuthedFromCookie())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const [published, drafts] = await Promise.all([
    getArticles(),
    getDraftArticles(),
  ]);
  const vocabularyStats = getDueStats();
  return NextResponse.json({
    writing: { published: published.length, drafts: drafts.length },
    vocabulary: { total: vocabularyStats.total, due: vocabularyStats.due },
  });
}

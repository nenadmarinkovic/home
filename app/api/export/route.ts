import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

import {
  buildExportFiles,
  markExported,
  type ExportFile,
  type ExportSelector,
} from "@/lib/articles-export";
import { LANGUAGES, type Language } from "@/db/schema";

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
}

function isLanguage(value: unknown): value is Language {
  return (
    typeof value === "string" && (LANGUAGES as readonly string[]).includes(value)
  );
}

async function exportLocal(files: ExportFile[]) {
  const root = process.cwd();
  for (const file of files) {
    const abs = path.join(root, file.path);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, file.content, "utf8");
  }
  return { mode: "local" as const, count: files.length };
}

async function exportToGitHub(files: ExportFile[], selector?: ExportSelector) {
  const token = getEnv("GITHUB_TOKEN");
  const repoFull = getEnv("GITHUB_REPO");
  const branch = process.env.GITHUB_BRANCH ?? "main";
  const [owner, repo] = repoFull.split("/");
  if (!owner || !repo) {
    throw new Error("GITHUB_REPO must be of the form owner/repo");
  }

  const octokit = new Octokit({ auth: token });

  // Get the current commit on the branch
  const { data: refData } = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`,
  });
  const baseSha = refData.object.sha;

  const { data: baseCommit } = await octokit.git.getCommit({
    owner,
    repo,
    commit_sha: baseSha,
  });
  const baseTreeSha = baseCommit.tree.sha;

  const blobs = await Promise.all(
    files.map(async (f) => {
      const { data } = await octokit.git.createBlob({
        owner,
        repo,
        content: f.content,
        encoding: "utf-8",
      });
      return { path: f.path, sha: data.sha };
    }),
  );

  const { data: tree } = await octokit.git.createTree({
    owner,
    repo,
    base_tree: baseTreeSha,
    tree: blobs.map((b) => ({
      path: b.path,
      mode: "100644",
      type: "blob",
      sha: b.sha,
    })),
  });

  const message = selector
    ? `Snapshot: ${selector.language}/${selector.slug}`
    : `Snapshot: ${files.length} article${files.length === 1 ? "" : "s"}`;

  const { data: commit } = await octokit.git.createCommit({
    owner,
    repo,
    message,
    tree: tree.sha,
    parents: [baseSha],
  });

  await octokit.git.updateRef({
    owner,
    repo,
    ref: `heads/${branch}`,
    sha: commit.sha,
  });

  return {
    mode: "github" as const,
    count: files.length,
    commitUrl: `https://github.com/${owner}/${repo}/commit/${commit.sha}`,
    commitSha: commit.sha,
  };
}

async function parseSelector(request: Request): Promise<ExportSelector | undefined> {
  const ctype = request.headers.get("content-type") ?? "";
  if (!ctype.includes("application/json")) return undefined;
  try {
    const body = (await request.json()) as {
      slug?: unknown;
      language?: unknown;
    };
    if (!body || typeof body !== "object") return undefined;
    if (body.slug === undefined && body.language === undefined) return undefined;
    if (typeof body.slug !== "string" || !body.slug) {
      throw new Error("slug must be a non-empty string");
    }
    if (!isLanguage(body.language)) {
      throw new Error("language must be one of: " + LANGUAGES.join(", "));
    }
    return { slug: body.slug, language: body.language };
  } catch (err) {
    if (err instanceof SyntaxError) return undefined;
    throw err;
  }
}

export async function POST(request: Request) {
  try {
    const selector = await parseSelector(request);
    const files = buildExportFiles(selector);
    if (files.length === 0) {
      return NextResponse.json({
        ok: true,
        count: 0,
        mode: "noop",
        scope: selector ? "single" : "all",
      });
    }
    const result =
      process.env.NODE_ENV === "development"
        ? await exportLocal(files)
        : await exportToGitHub(files, selector);
    markExported(files.map((f) => ({ slug: f.slug, language: f.language })));
    return NextResponse.json({
      ok: true,
      ...result,
      scope: selector ? "single" : "all",
    });
  } catch (err: unknown) {
    const message =
      typeof err === "object" && err !== null && "message" in err
        ? String((err as { message: string }).message)
        : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

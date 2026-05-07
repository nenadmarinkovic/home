import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

import { buildExportFiles, type ExportFile } from "@/lib/articles-export";

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
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

async function exportToGitHub(files: ExportFile[]) {
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

  const { data: commit } = await octokit.git.createCommit({
    owner,
    repo,
    message: `Snapshot: ${files.length} article${files.length === 1 ? "" : "s"}`,
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
  };
}

export async function POST() {
  try {
    const files = buildExportFiles();
    if (files.length === 0) {
      return NextResponse.json({ ok: true, count: 0, mode: "noop" });
    }
    const result =
      process.env.NODE_ENV === "development"
        ? await exportLocal(files)
        : await exportToGitHub(files);
    return NextResponse.json({ ok: true, ...result });
  } catch (err: unknown) {
    const message =
      typeof err === "object" && err !== null && "message" in err
        ? String((err as { message: string }).message)
        : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

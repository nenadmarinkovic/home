import fs from "node:fs/promises";
import path from "node:path";
import { Octokit } from "@octokit/rest";

type Frontmatter = {
  title: string;
  subtitle: string;
  description: string;
  date: string;
  draft?: boolean;
};

export type CommitArticleInput = Frontmatter & {
  slug: string;
  body: string;
};

export type PublishResult = {
  mode: "local" | "github";
  path: string;
  commitUrl?: string;
};

function yamlEscape(value: string): string {
  if (/[:#&*!|>'"%@`,?\-{}\[\]]/.test(value) || value !== value.trim()) {
    return JSON.stringify(value);
  }
  return value;
}

export function buildMarkdown({
  title,
  subtitle,
  description,
  date,
  draft,
  body,
}: Omit<CommitArticleInput, "slug">): string {
  const lines = [
    "---",
    `title: ${yamlEscape(title)}`,
    `subtitle: ${yamlEscape(subtitle)}`,
    `description: ${yamlEscape(description)}`,
    `date: ${date}`,
  ];
  if (draft) lines.push("draft: true");
  lines.push("---", "");
  return `${lines.join("\n")}${body.trim()}\n`;
}

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
}

async function writeArticleLocal(
  input: CommitArticleInput,
): Promise<PublishResult> {
  const relPath = `content/${input.slug}.md`;
  const absPath = path.join(process.cwd(), relPath);
  const dir = path.dirname(absPath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(absPath, buildMarkdown(input), "utf8");
  return { mode: "local", path: relPath };
}

async function commitArticleRemote(
  input: CommitArticleInput,
): Promise<PublishResult> {
  const token = getEnv("GITHUB_TOKEN");
  const repoFull = getEnv("GITHUB_REPO");
  const branch = process.env.GITHUB_BRANCH ?? "main";

  const [owner, repo] = repoFull.split("/");
  if (!owner || !repo) {
    throw new Error("GITHUB_REPO must be of the form owner/repo");
  }

  const octokit = new Octokit({ auth: token });
  const filePath = `content/${input.slug}.md`;
  const content = buildMarkdown(input);

  let sha: string | undefined;
  try {
    const existing = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: branch,
    });
    if (!Array.isArray(existing.data) && "sha" in existing.data) {
      sha = existing.data.sha;
    }
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "status" in err &&
      (err as { status: number }).status !== 404
    ) {
      throw err;
    }
  }

  const result = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    branch,
    message: sha ? `Update: ${input.title}` : `Publish: ${input.title}`,
    content: Buffer.from(content, "utf8").toString("base64"),
    sha,
  });

  return {
    mode: "github",
    path: filePath,
    commitUrl: result.data.commit.html_url ?? "",
  };
}

export async function publishArticle(
  input: CommitArticleInput,
): Promise<PublishResult> {
  if (process.env.NODE_ENV === "development") {
    return writeArticleLocal(input);
  }
  return commitArticleRemote(input);
}

async function deleteArticleLocal(slug: string): Promise<PublishResult> {
  const relPath = `content/${slug}.md`;
  const absPath = path.join(process.cwd(), relPath);
  await fs.rm(absPath, { force: true });
  return { mode: "local", path: relPath };
}

async function deleteArticleRemote(slug: string): Promise<PublishResult> {
  const token = getEnv("GITHUB_TOKEN");
  const repoFull = getEnv("GITHUB_REPO");
  const branch = process.env.GITHUB_BRANCH ?? "main";
  const [owner, repo] = repoFull.split("/");
  if (!owner || !repo) {
    throw new Error("GITHUB_REPO must be of the form owner/repo");
  }

  const octokit = new Octokit({ auth: token });
  const filePath = `content/${slug}.md`;

  let sha: string;
  try {
    const existing = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: branch,
    });
    if (Array.isArray(existing.data) || !("sha" in existing.data)) {
      throw new Error("File not found");
    }
    sha = existing.data.sha;
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "status" in err &&
      (err as { status: number }).status === 404
    ) {
      // Already gone — treat as success.
      return { mode: "github", path: filePath };
    }
    throw err;
  }

  const result = await octokit.repos.deleteFile({
    owner,
    repo,
    path: filePath,
    branch,
    message: `Delete: ${slug}`,
    sha,
  });

  return {
    mode: "github",
    path: filePath,
    commitUrl: result.data.commit.html_url ?? "",
  };
}

export async function deleteArticle(slug: string): Promise<PublishResult> {
  if (process.env.NODE_ENV === "development") {
    return deleteArticleLocal(slug);
  }
  return deleteArticleRemote(slug);
}

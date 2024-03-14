import { Repo } from '../types/types';

const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

async function fetchFromGithub(url: string): Promise<any> {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch data: ${res.status} ${res.statusText}`
    );
  }

  return res.json();
}

export async function fetchRepoLanguages(
  url: string
): Promise<Record<string, number>> {
  return fetchFromGithub(url);
}

export async function fetchUserRepos(page: number): Promise<Repo[]> {
  return fetchFromGithub(
    `https://api.github.com/user/repos?per_page=100&page=0&visibility=all`
  );
}

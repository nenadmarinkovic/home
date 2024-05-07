import { Repo } from '../types/types';

const { GITHUB_TOKEN } = process.env;

async function fetchFromGithub(url: string): Promise<any> {
  try {
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
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
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

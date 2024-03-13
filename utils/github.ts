const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

export async function fetchRepoLanguages(
  url: string
): Promise<Record<string, number>> {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch languages data');
  }

  return res.json();
}

export async function fetchUserRepos(page: number): Promise<any[]> {
  const res = await fetch(
    `https://api.github.com/user/repos?per_page=100&page=${page}&visibility=all`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }

  return res.json();
}

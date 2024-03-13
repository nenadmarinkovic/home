import { ReactNode } from 'react';
import styles from '../styles/components/Text.module.css';

interface RepoData {
  name: string;
  languages: Record<string, number>;
}

const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
const GITHUB_USERNAME = 'nenadmarinkovic';

async function getLanguages(
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

async function getAllReposData(): Promise<RepoData[]> {
  let page = 1;
  let allRepos: RepoData[] = [];

  while (true) {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }

    const repos = await res.json();

    if (repos.length === 0) {
      // No more repositories, break the loop
      break;
    }

    const repoDataPromises = repos.map(async (repo: any) => {
      const languages = await getLanguages(repo.languages_url);
      return {
        name: repo.name,
        languages,
      };
    });

    const repoData = await Promise.all(repoDataPromises);
    allRepos = [...allRepos, ...repoData];
    page++;
  }

  return allRepos;
}

export default async function Develop() {
  const repoData = await getAllReposData();

  // Calculate total counts for each language
  const totalCounts: Record<string, number> = {};
  repoData.forEach((repo) => {
    for (const [language, count] of Object.entries(repo.languages)) {
      totalCounts[language] = (totalCounts[language] || 0) + count;
    }
  });

  // Calculate total lines of code
  const totalLinesOfCode = Object.values(totalCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  // Calculate percentages
  const languagePercentages: Record<string, number> = {};
  for (const [language, count] of Object.entries(totalCounts)) {
    const percentage = (count / totalLinesOfCode) * 100;
    languagePercentages[language] = percentage;
  }

  return (
    <div className={styles.container}>
      <h1>Programming Language Usage Percentages</h1>
      <ul>
        {Object.entries(languagePercentages).map(
          ([language, percentage]) => (
            <li key={language}>
              <strong>{language}:</strong> {percentage.toFixed(2)}%
            </li>
          )
        )}
      </ul>
    </div>
  );
}

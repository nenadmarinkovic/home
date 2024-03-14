import styles from '../styles/components/Text.module.css';
import { fetchRepoLanguages, fetchUserRepos } from '../utils/github';
import { RepoData, Repo } from '../types/types';
import { LanguageChart } from './LanguageChart';

async function getAllReposData(): Promise<RepoData[]> {
  let page = 1;
  let allRepos: RepoData[] = [];

  while (true) {
    const repos = await fetchUserRepos(page);

    if (repos.length === 0) {
      break;
    }

    const repoDataPromises = repos.map(async (repo: Repo) => {
      const languages = await fetchRepoLanguages(repo.languages_url);

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

  const totalCounts: Record<string, number> = {};
  repoData.forEach((repo) => {
    for (const [language, count] of Object.entries(repo.languages)) {
      totalCounts[language] = (totalCounts[language] || 0) + count;
    }
  });

  const totalLinesOfCode = Object.values(totalCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  const languagePercentages: Record<string, number> = {};
  for (const [language, count] of Object.entries(totalCounts)) {
    const percentage = (count / totalLinesOfCode) * 100;
    languagePercentages[language] = percentage;
  }

  const sortedLanguagePercentages = Object.entries(
    languagePercentages
  ).sort(
    ([, aPercentage], [, bPercentage]) => bPercentage - aPercentage
  );

  const maxPercentage = Math.max(
    ...Object.values(languagePercentages)
  );

  return (
    <div className={styles.container}>
      <LanguageChart
        data={sortedLanguagePercentages.map(
          ([language, percentage]) => ({ language, percentage })
        )}
        maxPercentage={maxPercentage}
      />
    </div>
  );
}

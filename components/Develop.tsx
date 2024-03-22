import { fetchRepoLanguages, fetchUserRepos } from '../utils/github';
import { RepoData, Repo } from '../types/types';
import { DevelopChart } from './DevelopChart';
import SectionHeader from './Section';
import Container from '@/containers/Container';
import styles from '../styles/components/Box.module.css';

async function getAllReposData(): Promise<RepoData[]> {
  const repos = await fetchUserRepos(1);

  const repoDataPromises = repos.map(async (repo: Repo) => {
    const languages = await fetchRepoLanguages(repo.languages_url);
    return {
      name: repo.name,
      languages,
    };
  });

  const repoData = await Promise.all(repoDataPromises);

  return repoData;
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
    <Container>
      <SectionHeader
        header="Lorem ipsum"
        title="Lorem ipsum dolor, sit amet consectetur"
        text="Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente officia nesciunt vel. Distinctio, nobis libero! Nostrum, neque."
      />
      <div className={styles.box_container}>
        <div className={styles.box_item}>
          <div className={styles.box_item_inside}>
            <h3 className={styles.box_item_header_title}>Develop</h3>
            <p className={styles.box_item_header_text}>
              Better P99 latency and more requests per second than
              Apollo Router
            </p>
            <p className={styles.box_item_main_title}>
              Deliver raw performance with the Cosmo Router
            </p>
            <div className={styles.box_item_main_items}>
              <div className={styles.box_item_main_item}>
                <svg
                  className={styles.box_item_main_icon}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
                  />
                </svg>
                <span className={styles.box_item_main_item_text}>
                  Native High-Performance Query Execution Planner
                  written in Go with Caching.
                </span>
              </div>
              <div className={styles.box_item_main_item}>
                <svg
                  className={styles.box_item_main_icon}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
                  />
                </svg>
                <span className={styles.box_item_main_item_text}>
                  Native High-Performance Query Execution Planner
                  written in Go with Caching.
                </span>
              </div>
              <div className={styles.box_item_main_item}>
                <svg
                  className={styles.box_item_main_icon}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
                  />
                </svg>
                <span className={styles.box_item_main_item_text}>
                  Native High-Performance Query Execution Planner
                  written in Go with Caching.
                </span>
              </div>
            </div>
          </div>
          <div className={styles.blur}></div>
        </div>
        <div className={styles.box_detail}>
          <DevelopChart
            data={sortedLanguagePercentages.map(
              ([language, percentage]) => ({ language, percentage })
            )}
            maxPercentage={maxPercentage}
          />
        </div>
        <div className={styles.box_dots}></div>
      </div>
    </Container>
  );
}

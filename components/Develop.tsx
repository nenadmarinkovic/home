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

  const currentYear = new Date().getFullYear();

  return (
    <Container>
      <SectionHeader
        header="Process"
        title="The journey from development to delivery"
        text="From initial phases to finilizing the product and delivering it to the client, I follow a strict process to ensure the best quality and performance."
      />
      <div className={styles.boxContainer}>
        <div className={styles.boxItem}>
          <div className={styles.boxItemInside}>
            <h3 className={styles.boxItem_header_title}>Develop</h3>
            <p className={styles.boxItemHeaderText}>
              Using modern tools, I work to ensure the design is
              implemented without a single error and with the best
              performance possible.
            </p>
            <p className={styles.boxItemMainTitle}>
              Best practices, top performance, and
              cross-browser-compatibility
            </p>
            <div className={styles.boxItemMainItems}>
              <div className={styles.boxItemMainItem}>
                <svg
                  className={styles.boxItemMainIcon}
                  height="16"
                  strokeLinejoin="round"
                  viewBox="0 0 16 16"
                  width="16"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.5 2V0.75V0H7V0.75V2H9V0.75V0H10.5V0.75V2H13C13.5523 2 14 2.44772 14 3V5.5H15.25H16V7H15.25H14V9H15.25H16V10.5H15.25H14V13C14 13.5523 13.5523 14 13 14H10.5V15.25V16H9V15.25V14H7V15.25V16H5.5V15.25V14H3C2.44772 14 2 13.5523 2 13V10.5H0.75H0V9H0.75H2V7H0.75H0V5.5H0.75H2V3C2 2.44772 2.44772 2 3 2H5.5ZM12.75 10.5V9V7V5.5V3.25H10.5H9H7H5.5H3.25V5.5V7V9V10.5V12.75H5.5H7H9H10.5H12.75V10.5Z"
                    fill="currentColor"
                  ></path>
                </svg>
                <span className={styles.boxItemMainItemText}>
                  It is {currentYear} and websites need to be fast,
                  reliable and secure without compromise.
                </span>
              </div>
              <div className={styles.boxItemMainItem}>
                <svg
                  height="16"
                  strokeLinejoin="round"
                  className={styles.boxItemMainIcon}
                  viewBox="0 0 16 16"
                  width="16"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.00001 -0.25H7.75001H8.25001H9.75001H10.25H11V1.25H10.25H9.75001V2.03971C11.1207 2.18571 12.3732 2.72735 13.3911 3.54824L13.9697 2.96967L14.5 2.43934L15.5607 3.5L15.0303 4.03033L14.4518 4.6089C15.4202 5.80976 16 7.33717 16 9C16 12.866 12.866 16 9.00002 16C7.3965 16 5.91736 15.46 4.73698 14.5525H2.00002V13.0525H5.00002C5.17555 13.0525 5.34551 13.1141 5.48032 13.2265C6.4344 14.022 7.66041 14.5 9.00002 14.5C12.0376 14.5 14.5 12.0376 14.5 9C14.5 5.96243 12.0376 3.5 9.00002 3.5C7.25926 3.5 5.70766 4.30785 4.69866 5.57204L3.5263 4.63633C4.66119 3.21441 6.34099 2.24321 8.25001 2.03974V1.25H7.75001H7.00001V-0.25ZM11.6517 7.40901L11.1213 7.93934L9.53033 9.53033L9 10.0607L7.93934 9L8.46967 8.46967L10.0607 6.87868L10.591 6.34835L11.6517 7.40901ZM2 7H2.75H4.25H5V8.5H4.25H2.75H2V7ZM0.75 10H0V11.5H0.75H4.25H5V10H4.25H0.75Z"
                    fill="currentColor"
                  ></path>
                </svg>
                <span className={styles.boxItemMainItemText}>
                  Websites should be built with lag free interaction
                  as a top priority.
                </span>
              </div>
              <div className={styles.boxItemMainItem}>
                <svg
                  className={styles.boxItemMainIcon}
                  height="16"
                  strokeLinejoin="round"
                  viewBox="0 0 16 16"
                  width="16"
                >
                  <path
                    d="M8 3C8.82843 3 9.5 2.32843 9.5 1.5C9.5 0.671573 8.82843 0 8 0C7.17157 0 6.5 0.671573 6.5 1.5C6.5 2.32843 7.17157 3 8 3Z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M4.67148 6C5.89632 6 6.83343 7.09104 6.64857 8.30185L6.43 9.73346C6.3381 10.2159 6.1906 10.6874 6 11.1401L4.33 15.2L5.92164 15.888L7.594 11.9162C7.72668 11.6011 8.27332 11.6011 8.406 11.9162L10.0784 15.888L11.67 15.2L10 11.1401C9.8094 10.6874 9.6619 10.2159 9.57 9.73346L9.2835 8.42904C9.00946 7.18131 9.95947 6 11.2369 6H14V4.5H2V6H4.67148Z"
                    fill="currentColor"
                  ></path>
                </svg>
                <span className={styles.boxItemMainItemText}>
                  Website should be accessibility, responsive, fully
                  functional and user-friendly.
                </span>
              </div>
            </div>
          </div>
          <div className={styles.blur}></div>
        </div>
        <div className={styles.boxDetail}>
          <DevelopChart
            data={sortedLanguagePercentages.map(
              ([language, percentage]) => ({ language, percentage })
            )}
            maxPercentage={maxPercentage}
          />
        </div>
        <div className={styles.boxDots}></div>
      </div>
    </Container>
  );
}

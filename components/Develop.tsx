import SectionHeader from './Section';
import Container from '@/containers/Container';
import { fetchRepoLanguages, fetchUserRepos } from '../utils/github';
import { RepoData, Repo } from '../types/types';
import { DevelopChart } from './DevelopChart';

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
        text="My work usually starts when design is ready and approved. From there, I follow the best development practices to ensure the design is implemented without a single error and with the best performance possible.
       "
      />
      <div className={styles.boxContainer}>
        <div className={styles.boxItem}>
          <div className={styles.boxItemInside}>
            <h3 className={styles.boxItem_header_title}>Develop</h3>
            <p className={styles.boxItemHeaderText}>
              In today&apos;s digital world, you can spot the
              difference between a well-built product and a mediocre
              one in seconds. I make sure yours falls in the first
              group.
            </p>
            <p className={styles.boxItemMainTitle}>
              Best practices, top performance, and
              cross-browser-compatibility
            </p>
            <div className={styles.boxItemMainItems}>
              <div className={styles.boxItemMainItem}>
                <svg
                  strokeLinejoin="round"
                  className={styles.boxItemMainIcon}
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.00001 -0.25H7.75001H8.25001H9.75001H10.25H11V1.25H10.25H9.75001V2.03971C11.1207 2.18571 12.3732 2.72735 13.3911 3.54824L13.9697 2.96967L14.5 2.43934L15.5607 3.5L15.0303 4.03033L14.4518 4.6089C15.4202 5.80976 16 7.33717 16 9C16 12.866 12.866 16 9.00002 16C7.3965 16 5.91736 15.46 4.73698 14.5525H2.00002V13.0525H5.00002C5.17555 13.0525 5.34551 13.1141 5.48032 13.2265C6.4344 14.022 7.66041 14.5 9.00002 14.5C12.0376 14.5 14.5 12.0376 14.5 9C14.5 5.96243 12.0376 3.5 9.00002 3.5C7.25926 3.5 5.70766 4.30785 4.69866 5.57204L3.5263 4.63633C4.66119 3.21441 6.34099 2.24321 8.25001 2.03974V1.25H7.75001H7.00001V-0.25ZM11.6517 7.40901L11.1213 7.93934L9.53033 9.53033L9 10.0607L7.93934 9L8.46967 8.46967L10.0607 6.87868L10.591 6.34835L11.6517 7.40901ZM2 7H2.75H4.25H5V8.5H4.25H2.75H2V7ZM0.75 10H0V11.5H0.75H4.25H5V10H4.25H0.75Z"
                    fill="currentColor"
                  ></path>
                </svg>
                <span className={styles.boxItemMainItemText}>
                  It is {currentYear} and websites need to be fast,
                  reliable and with lag free interaction as a top
                  priority.
                </span>
              </div>
              <div className={styles.boxItemMainItem}>
                <svg
                  className={styles.boxItemMainIcon}
                  strokeLinejoin="round"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0.75 0H0V0.75V10.5C0 11.8807 1.11929 13 2.5 13H5.25V11.5H2.5C1.94772 11.5 1.5 11.0523 1.5 10.5V1.5H14.5V6H16V0.75V0H15.25H0.75ZM3.75 4.5C4.16421 4.5 4.5 4.16421 4.5 3.75C4.5 3.33579 4.16421 3 3.75 3C3.33579 3 3 3.33579 3 3.75C3 4.16421 3.33579 4.5 3.75 4.5ZM7 3.75C7 4.16421 6.66421 4.5 6.25 4.5C5.83579 4.5 5.5 4.16421 5.5 3.75C5.5 3.33579 5.83579 3 6.25 3C6.66421 3 7 3.33579 7 3.75ZM8.75 4.5C9.16421 4.5 9.5 4.16421 9.5 3.75C9.5 3.33579 9.16421 3 8.75 3C8.33579 3 8 3.33579 8 3.75C8 4.16421 8.33579 4.5 8.75 4.5ZM13.2307 12C13.2 12.815 13.0938 13.6278 12.9124 14.4279C13.8564 13.9717 14.5462 13.0724 14.7118 12H13.2307ZM11.8047 14.7359C11.7044 14.7452 11.6028 14.75 11.5 14.75C11.3972 14.75 11.2956 14.7452 11.1953 14.7359C10.9494 13.839 10.8077 12.9211 10.77 12H12.23C12.1923 12.9211 12.0506 13.839 11.8047 14.7359ZM13.2307 11C13.2 10.185 13.0938 9.37224 12.9124 8.57213C13.8564 9.02834 14.5462 9.92764 14.7118 11H13.2307ZM12.23 11C12.1923 10.0789 12.0506 9.16097 11.8047 8.2641C11.7044 8.25477 11.6028 8.25 11.5 8.25C11.3972 8.25 11.2956 8.25477 11.1953 8.2641C10.9494 9.16097 10.8077 10.0789 10.77 11H12.23ZM9.76925 11C9.80005 10.185 9.90616 9.37224 10.0876 8.57213C9.1436 9.02834 8.45381 9.92764 8.28822 11H9.76925ZM10.0876 14.4279C9.90616 13.6278 9.80005 12.815 9.76925 12H8.28822C8.45381 13.0724 9.1436 13.9717 10.0876 14.4279ZM11.5 16C13.9853 16 16 13.9853 16 11.5C16 9.01472 13.9853 7 11.5 7C9.01472 7 7 9.01472 7 11.5C7 13.9853 9.01472 16 11.5 16Z"
                    fill="currentColor"
                  ></path>
                </svg>
                <span className={styles.boxItemMainItemText}>
                  Well-developed websites and applications rank higher
                  in search results (SEO).
                </span>
              </div>
              <div className={styles.boxItemMainItem}>
                <svg
                  className={styles.boxItemMainIcon}
                  strokeLinejoin="round"
                  viewBox="0 0 16 16"
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
                  Websites should be accessibility, responsive, fully
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

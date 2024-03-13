'use client';

import { useEffect, useState } from 'react';
import getGitHubData from '../utils/github';
import styles from '../styles/components/Text.module.css';
import { Language } from '../types/types';

const Develop: React.FC = () => {
  const [languages, setLanguages] = useState<Language[]>([]);

  useEffect(() => {
    const loadGitHubData = async () => {
      const username = 'nenadmarinkovic';

      try {
        const repos = await getGitHubData(username);

        const languageStats: { [key: string]: number } = repos.reduce(
          (acc: { [key: string]: number }, repo) => {
            const repoLanguages = repo.languages.nodes;

            if (repoLanguages.length > 0) {
              repoLanguages.forEach((language: { name: string }) => {
                const languageName = language.name || 'Unknown';
                acc[languageName] = (acc[languageName] || 0) + 1;
              });
            }

            return acc;
          },
          {}
        );

        const languagesArray: Language[] = Object.entries(
          languageStats
        ).map(([language, count]) => ({
          language,
          count,
        }));

        languagesArray.sort((a, b) => b.count - a.count);

        setLanguages(languagesArray);
      } catch (error) {
        console.error('Error fetching GitHub data:', error);
      }
    };

    loadGitHubData();
  }, []);

  return (
    <div className={styles.container}>
      <h1>Most Used Programming Languages</h1>
      <ul>
        {languages.map((lang) => (
          <li key={lang.language}>
            {lang.language}: {lang.count}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Develop;

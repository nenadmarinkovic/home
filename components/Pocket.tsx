'use client';

import React, { useEffect, useState } from 'react';
import { ArticleType } from '@/types/types';

import styles from '../styles/pages/layout.module.css';

function Pocket() {
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/read');
        const data = await response.json();

        if (data && Array.isArray(data.articles)) {
          const sortedArticles = data.articles.sort(
            (a: ArticleType, b: ArticleType) =>
              new Date(Number(b.date) * 1000).getTime() -
              new Date(Number(a.date) * 1000).getTime()
          );

          setArticles(sortedArticles);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {isLoading ? (
        <span>Loading...</span>
      ) : (
        <ul className={styles.posts}>
          {articles.map((article: ArticleType) => {
            const date = new Date(article.date * 1000);
            const formattedDate = date.toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
            return (
              <li key={article.id}>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.post}
                >
                  <h2 className={styles.postTitle}>
                    {article.title}
                  </h2>
                  <span className={`${styles.postDate}`}>
                    {formattedDate}
                  </span>
                  <p className={styles.postDescription}>
                    {article.excerpt}
                  </p>
                  <span className={`${styles.newTab}`}>See more</span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export default Pocket;

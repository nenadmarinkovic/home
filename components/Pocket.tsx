'use client';

import React, { useEffect, useState } from 'react';

import styles from '../styles/pages/layout.module.css';

function Pocket() {
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/read')
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data && typeof data === 'object') {
          const articlesArray = Object.values(data);
          setArticles(articlesArray);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ul className={styles.posts}>
      {articles.map((article: any, index) => {
        const date = new Date(article.time_added * 1000);
        const formattedDate = date.toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        return (
          <li key={index}>
            <a
              href={article.resolved_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.post}
            >
              <h2 className={styles.postTitle}>
                {article.resolved_title}
              </h2>
              <span className={styles.postDate}>{formattedDate}</span>
              <p className={styles.postDescription}>
                {article.excerpt}
              </p>
              <span className={`${styles.newTab}`}>Read more</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export default Pocket;

'use client';

import React, { useEffect, useState } from 'react';

function Pocket() {
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/read')
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log('Response data:', data);
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
    <div>
      <ul>
        {articles.map((article: any, index) => {
          return (
            <li key={index}>
              <a
                href={article.resolved_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {article.resolved_title}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Pocket;

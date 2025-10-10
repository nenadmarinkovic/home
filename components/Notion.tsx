"use client";

import React, { useEffect, useState } from "react";
import { ArticleType } from "@/types/types";

import styles from "../styles/pages/layout.module.css";

function Notion() {
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/read");
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
        console.error("Error:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {isLoading ? (
        <span className={styles.loaderContainer}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.loader}
          >
            <path d="M12 2v4" />
            <path d="m16.2 7.8 2.9-2.9" />
            <path d="M18 12h4" />
            <path d="m16.2 16.2 2.9 2.9" />
            <path d="M12 18v4" />
            <path d="m4.9 19.1 2.9-2.9" />
            <path d="M2 12h4" />
            <path d="m4.9 4.9 2.9 2.9" />
          </svg>
        </span>
      ) : (
        <ul className={styles.posts}>
          {articles.map((article: ArticleType, index) => {
            const date = new Date(article.date);
            const formattedDate = date.toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });
            return (
              <li key={article.id}>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.post} ${styles.popUpAnimation}`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <h2 className={styles.postTitle}>{article.title}</h2>
                  <span className={`${styles.postDate}`}>{formattedDate}</span>
                  <p className={styles.postDescription}>
                    {article.description}
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

export default Notion;

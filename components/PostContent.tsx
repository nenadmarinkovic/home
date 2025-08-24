'use client';

import styles from '../styles/pages/layout.module.css';

interface Heading {
  text: string;
  id: string;
}

interface PostContentProps {
  html: string;
  headings: Heading[];
}

export default function PostContent({
  html,
  headings,
}: PostContentProps) {
  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div className={styles.contentFlex}>
      {headings.length > 0 && (
        <aside className={styles.stickySidebar}>
          <nav>
            <p className={styles.tocTitle}>On this page</p>
            <ul>
              {headings.map((heading) => (
                <li key={heading.id}>
                  <a
                    href={`#${heading.id}`}
                    onClick={(e) => handleScroll(e, heading.id)}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      )}

      <div
        className={styles.contentSection}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

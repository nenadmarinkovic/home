import React from 'react';

import styles from '../styles/components/Section.module.css';

interface SectionHeaderProps {
  header: string;
  title: string;
  text: string;
}

const Section: React.FC<SectionHeaderProps> = ({
  header,
  title,
  text,
}) => {
  return (
    <div className={styles.section}>
      <span className={styles.section_header}>{header}</span>
      <h2 className={styles.section_title}>{title}</h2>
      <p className={styles.section_text}>{text}</p>
    </div>
  );
};

export default Section;

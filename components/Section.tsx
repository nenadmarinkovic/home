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
      <span className={styles.sectionHeader}>{header}</span>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <p className={styles.sectionText}>{text}</p>
    </div>
  );
};

export default Section;

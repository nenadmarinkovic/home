import Container from '@/containers/Container';
import { BannerProps } from '@/types/types';

import styles from '../styles/components/Banner.module.css';

export default function Banner({
  title,
  highlightedText,
  paragraphText,
  additionalText,
  children,
}: BannerProps) {
  return (
    <section className={styles.banner}>
      <div className={styles.bannerContainer}>
        <Container>
          <div className={styles.bannerInside}>
            <h1 className={styles.bannerText}>
              {title}
              <span className={styles.highlighted_text}>
                {' '}
                {highlightedText}
              </span>
              {additionalText}
            </h1>
            <p className={styles.bannerParagraph}>{paragraphText}</p>
            {children}
          </div>
        </Container>
      </div>
    </section>
  );
}

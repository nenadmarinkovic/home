import Container from '@/containers/Container';
<<<<<<< HEAD
import { BannerProps } from '@/types/types';
=======
import Link from 'next/link';
import styles from '../styles/components/Banner.module.css';
import stylesButton from '../styles/components/Button.module.css';
>>>>>>> 5dde058b2d476e232491e4786c127f4df43884de

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
<<<<<<< HEAD
              {title}
              <span className={styles.highlighted_text}>
                {' '}
                {highlightedText}
              </span>
              {additionalText}
            </h1>
            <p className={styles.bannerParagraph}>{paragraphText}</p>
            {children}
=======
              I make
              <span className={styles.highlighted_text}>
                {' '}
                websites
              </span>{' '}
              and other web products.
            </h1>
            <p className={styles.bannerParagraph}>
              Hi. I&apos;m Nenad, a frontend developer at{' '}
              <a
                target="_blank"
                rel="noopener"
                className="link"
                href="https://nexxar.com"
              >
                nexxar
              </a>{' '}
              in Vienna, Austria. With a versatile skill set in
              various web technologies, I work on developing the best
              digital reports for clients across the globe. I build
              personal software, too.
            </p>
            <div className={styles.info}>
              <Link href="/contact">
                <button className={stylesButton.button}>
                  Contact
                </button>
              </Link>
              <span className={styles.more}>
                <Link href="/about"> More about me</Link>
              </span>
            </div>
>>>>>>> 5dde058b2d476e232491e4786c127f4df43884de
          </div>
        </Container>
      </div>
    </section>
  );
}

import Container from '@/containers/Container';
import Link from 'next/link';
import styles from '../styles/components/Banner.module.css';
import stylesButton from '../styles/components/Button.module.css';

export default function Banner() {
  return (
    <section className={styles.banner}>
      <div className={styles.bannerContainer}>
        <Container>
          <div className={styles.bannerInside}>
            <h1 className={styles.bannerText}>
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
          </div>
        </Container>
      </div>
    </section>
  );
}

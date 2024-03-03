import styles from '../styles/components/Banner.module.css';
import Container from '@/containers/Container';

export default function Banner() {
  return (
    <>
      <div className={styles.banner}>
        <div className={styles.banner_grid}>
          <Container>
            <h1 className={styles.banner_text}>
              I build
              <span className={styles.highlighted_text}>
                {' '}
                websites
              </span>
              , web interfaces, and apps.
            </h1>
            <p className={styles.banner_paragraph}>
              Front-end developer at nexxar in Vienna, Austria.
              Experienced in designing and developing websites, web
              interfaces, and APIs, with a versatile skill set in
              various web technologies.
            </p>
            <button className={styles.button}>Contact</button>
          </Container>
        </div>
      </div>
    </>
  );
}

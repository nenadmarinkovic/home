import Header from '@/components/Header';
import Banner from '@/components/Banner';
import Container from '@/containers/Container';
import Footer from '@/components/Footer';

import styles from '../../styles/pages/layout.module.css';

export default function Home() {
  return (
    <>
      <Header />
      <Banner
        title="About"
        paragraphText="My expertise lies in building websites and web interfaces using modern technologies like React and Vue. I find great joy in the field of web development — it’s a journey filled with challenges, constant learning, and the chance to bring a creative touch to each project."
      />
      <section className={styles.contentContainer}>
        <Container>About</Container>
      </section>
      <Footer />
    </>
  );
}

import Header from '@/components/Header';
<<<<<<< HEAD
import HomeBanner from '@/components/HomeBanner';
=======
import Banner from '@/components/Banner';
>>>>>>> 5dde058b2d476e232491e4786c127f4df43884de
import Develop from '@/components/Develop';
import Test from '@/components/Test';
import Deploy from '@/components/Deploy';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Products from '@/components/Products';
import Spotify from '@/components/Spotify';

import styles from '../styles/pages/layout.module.css';

export default function Home() {
  return (
    <>
      <Header />
      <main className={styles.main}>
<<<<<<< HEAD
        <HomeBanner />
=======
        <Banner />
>>>>>>> 5dde058b2d476e232491e4786c127f4df43884de
        <Products />
        <Develop />
        <Test />
        <Deploy />
        <Projects />
        <Contact />
        <Spotify />
      </main>
      <Footer />
    </>
  );
}

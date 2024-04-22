import Header from '@/components/Header';
import HomeBanner from '@/components/HomeBanner';
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
        <HomeBanner />
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

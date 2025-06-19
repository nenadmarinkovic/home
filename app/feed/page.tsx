import Header from '@/components/Header';
import Banner from '@/components/Banner';
import Container from '@/containers/Container';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';

const DynamicSpotify = dynamic(() => import('@/components/Spotify'));

import styles from '../../styles/pages/layout.module.css';
import Notion from '@/components/Notion';

export default function Feed() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <Banner
          title="Feed"
          paragraphText="A collection of articles sourced from my Notion profile, mainly about programming languages, web development, AI, design and other tech-related topics that I find interesting for saving and sharing."
        />
        <section className={styles.contentContainer}>
          <Container>
            <Notion />
          </Container>
        </section>
      </main>
      <DynamicSpotify />
      <Footer />
    </>
  );
}

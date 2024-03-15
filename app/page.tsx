import Header from '@/components/Header';
import Banner from '@/components/Banner';
import Develop from '@/components/Develop';
import styles from './page.module.css';

export default function Home() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <Banner />
        <Develop />
      </main>
    </>
  );
}

import Header from '@/components/Header';
import Banner from '@/components/Banner';
import Develop from '@/components/Develop';
import styles from './page.module.css';
import Test from '@/components/Test';
import Deploy from '@/components/Deploy';

export default function Home() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <Banner />
        <Develop />
        <Test />
        <Deploy />
      </main>
    </>
  );
}

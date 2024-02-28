import Header from '@/components/Header';
import Banner from '@/components/Banner';

import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <Header />
      <Banner />
    </main>
  );
}

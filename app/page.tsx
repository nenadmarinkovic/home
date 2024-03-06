import Header from '@/components/Header';
import Banner from '@/components/Banner';

import styles from './page.module.css';
import Text from '@/components/Text';

export default function Home() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <Banner />
        <Text />
      </main>
    </>
  );
}

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
        title="Contact"
        paragraphText="Feel free to get in touch with me through the form below or by sending an email. I would love to hear from you and discuss any inquiries, collaborations, or opportunities you may have."
      />
      <section className={styles.contentContainer}>
        <Container>nenadmarinkovic@protonmail.com</Container>
      </section>

      <Footer />
    </>
  );
}

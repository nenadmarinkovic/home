import Header from '@/components/Header';
import Banner from '@/components/Banner';
import Container from '@/containers/Container';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';
import Form from '@/components/Form';

import styles from '../../styles/pages/layout.module.css';
import contactStyles from '../../styles/pages/contact.module.css';

const DynamicSpotify = dynamic(() => import('@/components/Spotify'));

export default function Contact() {
  return (
    <>
      <Header />
      <Banner
        title="Contact"
        paragraphText="Feel free to get in touch with me. I would love to hear from you and discuss any inquiries, collaborations, or opportunities you may have. I'll give my best to get back to you in less than 48 hours."
      />
      <section
        className={`${styles.contentContainer} ${contactStyles.contactPage}`}
      >
        <Container>
          <div className={styles.contentFlex}>
            <ul className={contactStyles.info}>
              <span className={contactStyles.text}>
                You can contact me directly or through the form.
              </span>
              <span className={contactStyles.value}>
                +43 6705583282
              </span>
              <span className={contactStyles.value}>
                <a
                  href="mailto:nenadmarinkovic@protonmail"
                  aria-label="Email"
                >
                  nenadmarinkovic@protonmail.com
                </a>
              </span>
            </ul>
            <div className={styles.contentSection}>
              <Form />
            </div>
          </div>
        </Container>
      </section>
      <DynamicSpotify />
      <Footer />
    </>
  );
}

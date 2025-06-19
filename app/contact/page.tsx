import Header from '@/components/Header';
import Banner from '@/components/Banner';
import Container from '@/containers/Container';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';
import Form from '@/components/Form';

import styles from '../../styles/pages/layout.module.css';
import contactStyles from '../../styles/pages/contact.module.css';
import FormProcess from '@/components/FormProcess';

const DynamicSpotify = dynamic(() => import('@/components/Spotify'));

export default function Contact() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <Banner
          title="Contact"
          paragraphText="Feel free to get in touch with me. I would love to hear from you and discuss any inquiries, collaborations, or opportunities you may have. Contact me directly or through the form below."
        />
        <section
          className={`${styles.contentContainer} ${contactStyles.contactPage}`}
        >
          <Container>
            <div className={contactStyles.contactWrap}>
              <span></span>
              <span className={contactStyles.text}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span className={contactStyles.valueName}>
                  Email:
                </span>

                <a
                  className={contactStyles.value}
                  href="mailto:nenadmarinkovic@protonmail.com"
                >
                  nenadmarinkovic@protonmail.com
                </a>
              </span>
              <span className={contactStyles.text}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span className={contactStyles.valueName}>
                  Phone:
                </span>
                <a
                  className={contactStyles.value}
                  href="tel:+436705583282"
                >
                  +436705583282
                </a>
              </span>
            </div>
            <div className={styles.contentFlex}>
              <FormProcess
                steps={[
                  {
                    number: 1,
                    title: 'Tell me about your project',
                    text: 'Free consultation call to discuss your project.',
                  },
                  {
                    number: 2,
                    title: 'Proposal',
                    text: 'Receive a fixed-price offer within 3 days.',
                  },
                  {
                    number: 3,
                    title: 'Development',
                    text: 'Regular updates during the project.',
                  },
                  {
                    number: 4,
                    title: 'Feedback',
                    text: 'Adjustments based on your feedback.',
                  },
                  {
                    number: 5,
                    title: 'Launch and support',
                    text: 'Launch and ongoing support.',
                  },
                ]}
              />
              <div className={styles.contentSection}>
                <Form />
              </div>
            </div>
          </Container>
        </section>
      </main>

      <DynamicSpotify />
      <Footer />
    </>
  );
}

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
      <Banner
        title="Contact"
        paragraphText="Feel free to get in touch with me. I would love to hear from you and discuss any inquiries, collaborations, or opportunities you may have."
      />
      <section
        className={`${styles.contentContainer} ${contactStyles.contactPage}`}
      >
        <Container>
          <div className={styles.contentFlex}>
            <FormProcess
              steps={[
                {
                  number: 1,
                  title: 'Tell me about your project',
                  text: 'Free 30-minute consultation call.',
                },
                {
                  number: 2,
                  title: 'Proposal',
                  text: 'Receive a fixed-price offer and launch date within 5 days.',
                },
                {
                  number: 3,
                  title: 'Development begins',
                  text: 'Regular updates during the project.',
                },
                {
                  number: 4,
                  title: 'Feedback & corrections',
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
      <DynamicSpotify />
      <Footer />
    </>
  );
}

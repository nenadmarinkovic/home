import SectionHeader from './Section';
import Container from '@/containers/Container';
import Link from 'next/link';
import stylesButton from '../styles/components/Button.module.css';

import styles from '../styles/components/Contact.module.css';

function Contact() {
  return (
    <div className={styles.contactContainer}>
      <Container>
        <SectionHeader
          header="Contact"
          title="Contact me for inquiries or project proposals"
          text="I'm always looking for new opportunities to collaborate. Feel free to reach out to me for any inquiries or project proposals."
        />
        <Link href="/contact">
          <button className={stylesButton.button}>Contact</button>
        </Link>
      </Container>
    </div>
  );
}

export default Contact;

import React from 'react';
import SectionHeader from './Section';

import styles from '../styles/components/Contact.module.css';
import stylesButton from '../styles/components/Button.module.css';

import Container from '@/containers/Container';
import Link from 'next/link';

function Contact() {
  return (
    <div className={styles.contactContainer}>
      <Container>
        <SectionHeader
          header="Contact"
          title="Contact me for inquiries or project proposals"
          text="I'm always looking for new opportunities to collaborate. Feel free to reach out to me for any inquiries or project proposals."
        />
        <button className={stylesButton.button}>
          <Link href="/contact">Contact me</Link>
        </button>
      </Container>
    </div>
  );
}

export default Contact;

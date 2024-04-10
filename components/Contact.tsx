import React, { useState } from 'react';
import SectionHeader from './Section';

import styles from '../styles/components/Contact.module.css';
import stylesButton from '../styles/components/Button.module.css';

import Container from '@/containers/Container';

function Contact() {
  return (
    <div className={styles.contactContainer}>
      <Container>
        <SectionHeader
          header="Contact"
          title="Contact me for inquiries or project proposals"
          text="I'm always looking for new opportunities to collaborate. Feel free to reach out to me for any inquiries or project proposals."
        />
        <button className={stylesButton.button}>Contact</button>
      </Container>
    </div>
  );
}

export default Contact;

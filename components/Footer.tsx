import React from 'react';
import styles from '../styles/components/Footer.module.css';
import Container from '@/containers/Container';

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <div className={styles.footerContainer}>
      <div className={styles.footerBackground}></div>
      <Container>
        <span className={styles.text}>
          {currentYear} © Nenad Marinković
        </span>
      </Container>
    </div>
  );
}

export default Footer;

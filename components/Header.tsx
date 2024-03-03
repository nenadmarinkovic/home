import React from 'react';

import styles from '../styles/components/Header.module.css';
import Container from '@/containers/Container';

export default function Header() {
  return (
    <div className={styles.header}>
      <Container>
        <div>Nenad Marinković</div>
      </Container>
    </div>
  );
}

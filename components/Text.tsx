import React from 'react';

import styles from '../styles/components/Text.module.css';
import Container from '@/containers/Container';

export default function Text() {
  return (
    <section>
      <Container>
        <div className={styles.container}>ABC</div>
      </Container>
    </section>
  );
}

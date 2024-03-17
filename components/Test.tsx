import React from 'react';
import TestChart from './TestChart.';
import Container from '@/containers/Container';
import styles from '../styles/components/Test.module.css';

function Test() {
  return (
    <Container>
      <div className={styles.test_container}>
        <TestChart />
      </div>
    </Container>
  );
}

export default Test;

import React from 'react';
import DeployChart from './DeployChart';
import Container from '@/containers/Container';
import styles from '../styles/components/Deploy.module.css';

function Deploy() {
  return (
    <Container>
      <div className={styles.deploy_container}>
        <DeployChart />
      </div>
    </Container>
  );
}

export default Deploy;

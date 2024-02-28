import React from 'react';

import styles from '../styles/components/Banner.module.css';

export default function Banner() {
  return (
    <>
      <div className={styles.banner}>
        I build <span className={styles.linear}>websites</span>
        <br /> web interfaces
        <br />
        and apps.
      </div>
      <div className={styles.grid}></div>
    </>
  );
}

import React from 'react';

import styles from '../styles/components/Banner.module.css';
import Image from 'next/image';

export default function Banner() {
  return (
    <>
      <div className={styles.banner}>
        I build <span className={styles.linear}>websites</span>
        <br /> web interfaces
        <br />
        and apps.
      </div>
      <div className={styles.grid}>
        <Image src="/grid.svg" alt="Grid" priority={true} fill />
      </div>
    </>
  );
}

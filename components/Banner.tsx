'use client';
import React, { useEffect } from 'react';

import styles from '../styles/components/Banner.module.css';
import Image from 'next/image';

export default function Banner() {
  return (
    <>
      <div className={styles.banner}>
        <h1 className={styles.banner_text}>
          <span className={styles.banner_text_top}>
            I build <span className={styles.linear}>websites</span>,{' '}
          </span>
          <span className={styles.banner_text_middle}>
            web interfaces
          </span>
          <span className={styles.banner_text_bottom}>
            {' '}
            and apps.
          </span>
        </h1>
        <p className={styles.banner_paragraph}>
          Front-end developer at nexxar in Vienna, Austria.
          Experienced in designing and developing websites, web
          interfaces, and APIs, with a versatile skill set in various
          web technologies.
        </p>
        <div className={styles.triangle}></div>
        <div className={styles.circle}></div>
        <div className={styles.square}></div>
        <button className={styles.button}>Contact</button>
      </div>
      <div className={styles.grid}>
        <Image
          className={styles.grid_image}
          src="/grid.svg"
          alt="Grid"
          priority={true}
          fill
        />
      </div>
    </>
  );
}

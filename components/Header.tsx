import React from 'react';

import styles from '../styles/components/Header.module.css';
import Container from '@/containers/Container';
import Link from 'next/link';

export default function Header() {
  return (
    <div className={styles.header}>
      <Container>
        <div className={styles.header_inside}>
          <div>Nenad Marinković</div>
          <nav>
            <ul className={styles.header_ul}>
              <li className={styles.header_li}>
                <Link href="/about">Projects</Link>
              </li>
              <li className={styles.header_li}>
                <Link href="/about">Directory</Link>
              </li>
              <li className={styles.header_li}>
                <Link href="/about">About</Link>
              </li>
              <li className={styles.header_li}>
                <Link href="/about">Contact</Link>
              </li>
            </ul>
          </nav>
        </div>
      </Container>
    </div>
  );
}

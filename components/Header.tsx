'use client';
import React, { useState, useEffect } from 'react';
import Container from '@/containers/Container';
import Link from 'next/link';

import styles from '../styles/components/Header.module.css';

export default function Header() {
  const [isFixed, setIsFixed] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const shouldHideHeader =
        scrollPosition >= 115 && scrollPosition <= 1000;
      const shouldFixHeader = scrollPosition > 1001;

      setIsFixed(shouldFixHeader);
      setIsHidden(shouldHideHeader);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={`${styles.header} ${isFixed && styles.fixed} ${
        isHidden && styles.hidden
      } `}
    >
      <Container>
        <div className={styles.headerInside}>
<<<<<<< HEAD
          <div className={styles.homelink}>
            <Link href="/">Nenad Marinković</Link>
          </div>
=======
          <div className={styles.homelink}>Nenad Marinković</div>
>>>>>>> 5dde058b2d476e232491e4786c127f4df43884de
          <nav>
            <ul className={styles.headerUnorderedList}>
              <li className={styles.headerList}>
                <Link href="/dir">Directory</Link>
              </li>
              <li className={styles.headerList}>
                <Link href="/about">About</Link>
              </li>
              <li className={styles.headerList}>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </nav>
        </div>
      </Container>
    </header>
  );
}

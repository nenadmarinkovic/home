'use client';

import { useState, useEffect } from 'react';
import styles from '../styles/components/Header.module.css';
import Container from '@/containers/Container';
import Link from 'next/link';

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
        <div className={styles.header_inside}>
          <div className={styles.homelink}>Nenad Marinković</div>
          <nav>
            <ul className={styles.header_ul}>
              <li className={styles.header_li}>
                <Link href="/">Projects</Link>
              </li>
              <li className={styles.header_li}>
                <Link href="/">Directory</Link>
              </li>
              <li className={styles.header_li}>
                <Link href="/">About</Link>
              </li>
              <li className={styles.header_li}>
                <Link href="/">Contact</Link>
              </li>
            </ul>
          </nav>
        </div>
      </Container>
    </header>
  );
}

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
        <div className={styles.headerInside}>
          <div className={styles.homelink}>Nenad Marinković</div>
          <nav>
            <ul className={styles.headerUnorderedList}>
              <li className={styles.headerList}>
                <Link href="/">Directory</Link>
              </li>
              <li className={styles.headerList}>
                <Link href="/">Now</Link>
              </li>
              <li className={styles.headerList}>
                <Link href="/">Uses</Link>
              </li>
              <li className={styles.headerList}>
                <Link href="/">About</Link>
              </li>
              <li className={styles.headerList}>
                <Link href="/">Contact</Link>
              </li>
            </ul>
          </nav>
        </div>
      </Container>
    </header>
  );
}

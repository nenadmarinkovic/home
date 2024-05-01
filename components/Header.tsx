'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Container from '@/containers/Container';
import Link from 'next/link';
import styles from '../styles/components/Header.module.css';

export default function Header() {
  const [isFixed, setIsFixed] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const pathname = usePathname();

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
    <div>
      <header
        className={`${styles.header} ${isFixed && styles.fixed} ${
          isHidden && styles.hidden
        } `}
      >
        <Container>
          <div className={styles.headerInside}>
            <div
              className={`${styles.homeLink} ${
                pathname === '/' && `${styles.activePage}`
              }`}
            >
              <Link href="/">Nenad Marinković</Link>
            </div>
            <nav>
              <ul className={styles.headerUnorderedList}>
                <li
                  className={`${styles.headerList} ${
                    pathname.startsWith('/dir') &&
                    `${styles.activePage}`
                  }`}
                >
                  <Link href="/dir">Directory</Link>
                </li>
                <li
                  className={`${styles.headerList} ${
                    pathname === '/about' && `${styles.activePage}`
                  }`}
                >
                  <Link href="/about">About</Link>
                </li>
                <li
                  className={`${styles.headerList} ${
                    pathname === '/contact' && `${styles.activePage}`
                  }`}
                >
                  <Link href="/contact">Contact</Link>
                </li>
              </ul>
            </nav>
          </div>
        </Container>
      </header>
    </div>
  );
}

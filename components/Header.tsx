'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Container from '@/containers/Container';
import Link from 'next/link';
import styles from '../styles/components/Header.module.css';

export default function Header() {
  const [isFixed, setIsFixed] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  const toggleOverlay = (event: any) => {
    event.stopPropagation();
    setOverlayVisible((prev) => !prev);
  };

  const handleClickOutside = (event: any) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target)
    ) {
      setOverlayVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const originalOverflowY = document.body.style.overflowY;
    const originalPaddingRight = document.body.style.paddingRight;
    const mainElement = document.querySelector('main');
    const footer = document.querySelector('footer');

    if (isOverlayVisible) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflowY = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      if (mainElement && footer) {
        mainElement.classList.add('blurred');
        footer.classList.add('blurred');
      }
    } else {
      document.body.style.overflowY = originalOverflowY;
      document.body.style.paddingRight = originalPaddingRight;
      if (mainElement && footer) {
        mainElement.classList.remove('blurred');
        footer.classList.remove('blurred');
      }
    }

    return () => {
      document.body.style.overflowY = originalOverflowY;
      document.body.style.paddingRight = originalPaddingRight;
      if (mainElement && footer) {
        mainElement.classList.remove('blurred');
        footer.classList.remove('blurred');
      }
    };
  }, [isOverlayVisible]);

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
            <nav className={styles.navigation}>
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
                    pathname.startsWith('/feed') &&
                    `${styles.activePage}`
                  }`}
                >
                  <Link href="/feed">Feed</Link>
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
      <button
        ref={buttonRef}
        onClick={(e) => toggleOverlay(e)}
        className={styles.menuButton}
        aria-label="Menu"
      >
        {isOverlayVisible ? (
          <svg
            className={styles.menuSvg}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        ) : (
          <svg
            className={styles.menuSvg}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        )}
      </button>
      {isOverlayVisible && (
        <div
          ref={menuRef}
          className={`${styles.overlay} ${
            isOverlayVisible ? styles.active : ''
          }`}
        >
          <nav>
            <ul className={styles.mobileNav}>
              <li
                className={`${styles.mobileLi} ${
                  pathname !== '/' && styles.notHome
                }`}
              >
                <Link href="/">Home</Link>
              </li>
              <li
                className={`${styles.mobileLi} ${
                  pathname !== '/' && styles.notHome
                }`}
              >
                <Link href="/dir">Directory</Link>
              </li>
              <li
                className={`${styles.mobileLi} ${
                  pathname !== '/' && styles.notHome
                }`}
              >
                <Link href="/feed">Feed</Link>
              </li>
              <li
                className={`${styles.mobileLi} ${
                  pathname !== '/' && styles.notHome
                }`}
              >
                <Link href="/about">About</Link>
              </li>

              <li
                className={`${styles.mobileLi} ${
                  pathname === '/' && styles.home
                }`}
              >
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}

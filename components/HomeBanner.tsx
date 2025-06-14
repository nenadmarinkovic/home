import Banner from './Banner';
import Link from 'next/link';

import stylesButton from '../styles/components/Button.module.css';

function HomeBanner() {
  return (
    <Banner
      title="I make"
      highlightedText="websites"
      additionalText=" and other web products."
      paragraphText={
        <>
          Hi, I&apos;m Nenad — a frontend developer at nexxar in
          Vienna, where I develop digital reports for clients around
          the world. As a side project, I&apos;m building Redirectory,
          a personal management application designed to redirect your
          focus to what matters.
        </>
      }
    >
      <div className={stylesButton.info}>
        <Link href="/contact">
          <button className={stylesButton.button}>Contact</button>
        </Link>
        <Link className={stylesButton.more} href="/about">
          More about me
        </Link>
      </div>
    </Banner>
  );
}

export default HomeBanner;

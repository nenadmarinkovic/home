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
          I&apos;m Nenad, a software developer in Vienna who
          specializes in building high-performance websites and
          applications. I&apos;m currently looking for my next role
          and exploring new technologies through several side
          projects.
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

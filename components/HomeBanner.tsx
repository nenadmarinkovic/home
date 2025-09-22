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
          I&apos;m Nenad, a Vienna-based software developer with
          expertise in building high-performance websites and web
          applications. I&apos;m currently developing several personal
          projects using the latest web technologies. Currently open
          to new roles and projects.
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

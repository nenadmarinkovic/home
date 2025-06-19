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
          Hi, I&apos;m Nenad — a software developer based in Vienna.
          Currently, I&apos;m building my own web development studio
          while actively working on several side projects that combine
          creativity and technology.
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

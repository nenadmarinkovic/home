import Header from '@/components/Header';
import Banner from '@/components/Banner';
import Container from '@/containers/Container';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';
import Image from 'next/image';

import styles from '../../styles/pages/layout.module.css';

const DynamicSpotify = dynamic(() => import('@/components/Spotify'));

export default function About() {
  const birth = new Date(2025, 1, 1);
  const currentDate = new Date();
  const ageInMonths =
    (currentDate.getFullYear() - birth.getFullYear()) * 12 +
    (currentDate.getMonth() - birth.getMonth());

  const years = Math.floor(ageInMonths / 12);
  const months = ageInMonths % 12;

  let ageString;

  if (years > 0) {
    const yearText = years > 1 ? 'years' : 'year';
    if (months > 0) {
      const monthText = months > 1 ? 'months' : 'month';
      ageString = `${years} ${yearText} and ${months} ${monthText}`;
    } else {
      ageString = `${years} ${yearText}`;
    }
  } else {
    ageString = `${months} months`;
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <Banner
          title="About"
          paragraphText="I build modern, high-performance websites and web applications using React and Vue. I'm passionate about web development and enjoy the process of turning complex challenges into clean, creative, and user-friendly digital experiences."
        />
        <section className={styles.contentContainer}>
          <Container>
            <div className={styles.aboutFlex}>
              <div className={styles.contentList}>
                <div className={styles.photoContainer}>
                  <Image
                    src="/images/photo.webp"
                    alt="Nenad Marinković"
                    width={210}
                    height={210}
                    className={styles.photo}
                  />
                </div>
                <ul className={styles.profileInfoItems}>
                  <li className={styles.profileInfoItem}>
                    <span className={styles.profileInfoValue}>
                      JavaScript, React, Node.js
                    </span>
                    <span className={styles.profileInfoKey}>
                      Core Tech Stack
                    </span>
                  </li>
                  <li className={styles.profileInfoItem}>
                    <span className={styles.profileInfoValue}>
                      {new Date().getFullYear() - 2018} years
                    </span>
                    <span className={styles.profileInfoKey}>
                      Experience
                    </span>
                  </li>
                  <li className={styles.profileInfoItem}>
                    <span className={styles.profileInfoValue}>
                      Vienna, Austria
                    </span>
                    <span className={styles.profileInfoKey}>
                      Location
                    </span>
                  </li>
                </ul>
              </div>
              <div className={styles.contentSection}>
                <h3>About me</h3>
                <p>
                  For the past seven years, I&apos;ve had the
                  opportunity to work with a diverse range of clients,
                  from creative agencies to tech startups and large
                  corporations, to develop well-designed, fast, and
                  user-friendly websites and applications.
                </p>
                <p>
                  My career began at the web agency{' '}
                  <a
                    href="https://www.popwebdesign.net/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link"
                  >
                    PopArt Studio
                  </a>{' '}
                  in Novi Sad, Serbia, where I built custom websites
                  and gained a strong foundation by collaborating
                  closely with project managers and the design team.
                </p>
                <p>
                  After moving to Vienna, I worked with different
                  companies such as{' '}
                  <a
                    href="https://www.dccs.at/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link"
                  >
                    DCCS{' '}
                  </a>
                  , where our team developed the Techem Kundenportal,
                  a complex web application using Vue.js and Java for
                  energy consumption billing and management. My most
                  recent role was as a Frontend Developer at{' '}
                  <a
                    href="https://www.nexxar.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link"
                  >
                    nexxar
                  </a>
                  , creating digital annual reports for major
                  international clients such as Johnson & Johnson,
                  Volkswagen, and OMV.
                </p>
                <p>
                  In addition to my full-time roles, I&apos;ve worked
                  as a freelancer with various startups and clients
                  worldwide, mostly with a modern tech stack that
                  includes React and Next.js to deliver high-quality
                  web solutions.
                </p>

                <div className={styles.contentQuote}>
                  <svg
                    width="30px"
                    height="30px"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.quoteIcon}
                  >
                    <rect x="0" fill="none" width="24" height="24" />
                    <g>
                      <path
                        fill="#a1e158"
                        d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.956.76-3.022.66-1.065 1.515-1.867 2.558-2.403L9.373 5c-.8.396-1.56.898-2.26 1.505-.71.607-1.34 1.305-1.9 2.094s-.98 1.68-1.25 2.69-.346 2.04-.217 3.1c.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l.002.003zm9.124 0c0-.88-.23-1.618-.69-2.217-.326-.42-.77-.692-1.327-.817-.56-.124-1.074-.13-1.54-.022-.16-.94.09-1.95.75-3.02.66-1.06 1.514-1.86 2.557-2.4L18.49 5c-.8.396-1.555.898-2.26 1.505-.708.607-1.34 1.305-1.894 2.094-.556.79-.97 1.68-1.24 2.69-.273 1-.345 2.04-.217 3.1.165 1.4.615 2.52 1.35 3.35.732.833 1.646 1.25 2.742 1.25.967 0 1.768-.29 2.402-.876.627-.576.942-1.365.942-2.368v.01z"
                      />
                    </g>
                  </svg>
                  <p>
                    It is a true pleasure working with Nenad. He
                    successfully implemented our new branding and web
                    design into our new and lightning-fast website.
                    Nenad is thorough, highly skilled, communicative
                    and a pleasure to work with!
                  </p>
                  <span className={styles.contentPerson}>
                    <span className={styles.contentPersonName}>
                      — Håkon Kalbakk
                    </span>
                    <span className={styles.contentPersonPosition}>
                      Founder of{' '}
                      <a
                        href="https://www.modulize.io/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link"
                      >
                        Modulize
                      </a>
                    </span>
                  </span>
                </div>

                <p>
                  I&apos;m currently looking for my next opportunity
                  to join a great team and help build outstanding
                  products. While I search for the right fit, I remain
                  hands-on with personal projects that allow me to
                  experiment with the latest web technologies.
                </p>
                <div className={styles.contentQuote}>
                  <svg
                    width="30px"
                    height="30px"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.quoteIcon}
                  >
                    <rect x="0" fill="none" width="24" height="24" />
                    <g>
                      <path
                        fill="#a1e158"
                        d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.1-1.956.76-3.022.66-1.065 1.515-1.867 2.558-2.403L9.373 5c-.8.396-1.56.898-2.26 1.505-.71.607-1.34 1.305-1.9 2.094s-.98 1.68-1.25 2.69-.346 2.04-.217 3.1c.168 1.4.62 2.52 1.356 3.35.735.84 1.652 1.26 2.748 1.26.965 0 1.766-.29 2.4-.878.628-.576.94-1.365.94-2.368l.002.003zm9.124 0c0-.88-.23-1.618-.69-2.217-.326-.42-.77-.692-1.327-.817-.56-.124-1.074-.13-1.54-.022-.16-.94.09-1.95.75-3.02.66-1.06 1.514-1.86 2.557-2.4L18.49 5c-.8.396-1.555.898-2.26 1.505-.708.607-1.34 1.305-1.894 2.094-.556.79-.97 1.68-1.24 2.69-.273 1-.345 2.04-.217 3.1.165 1.4.615 2.52 1.35 3.35.732.833 1.646 1.25 2.742 1.25.967 0 1.768-.29 2.402-.876.627-.576.942-1.365.942-2.368v.01z"
                      />
                    </g>
                  </svg>
                  <p>
                    Nenad is a world class developer. Amazing
                    communicator, very thorough in his work, and his
                    code is outstanding.
                  </p>
                  <span className={styles.contentPerson}>
                    <span className={styles.contentPersonName}>
                      — Toni Gemayel
                    </span>
                    <span className={styles.contentPersonPosition}>
                      Founder of{' '}
                      <a
                        href="https://www.wagerapi.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link"
                      >
                        Wager API
                      </a>
                    </span>
                  </span>
                </div>
                <p>
                  When I&apos;m not coding, I&apos;m usually spending
                  time with my wife and our {ageString} old daughter.
                  We live in the 2nd district and love taking long
                  walks on the Donauinsel, enjoying a bit of nature in
                  the heart of Vienna.
                </p>

                <h3>About this website</h3>
                <p>
                  This website was built with Next.js and serves as my
                  personal digital space. It integrates several APIs:
                  GitHub for project data, Spotify for the &apos;Now
                  Playing&apos; feature, Resend for email delivery,
                  and Notion for content management. The entire
                  codebase is open-source and available on{' '}
                  <a
                    href="https://github.com/nenadmarinkovic/home"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link"
                  >
                    GitHub
                  </a>
                  .
                </p>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <DynamicSpotify />
      <Footer />
    </>
  );
}

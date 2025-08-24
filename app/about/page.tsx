import Header from '@/components/Header';
import Banner from '@/components/Banner';
import Container from '@/containers/Container';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';
import Image from 'next/image';

import styles from '../../styles/pages/layout.module.css';

const DynamicSpotify = dynamic(() => import('@/components/Spotify'));

export default function About() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <Banner
          title="About"
          paragraphText="My expertise lies in building websites and web interfaces using modern technologies like React and Vue. I find great joy in the field of web development — it’s a journey filled with challenges, constant learning, and the chance to bring a creative touch to each project."
        />
        <section className={styles.contentContainer}>
          <Container>
            <div className={styles.contentFlex}>
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
                  Throughout the past few years, I have worked with
                  many web agencies and software companies building
                  well designed, fast, and delightful user websites
                  and applications. During this time, I continuously
                  refined my craft by developing adaptable components,
                  reusable UI elements, and scalable frontend
                  architectures. I also had the opportunity to work
                  with a variety of clients, from small startups to
                  large corporations, which helped me to understand
                  the importance of clear communication and
                  collaboration.
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
                      Founder of Modulize
                    </span>
                  </span>
                </div>

                <p>
                  I&apos;m currently seeking my next role and am open
                  to new opportunities. While I search for the right
                  team to join, I&apos;m staying busy with several
                  side projects that allow me to explore new
                  technologies.
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
                      Founder of Wager API
                    </span>
                  </span>
                </div>
                <p>
                  Outside of work, I’m improving my German and
                  spending time with my wife and our newborn daughter.
                </p>

                <h3>About this website</h3>
                <p>
                  This site is built with Next.js as a place for me to
                  share projects and ideas. It uses a few APIs to pull
                  in data: GitHub for project information, Spotify for
                  the &quot;Now Playing&quot; widget, Resend for
                  email, and Notion as a content management system.
                  The entire codebase is open-source on{' '}
                  <a
                    href="https://github.com/nenadmarinkovic/home"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link"
                  >
                    GitHub
                  </a>{' '}
                  if you&quot;d like to see how it works.
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

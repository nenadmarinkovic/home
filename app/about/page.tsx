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
                    {new Date().getFullYear() - 2018} years
                  </span>
                  <span className={styles.profileInfoKey}>
                    Experience
                  </span>
                </li>
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
                    Vienna
                  </span>
                  <span className={styles.profileInfoKey}>
                    Location
                  </span>
                </li>
                <li className={styles.profileInfoItem}>
                  <span className={styles.profileInfoValue}>
                    English, German, Serbian
                  </span>
                  <span className={styles.profileInfoKey}>
                    Languages
                  </span>
                </li>
              </ul>
            </div>
            <div className={styles.contentSection}>
              <h3>Some text here</h3>
              <p>
                In my most recent role, I had the opportunity to work
                at DCCS software company. Here, I contributed to the
                development of a web application for helping residents
                and property owners to have insights into their energy
                consumption. During this project, I acquired extensive
                expertise in constructing adaptable front-end
                components using Vue.js, all within a framework of
                agile SCRUM methodology. This experience further
                solidified my skills in building scalable software
                solutions.
              </p>
              <p>
                Before that, I worked at various web agencies, where I
                specialized in crafting e-commerce websites, content
                management systems, and marketing websites. These
                experiences were invaluable in terms of collaborating
                closely with designers and clients, both in my home
                country of Serbia and in Austria.
              </p>
              <h3>Some text here</h3>
              <p>
                Outside of my work-related responsibilities, I have a
                genuine interest in contributing to whenever I can. I
                also take pleasure in developing my own projects ,
                primarily using React and TypeScript. Developing them
                offers me the freedom to experiment with design, or
                just to test different approaches and technologies,
                which is always fun thing to do.
              </p>
              <p>
                Over a decade ago, I studied sociology and political
                sciences, gaining insights into human societies and
                political systems. This background shaped my
                understanding of societal dynamics and their
                connection to technology.
              </p>
              <h3>Some text here</h3>
              <p>
                Outside of work, I’m also dedicated to learning German
                and Go programming language. I also find pleasure in
                exploring the beautiful city of Vienna. Whenever the
                opportunity arises, I like to travel or go hiking,
                occasionally seizing moments to capture the beauty of
                my journeys through .
              </p>
              <p>
                Lorem, ipsum dolor sit amet consectetur adipisicing
                elit. Velit dolores natus molestias quae laudantium
                temporibus eum illo odit excepturi a fugit distinctio,
                impedit, consequatur corporis error dignissimos ut?
                Omnis, voluptatum!
              </p>
              <p>
                If you’re in the area and up for hanging out, or want
                to discuss a project, feel free to reach out to me.
              </p>
            </div>
          </div>
        </Container>
      </section>
      <DynamicSpotify />
      <Footer />
    </>
  );
}

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
            <ul className={styles.contentList}>
              <div className={styles.photoContainer}>
                <Image
                  src="/images/photo.webp"
                  alt="Nenad Marinković"
                  width={210}
                  height={210}
                  className={styles.photo}
                />
              </div>
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
                Lorem ipsum dolor sit, amet consectetur adipisicing
                elit. Vel nobis sequi illum alias ratione, dignissimos
                est nostrum temporibus veniam inventore consequatur
                modi dolorem dicta, unde nesciunt. Repellendus
                obcaecati dolor nobis.
              </p>
            </ul>
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

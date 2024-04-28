import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

import CustomMDX from '@/components/Markdown';
import Banner from '@/components/Banner';
import Header from '@/components/Header';
import Container from '@/containers/Container';
import Footer from '@/components/Footer';
import Spotify from '@/components/Spotify';

import styles from '../../../styles/pages/layout.module.css';

export async function generateStaticParams() {
  const files = fs.readdirSync(path.join('directory'));

  const paths = files.map((filename) => ({
    slug: filename.replace('.mdx', ''),
  }));

  return paths;
}

function getPost({ slug }: { slug: string }) {
  const markdownFile = fs.readFileSync(
    path.join('directory', slug + '.mdx'),
    'utf-8'
  );

  const { data: fontMatter, content } = matter(markdownFile);

  return {
    fontMatter,
    slug,
    content,
  };
}

export default function Page({ params }: any) {
  const props = getPost(params);

  return (
    <>
      <Header />
      <Banner
        title={props.fontMatter.title}
        paragraphText={props.fontMatter.description}
      />
      <section className={styles.contentContainer}>
        <div className={styles.content}>
          <Container>
            <CustomMDX source={props.content}></CustomMDX>
          </Container>
        </div>
      </section>
      <Spotify />
      <Footer />
    </>
  );
}

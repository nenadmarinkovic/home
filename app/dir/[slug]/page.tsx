import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import CustomMDX from '@/components/Markdown';
import Banner from '@/components/Banner';
import Header from '@/components/Header';
import Container from '@/containers/Container';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';

import styles from '../../../styles/pages/layout.module.css';

const DynamicSpotify = dynamic(() => import('@/components/Spotify'));

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

  const headings = props.fontMatter.headings;

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
            <ul>
              {headings &&
                headings.map((heading: string, index: number) => {
                  const id = heading
                    .toLowerCase()
                    .replace(/\s+/g, '-');
                  return (
                    <li key={index}>
                      <a href={`#${id}`}>{heading}</a>
                    </li>
                  );
                })}
            </ul>
            <CustomMDX source={props.content}></CustomMDX>
          </Container>
        </div>
      </section>
      <DynamicSpotify />
      <Footer />
    </>
  );
}

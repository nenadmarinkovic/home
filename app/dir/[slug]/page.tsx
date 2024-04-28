import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Banner from '@/components/Banner';
import Header from '@/components/Header';
import Container from '@/containers/Container';
import Footer from '@/components/Footer';
import Spotify from '@/components/Spotify';
import CustomMDX from '@/components/Markdown';
import styles from '../../../styles/pages/layout.module.css';

export function useGenerateStaticParams() {
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

export default function DirPage({ params }: any) {
  const props = getPost(params);

  return (
    <>
      <Header />
      <span></span>
      <Banner
        title={props.fontMatter.title}
        paragraphText={props.fontMatter.description}
      />
      <div className={styles.content}>
        <Container>
          <CustomMDX source={props.content} />
        </Container>
      </div>
      <Spotify />
      <Footer />
    </>
  );
}

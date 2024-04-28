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

import dirStyles from '../../../styles/pages/dir.module.css';

const POSTS_PATH = path.join(process.cwd(), 'directory');

const postFilePaths = fs
  .readdirSync(POSTS_PATH)
  .filter((path) => /\.mdx?$/.test(path));

export async function generateStaticParams() {
  const paths = postFilePaths.map((filePath) => ({
    slug: filePath.replace('.mdx', ''),
  }));

  return paths;
}

function getPost({ slug }: { slug: string }) {
  const markdownFile = fs.readFileSync(
    path.join(POSTS_PATH, slug + '.mdx'),
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
  const props = getPost({ slug: params.slug });

  return (
    <>
      <Header />
      <Banner
        title={props.fontMatter.title}
        paragraphText={props.fontMatter.description}
      />
      <div className={dirStyles.dirContainer}>
        <div className={styles.content}>
          <Container>
            <CustomMDX source={props.content} />
          </Container>
        </div>
      </div>
      <Spotify />
      <Footer />
    </>
  );
}

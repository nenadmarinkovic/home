import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

import { MDXRemote } from 'remote-mdx/rsc';
<<<<<<< HEAD
import Banner from '@/components/Banner';
import Header from '@/components/Header';
import Container from '@/containers/Container';

import styles from '../../../styles/pages/layout.module.css';
=======
>>>>>>> 5dde058b2d476e232491e4786c127f4df43884de

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
<<<<<<< HEAD
    <>
      <Header />
      <Banner
        title={props.fontMatter.title}
        paragraphText={props.fontMatter.description}
      />
      <div className={styles.content}>
        <Container>
          <MDXRemote source={props.content}></MDXRemote>
        </Container>
      </div>
    </>
=======
    <article>
      <h1>{props.fontMatter.title}</h1>
      <MDXRemote source={props.content}></MDXRemote>
    </article>
>>>>>>> 5dde058b2d476e232491e4786c127f4df43884de
  );
}

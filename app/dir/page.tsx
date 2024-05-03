import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Banner from '@/components/Banner';
import Container from '@/containers/Container';
import Footer from '@/components/Footer';
import Tag from '@/components/Tag';

import styles from '../../styles/pages/layout.module.css';

const DynamicSpotify = dynamic(() => import('@/components/Spotify'));

export default function Home() {
  const postDir = 'directory';

  const files = fs.readdirSync(path.join(postDir));

  const posts = files.map((filename) => {
    const fileContent = fs.readFileSync(
      path.join(postDir, filename),
      'utf-8'
    );

    const { data: frontMatter } = matter(fileContent);
    return {
      meta: frontMatter,
      slug: filename.replace('.mdx', ''),
    };
  });

  const tags = Array.from(
    new Set(posts.map((post) => post.meta.tag))
  );

  return (
    <>
      <Header />
      <Banner
        title="Directory"
        paragraphText="Web directory for notes, bookmarks, resources, and the things I’m interested in. All the content is open-source. All the content is open-source.
For my travel photos, check out the Photography page."
      />
      <section className={styles.contentContainer}>
        <Container>
          <Suspense fallback={<div>Loading...</div>}>
            <Tag
              tags={tags}
              posts={posts.map((post) => ({
                meta: {
                  tag: post.meta.tag,
                  title: post.meta.title,
                  description: post.meta.description,
                },
                slug: post.slug,
              }))}
            />
          </Suspense>
        </Container>
      </section>
      <DynamicSpotify />
      <Footer />
    </>
  );
}

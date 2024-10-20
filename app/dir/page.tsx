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
      <main className={styles.main}>
        <Banner
          title="Directory"
          paragraphText="Web directory for notes, bookmarks, resources, and the things I’m interested in. All the content is open-source. All the content is open-source.
For my travel photos, check out the Photography page."
        />

        <section className={styles.contentContainer}>
          <Container>
            <Suspense
              fallback={
                <span className={styles.loaderContainer}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.loader}
                  >
                    <path d="M12 2v4" />
                    <path d="m16.2 7.8 2.9-2.9" />
                    <path d="M18 12h4" />
                    <path d="m16.2 16.2 2.9 2.9" />
                    <path d="M12 18v4" />
                    <path d="m4.9 19.1 2.9-2.9" />
                    <path d="M2 12h4" />
                    <path d="m4.9 4.9 2.9 2.9" />
                  </svg>
                </span>
              }
            >
              <Tag
                tags={tags}
                posts={posts.map((post) => ({
                  meta: {
                    tag: post.meta.tag,
                    date: post.meta.date,
                    title: post.meta.title,
                    description: post.meta.description,
                  },
                  slug: post.slug,
                }))}
              />
            </Suspense>
          </Container>
        </section>
      </main>

      <DynamicSpotify />
      <Footer />
    </>
  );
}

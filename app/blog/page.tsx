/* This page is also regenerated every 5 min, so list & tag changes appear. */
export const revalidate = 300;

import Header from '@/components/Header';
import Banner from '@/components/Banner';
import Container from '@/containers/Container';
import Footer from '@/components/Footer';
import Tag from '@/components/Tag';
import DynamicSpotify from '@/components/Spotify';

import { Suspense } from 'react';
import { getPosts } from '@/utils/notion';
import styles from '../../styles/pages/layout.module.css';

export default async function Home() {
  const posts = await getPosts();
  const tags = Array.from(new Set(posts.flatMap((post) => post.tag)));

  return (
    <>
      <Header />
      <main className={styles.main}>
        <Banner
          title="Blog"
          paragraphText="Web directory for notes, bookmarks, resources, and the things I’m interested in."
        />
        <section className={styles.contentContainer}>
          <Container>
            <Suspense
              fallback={
                <span className={styles.loaderContainer}>
                  Loading…
                </span>
              }
            >
              <Tag
                tags={tags}
                posts={posts.map((post) => ({
                  meta: {
                    tag: post.tag,
                    date: post.date,
                    title: post.title,
                    description: post.description,
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

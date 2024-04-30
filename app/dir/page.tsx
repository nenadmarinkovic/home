import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import Header from '@/components/Header';
import Banner from '@/components/Banner';
import Container from '@/containers/Container';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';

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

  return (
    <>
      <Header />
      <Banner
        title="Directory"
        paragraphText="Web directory for notes, bookmarks, resources, and the things I’m interested in. All the content is open-source."
      />
      <section className={styles.contentContainer}>
        <Container>
          <div>
            {posts.map((post) => (
              <Link
                href={'/dir/' + post.slug}
                passHref
                key={post.slug}
                className={styles.post}
              >
                <h2 className={styles.postTitle}>
                  {post.meta.title}
                </h2>
                <p className={styles.postDescription}>
                  {post.meta.description}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>
      <DynamicSpotify />
      <Footer />
    </>
  );
}

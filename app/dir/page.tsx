import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import Header from '@/components/Header';
import Banner from '@/components/Banner';
import Container from '@/containers/Container';
import Footer from '@/components/Footer';
import Spotify from '@/components/Spotify';

import styles from '../../styles/pages/layout.module.css';
import dirStyles from '../../styles/pages/dir.module.css';

export default function Dir() {
  const blogDir = 'directory';

  const files = fs
    .readdirSync(path.join(blogDir))
    .filter((fn) => fn.endsWith('.mdx'));

  const posts = files.map((filename) => {
    const fileContent = fs.readFileSync(
      path.join(blogDir, filename),
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
      <section className={dirStyles.dirContainer}>
        <Container>
          <div>
            {posts.map((post) => (
              <Link
                href={'/dir/' + post.slug}
                passHref
                key={post.slug}
                className={dirStyles.post}
              >
                <h3 className={dirStyles.postTitle}>
                  {post.meta.title}
                </h3>
                <span>Updated: {post.meta.date}</span>
                <div>
                  <p className={dirStyles.postDescription}>
                    {post.meta.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
      <Spotify />
      <Footer />
    </>
  );
}

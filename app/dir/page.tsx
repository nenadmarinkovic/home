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

export default function Home() {
  const blogDir = 'directory';

  const files = fs.readdirSync(path.join(blogDir));

  const blogs = files.map((filename) => {
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
      <section className={styles.contentContainer}>
        <Container>
          <div>
            {blogs.map((blog) => (
              <Link
                href={'/dir/' + blog.slug}
                passHref
                key={blog.slug}
                className={styles.post}
              >
                <h2 className={styles.postTitle}>
                  {blog.meta.title}
                </h2>
                <p>{blog.meta.description}</p>
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

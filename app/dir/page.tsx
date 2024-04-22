import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
<<<<<<< HEAD
import Header from '@/components/Header';
import Banner from '@/components/Banner';

import styles from '../../styles/pages/layout.module.css';
import Container from '@/containers/Container';
import Footer from '@/components/Footer';

export default function Home() {
  const postDir = 'directory';

  const files = fs.readdirSync(path.join(postDir));

  const posts = files.map((filename) => {
    const fileContent = fs.readFileSync(
      path.join(postDir, filename),
=======

export default function Home() {
  const blogDir = 'directory';

  const files = fs.readdirSync(path.join(blogDir));

  const blogs = files.map((filename) => {
    const fileContent = fs.readFileSync(
      path.join(blogDir, filename),
>>>>>>> 5dde058b2d476e232491e4786c127f4df43884de
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
<<<<<<< HEAD
      <Header />
      <Banner
        title="Directory"
        paragraphText="Web directory for notes, bookmarks, resources, and the things I’m interested in. All the content is open-source."
      />
      <section className={styles.content}>
        <Container>
          <div>
            {posts.map((post) => (
              <Link
                href={'/dir/' + post.slug}
                passHref
                key={post.slug}
              >
                <h3>{post.meta.title}</h3>
                <div>
                  <p>{post.meta.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
      <Footer />
=======
      <h1>My Next.Js Blog Site</h1>
      <section>
        <h2 className="text-2xl font-blod">Latest Blogs</h2>
        <div>
          {blogs.map((blog) => (
            <Link href={'/dir/' + blog.slug} passHref key={blog.slug}>
              <h3>{blog.meta.title}</h3>
              <div>
                <p>{blog.meta.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
>>>>>>> 5dde058b2d476e232491e4786c127f4df43884de
    </>
  );
}

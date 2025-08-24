import Header from '@/components/Header';
import Banner from '@/components/Banner';
import Container from '@/containers/Container';
import Footer from '@/components/Footer';
import DynamicSpotify from '@/components/Spotify';
import styles from '../../../styles/pages/layout.module.css';

import { getPost, getPosts } from '@/utils/notion';
import PostContent from '@/components/PostContent';

export const revalidate = 5;
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function Page({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const { frontMatter, html } = await getPost(slug);

  return (
    <>
      <Header />
      <main className={styles.main}>
        <Banner
          title={frontMatter.title}
          paragraphText={frontMatter.description}
          fullWidth
        />
        <section className={styles.contentContainer}>
          <Container>
            <PostContent
              html={html}
              headings={frontMatter.headings}
            />
          </Container>
        </section>
      </main>
      <DynamicSpotify />
      <Footer />
    </>
  );
}

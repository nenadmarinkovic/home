import fs from 'fs/promises';
import path from 'path';
import dynamic from 'next/dynamic';
import matter from 'gray-matter';
import CustomMDX from '@/components/Markdown';
import Banner from '@/components/Banner';
import Header from '@/components/Header';
import Container from '@/containers/Container';
import Footer from '@/components/Footer';

import styles from '../../../styles/pages/layout.module.css';

const DynamicSpotify = dynamic(() => import('@/components/Spotify'));

export async function generateStaticParams() {
  const files = await fs.readdir(path.join('directory'));

  return files.map((filename) => ({
    slug: filename.replace('.mdx', ''),
  }));
}

async function getPost(slug: string) {
  const filePath = path.join('directory', `${slug}.mdx`);

  try {
    const markdownFile = await fs.readFile(filePath, 'utf-8');
    const { data: fontMatter, content } = matter(markdownFile);

    return {
      fontMatter,
      slug,
      content,
    };
  } catch (error) {
    throw new Error(`Failed to read file: ${filePath}`);
  }
}

export default async function Page({
  params,
}: {
  params: { slug: string };
}) {
  const awaitedParams = await params;
  const { slug } = awaitedParams;

  if (!slug) {
    throw new Error('No slug provided');
  }

  const props = await getPost(slug);

  return (
    <>
      <Header />
      <main className={styles.main}>
        <Banner
          title={props.fontMatter.title}
          paragraphText={props.fontMatter.description}
          fullWidth={true}
        />
        <section className={styles.contentContainer}>
          <div className={styles.content}>
            <Container>
              <div className={styles.contentFlex}>
                <ul className={styles.contentList}>
                  <span className={styles.contentListTitle}>
                    # Contents
                  </span>
                  {props.fontMatter.headings &&
                    props.fontMatter.headings.map(
                      (heading: string, index: number) => {
                        const id = heading
                          .toLowerCase()
                          .replace(/\s+/g, '-');
                        return (
                          <li key={index}>
                            <a href={`#${id}`}>{heading}</a>
                          </li>
                        );
                      }
                    )}
                </ul>
                <div className={styles.contentSection}>
                  <CustomMDX source={props.content}></CustomMDX>
                </div>
              </div>
            </Container>
          </div>
        </section>
      </main>

      <DynamicSpotify />
      <Footer />
    </>
  );
}

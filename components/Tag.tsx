'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../styles/pages/layout.module.css';

type TagProps = {
  tags: string[];
  posts: {
    meta: { tag: string; title: string; description: string };
    slug: string;
  }[];
};

const Tag: React.FC<TagProps> = ({ tags, posts }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTag = searchParams.get('tag') || 'All';

  const filteredPosts =
    selectedTag === 'All'
      ? posts
      : posts.filter((post) => post.meta.tag === selectedTag);

  const handleTagSelect = (tag: string) => {
    if (tag === '') {
      const url = new URL(window.location.href);
      url.searchParams.delete('tag');
      router.push(url.toString());
    } else {
      router.push(`?tag=${tag}`);
    }
  };

  return (
    <div>
      <div className={styles.tags}>
        <button
          className={`${styles.tag} ${
            'All' === selectedTag ? `${styles.selectedTag}` : ''
          }`}
          onClick={() => handleTagSelect('')}
        >
          All
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            className={`${styles.tag} ${
              tag === selectedTag ? `${styles.selectedTag}` : ''
            }`}
            onClick={() => handleTagSelect(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className={styles.posts}>
        {filteredPosts.map((post) => (
          <Link
            href={'/dir/' + post.slug}
            key={post.slug}
            className={styles.post}
          >
            <h2 className={styles.postTitle}>{post.meta.title}</h2>
            <p className={styles.postDescription}>
              {post.meta.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Tag;

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TagProps } from '../types/types';
import styles from '../styles/pages/layout.module.css';

const Tag: React.FC<TagProps> = ({ tags, posts }) => {
  const router = useRouter();
  const params = useSearchParams();
  const selectedTag = params.get('tag') ?? 'All';

  const filtered = useMemo(
    () =>
      selectedTag === 'All'
        ? posts
        : posts.filter((p) => p.meta.tag.includes(selectedTag)),
    [selectedTag, posts]
  );

  const select = (tag: string) => {
    const qs = new URLSearchParams(window.location.search);
    tag === 'All' ? qs.delete('tag') : qs.set('tag', tag);
    router.push(`?${qs.toString()}`);
  };

  return (
    <div>
      <div className={styles.tags}>
        {['All', ...tags].map((t) => (
          <button
            key={t}
            className={`${styles.tag} ${
              t === selectedTag ? styles.selectedTag : ''
            }`}
            onClick={() => select(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className={styles.posts}>
        {filtered.map((post, i) => (
          <Link
            key={post.slug || `${post.slug}-${i}`} // ← index guard
            href={`/blog/${post.slug}`}
            className={`${styles.post} ${styles.popUpAnimation}`}
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            <h2 className={styles.postTitle}>{post.meta.title}</h2>
            <span className={styles.postDate}>
              {post.meta.date}{' '}
              {post.meta.tag
                .map((t) => `#${t.toLowerCase()}`)
                .join(' ')}
            </span>
            <p className={styles.postDescription}>
              {post.meta.description}
            </p>
            <span className={styles.readMore}>Read more</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Tag;

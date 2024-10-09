'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TagProps } from '../types/types';

import styles from '../styles/pages/layout.module.css';

const Tag: React.FC<TagProps> = ({ tags, posts }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTag = searchParams.get('tag') || 'All';

  const [filteredPosts, setFilteredPosts] = useState(posts);

  useEffect(() => {
    const filtered =
      selectedTag === 'All'
        ? posts
        : posts.filter((post) => post.meta.tag === selectedTag);

    setFilteredPosts(filtered);
  }, [selectedTag, posts]);

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
        {filteredPosts.map((post, index) => (
          <Link
            href={'/dir/' + post.slug}
            key={post.slug}
            className={`${styles.post} ${styles.popUpAnimation}`}
            style={{ animationDelay: `${index * 0.15}s` }} // Apply staggered delay based on index
          >
            <h2 className={styles.postTitle}>{post.meta.title}</h2>
            <span className={styles.postDate}>
              {post.meta.date} #{post.meta.tag.toLocaleLowerCase()}
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

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../styles/pages/layout.module.css';

type CategoryProps = {
  categories: string[];
  posts: {
    meta: { category: string; title: string; description: string };
    slug: string;
  }[];
};

const Category: React.FC<CategoryProps> = ({ categories, posts }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'All';

  const filteredPosts =
    selectedCategory === 'All'
      ? posts
      : posts.filter(
          (post) => post.meta.category === selectedCategory
        );

  const handleCategorySelect = (category: string) => {
    router.push(`?category=${category}`);
  };

  return (
    <div>
      <div className={styles.tags}>
        <button
          className={`${styles.tag} ${
            'All' === selectedCategory ? `${styles.selectedTag}` : ''
          }`}
          onClick={() => handleCategorySelect('All')}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`${styles.tag} ${
              category === selectedCategory
                ? `${styles.selectedTag}`
                : ''
            }`}
            onClick={() => handleCategorySelect(category)}
          >
            {category}
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
            <h2>{post.meta.title}</h2>
            <p>{post.meta.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Category;

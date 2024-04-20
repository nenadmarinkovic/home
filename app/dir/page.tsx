import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';

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
    </>
  );
}

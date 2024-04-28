import { MDXRemote, MDXRemoteProps } from 'remote-mdx/rsc';
import rehypePrettyCode from 'rehype-pretty-code';

export default function CustomMDX(
  props: React.JSX.IntrinsicAttributes & MDXRemoteProps
) {
  return (
    <MDXRemote
      {...props}
      components={{ ...(props.components || {}) }}
      options={{
        mdxOptions: {
          remarkPlugins: [],
          rehypePlugins: [
            [rehypePrettyCode, { theme: 'dark-plus' }] as any,
          ],
        },
      }}
    />
  );
}

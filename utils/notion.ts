import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import MarkdownIt from 'markdown-it';
import mdPrism from 'markdown-it-prism';

import type {
  PageObjectResponse,
  PropertyItemObjectResponse,
  RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints';

import { ArticleType } from '@/types/types';

import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-typescript';

const notion = new Client({ auth: process.env.NOTION_TOKEN! });

const ARTICLES_DATABASE_ID = process.env.NOTION_DATABASE_ID!;
const BLOG_DATABASE_ID = process.env.NOTION_DATABASE_ID_BLOG!;

const n2m = new NotionToMarkdown({ notionClient: notion });
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
}).use(mdPrism, { defaultLanguage: 'plaintext' });

const slugify = (s: string) =>
  encodeURIComponent(
    String(s).trim().toLowerCase().replace(/\s+/g, '-')
  );

md.renderer.rules.heading_open = (
  tokens,
  idx,
  options,
  env,
  self
) => {
  const token = tokens[idx];
  if (token.tag === 'h2') {
    const content = tokens[idx + 1].content;
    const id = slugify(content);
    token.attrSet('id', id);
  }
  return self.renderToken(tokens, idx, options);
};

export async function getArticlesFromNotion(): Promise<
  ArticleType[]
> {
  const { results } = await notion.databases.query({
    database_id: ARTICLES_DATABASE_ID,
    sorts: [{ property: 'Date', direction: 'descending' }],
  });

  return results.map((page: any) => {
    const props = page.properties;
    return {
      id: page.id,
      date: props.Date?.date?.start ?? page.created_time,
      url: props.URL?.url ?? '#',
      title: props.Title?.title?.[0]?.plain_text ?? 'No title',
      description:
        props.Description?.rich_text?.[0]?.plain_text ?? '',
      status: '0',
    };
  });
}

export async function getPosts() {
  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined = undefined;

  do {
    const { results, has_more, next_cursor } =
      await notion.databases.query({
        database_id: BLOG_DATABASE_ID,
        sorts: [{ property: 'Date', direction: 'descending' }],
        start_cursor: cursor,
        page_size: 100,
      });

    pages.push(...(results as PageObjectResponse[]));
    cursor = has_more ? (next_cursor ?? undefined) : undefined;
  } while (cursor);

  return Promise.all(pages.map((p) => pageToMeta(p)));
}

export async function getPost(slug: string) {
  const { results } = await notion.databases.query({
    database_id: BLOG_DATABASE_ID,
    page_size: 10,
    filter: { property: 'Slug', rich_text: { equals: slug } },
  });

  if (!results.length)
    throw new Error(`No post found for slug “${slug}”.`);
  const page = results[0] as PageObjectResponse;

  const mdBlocks = await n2m.pageToMarkdown(page.id);
  const { parent: markdown } = n2m.toMarkdownString(mdBlocks);

  const html = md.render(markdown);

  const headings =
    markdown.match(/^##\s+.+$/gm)?.map((h) => {
      const text = h.replace(/^##\s+/, '');
      return {
        text,
        id: slugify(text),
      };
    }) ?? [];

  return {
    frontMatter: { ...pageToMeta(page), headings },
    html,
  };
}

function joinRichText(
  r: RichTextItemResponse | RichTextItemResponse[]
) {
  return Array.isArray(r)
    ? r.map((t) => t.plain_text).join('')
    : r.plain_text;
}

export function asPlainText(
  prop?: PropertyItemObjectResponse | null
): string {
  if (!prop) return '';

  switch (prop.type) {
    case 'title':
      return joinRichText(prop.title);
    case 'rich_text':
      return joinRichText(prop.rich_text);
    case 'formula':
      return prop.formula.type === 'string'
        ? (prop.formula.string ?? '')
        : '';
    case 'url':
      return prop.url ?? '';
    default:
      return '';
  }
}

function pageToMeta(page: PageObjectResponse) {
  const props = page.properties as any;
  const rawSlug = asPlainText(props.Slug);
  const slug = rawSlug || page.id.replace(/-/g, '');

  return {
    slug,
    title: asPlainText(props.Name),
    description: asPlainText(props.Description),
    date: props.Date?.date?.start ?? '',
    tag: props.Tags?.multi_select?.map((t: any) => t.name) ?? [],
  };
}

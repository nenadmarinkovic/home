import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import MarkdownIt from 'markdown-it';
import mdPrism from 'markdown-it-prism';

import type {
  PageObjectResponse,
  PropertyItemObjectResponse,
  RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints';

import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });
const dbId = process.env.NOTION_DATABASE_ID_BLOG as string;

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
}).use(mdPrism, { defaultLanguage: 'plaintext' });

export async function getPosts() {
  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined = undefined;

  do {
    const { results, has_more, next_cursor } =
      await notion.databases.query({
        database_id: dbId,
        sorts: [{ property: 'Date', direction: 'descending' }],
        start_cursor: cursor,
        page_size: 100,
      });

    pages.push(...(results as PageObjectResponse[]));
    cursor = has_more ? next_cursor ?? undefined : undefined;
  } while (cursor);

  return Promise.all(pages.map((p) => pageToMeta(p)));
}

export async function getPost(slug: string) {
  const { results } = await notion.databases.query({
    database_id: dbId,
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
    markdown
      .match(/^#{1,6}\s+.+$/gm)
      ?.map((h) => h.replace(/^#{1,6}\s+/, '')) ?? [];

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
        ? prop.formula.string ?? ''
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

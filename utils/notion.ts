import { Client } from '@notionhq/client';
import { ArticleType } from '@/types/types';

const notion = new Client({ auth: process.env.NOTION_TOKEN! });

export async function getArticlesFromNotion(): Promise<
  ArticleType[]
> {
  const databaseId = process.env.NOTION_DATABASE_ID!;

  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        property: 'Date',
        direction: 'descending',
      },
    ],
  });

  return response.results.map((page: any) => {
    const props = page.properties;

    return {
      id: page.id,
      date: props.Date?.date?.start || page.created_time,
      url: props.URL?.url || '#',
      title: props.Title?.title?.[0]?.plain_text || 'No title',
      description:
        props.Description?.rich_text?.[0]?.plain_text || '',
      status: '0',
    };
  });
}

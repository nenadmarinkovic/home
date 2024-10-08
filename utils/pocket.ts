import { ArticleType, RawArticleType } from '@/types/types';

export async function getArticles(): Promise<ArticleType[]> {
  const consumerKey = process.env.POCKET_CONSUMER_KEY;
  const accessToken = process.env.POCKET_ACCESS_TOKEN;

  const response = await fetch('https://getpocket.com/v3/get', {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      consumer_key: consumerKey,
      access_token: accessToken,
      detailType: 'simple',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }

  const data = await response.json();

  const articles = Object.values(data.list as Record<string, RawArticleType>)
  .filter(article => article.status !== '2')
  .map((article: RawArticleType) => ({
    id: article.item_id,
    date: article.time_added || 'Unknown date',
    url: article.resolved_url || '#',
    title: article.resolved_title || 'No title available',
    excerpt: article.excerpt || 'No description available',
    status: article.status,
  }));

  return articles;
}

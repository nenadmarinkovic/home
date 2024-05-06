export async function getArticles() {
  const consumerKey = process.env.POCKET_CONSUMER_KEY;
  const accessToken = process.env.POCKET_ACCESS_TOKEN;

  const response = await fetch('https://getpocket.com/v3/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Accept': 'application/json',
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

  const articles = Object.values(data.list).map((article: any) => ({
    id: article.item_id,
    date: article.time_added,
    url: article.given_url,
    title: article.given_title,
    excerpt: article.excerpt,
  }));

  return articles;
}

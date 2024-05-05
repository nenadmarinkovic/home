import { NextResponse } from 'next/server';

export async function GET() {
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
    return NextResponse.json({ error: 'Failed to fetch articles' });
  }

  const data = await response.json();
  return NextResponse.json(data.list);
}

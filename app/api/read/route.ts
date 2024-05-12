import { NextResponse } from 'next/server';
import { getArticles } from '../../../utils/pocket';

export async function GET() {
  try {
    const articles = await getArticles();
    return NextResponse.json({ articles });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message });
  }
}

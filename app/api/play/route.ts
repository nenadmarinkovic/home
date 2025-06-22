export const dynamic = 'force-dynamic';

import { getNowPlaying } from '@/utils/spotify';
import { NextResponse } from 'next/server';
import type { SongType, ArtistType } from '@/types/types';

function transformSong(song: SongType) {
  const isPlaying = song.is_playing;
  const title = song.item.name;
  const artist = song.item.artists
    .map((a: ArtistType) => a.name)
    .join(', ');
  const album = song.item.album.name;
  const albumImageUrl = song.item.album.images[0].url;
  const songUrl = song.item.external_urls.spotify;

  return { album, albumImageUrl, artist, isPlaying, songUrl, title };
}

export async function GET() {
  try {
    const res = await getNowPlaying();

    if (res.status === 204 || res.status >= 400) {
      return NextResponse.json(
        { isPlaying: false },
        { status: res.status }
      );
    }

    const song = await res.json();
    return NextResponse.json(transformSong(song));
  } catch (err) {
    console.error('Spotify route error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch now playing' },
      { status: 500 }
    );
  }
}

import { getNowPlaying } from '../../../utils/spotify';
import { NextResponse } from 'next/server';
import { SongType, ArtistType } from '../../../types/types';

function transformSong(song: SongType) {
  const isPlaying: boolean = song.is_playing;
  const title: string = song.item.name;
  const artist: string = song.item.artists
    .map((_artist: ArtistType) => _artist.name)
    .join(', ');
  const album: string = song.item.album.name;
  const albumImageUrl: string = song.item.album.images[0].url;
  const songUrl: string = song.item.external_urls.spotify;

  return {
    album,
    albumImageUrl,
    artist,
    isPlaying,
    songUrl,
    title,
  };
}

export async function GET() {
  try {
    const response = await getNowPlaying();

    if (response.status === 204 || response.status > 400) {
      return NextResponse.json({ isPlaying: false });
    }

    const song = await response.json();
    const data = transformSong(song);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to get now playing' });
  }
}

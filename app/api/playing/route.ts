<<<<<<< HEAD
import { NextRequest, NextResponse } from 'next/server';
import { getNowPlaying } from '../../../utils/spotify';

export async function GET(request: NextRequest) {
=======
import { NextResponse } from "next/server";
import { getNowPlaying } from "../../../utils/spotify";

export async function GET() {
>>>>>>> 5dde058b2d476e232491e4786c127f4df43884de
  const response = await getNowPlaying();

  if (response.status === 204 || response.status > 400) {
    return NextResponse.json({ isPlaying: false });
  }

  const song = await response.json();
  const isPlaying: boolean = song.is_playing;
  const title: string = song.item.name;
  const artist: string = song.item.artists
    .map((_artist: any) => _artist.name)
<<<<<<< HEAD
    .join(', ');
=======
    .join(", ");
>>>>>>> 5dde058b2d476e232491e4786c127f4df43884de
  const album: string = song.item.album.name;
  const albumImageUrl: string = song.item.album.images[0].url;
  const songUrl: string = song.item.external_urls.spotify;

  return NextResponse.json({
    album,
    albumImageUrl,
    artist,
    isPlaying,
    songUrl,
    title,
<<<<<<< HEAD
  });
=======
  })
>>>>>>> 5dde058b2d476e232491e4786c127f4df43884de
}

'use client';

import React, { useEffect, useState } from 'react';
import { SpotifySongType } from '../types/types';

import styles from '../styles/components/Spotify.module.css';
import Image from 'next/image';

export default function Spotify() {
  const [data, setData] = useState<SpotifySongType | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/playing');

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        console.log(data);
        setData(data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, []);

  return (
    <div className={styles.spotifyContainer}>
      {data?.isPlaying && (
        <>
          <div className={styles.spotifyInside}>
            <Image
              width={100}
              height={100}
              className={styles.albumImage}
              src={data.albumImageUrl}
              alt="Album cover"
            />
            <a
              href={`${data.songUrl}`}
              target="_blank"
              rel="noreferrer"
              className={styles.songInfo}
            >
              <span className={styles.title}>{data.title}</span>
              <span className={styles.artist}>{data.artist}</span>
            </a>
            <span className="box">
              <span className="music one"></span>
              <span className="music two"></span>
              <span className="music three"></span>
              <span className="music four"></span>
            </span>
          </div>
        </>
      )}
    </div>
  );
}

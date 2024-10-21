'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { SpotifySongType } from '../types/types';

import styles from '../styles/components/Spotify.module.css';

export default function Spotify() {
  const [data, setData] = useState<SpotifySongType | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/play');

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, []);

  return (
    <>
      {data?.isPlaying && (
        <div className={styles.spotifyContainer}>
          <>
            <a
              className={styles.spotifyInside}
              href={`${data.songUrl}`}
              target="_blank"
              rel="noreferrer"
              title="Currently playing on Spotify"
            >
              <Image
                width={100}
                height={100}
                className={styles.albumImage}
                src={data.albumImageUrl}
                alt="Spotify album cover"
              />
              <div className={styles.songInfo}>
                <span className={styles.boxInfo}>
                  <span className={styles.boxIcon}>
                    <Image
                      width={15}
                      height={15}
                      src="/icons/spotify.svg"
                      alt="Spotify logo"
                    />
                  </span>
                  <span className={styles.boxText}>
                    Currently listen to:
                  </span>
                </span>
                <span className={styles.title}>{data.title}</span>
                <span className={styles.artist}>{data.artist}</span>
              </div>

              <span className={styles.box}>
                <span
                  className={`${styles.music} ${styles.one}`}
                ></span>
                <span
                  className={`${styles.music} ${styles.two}`}
                ></span>
                <span
                  className={`${styles.music} ${styles.three}`}
                ></span>
                <span
                  className={`${styles.music} ${styles.four}`}
                ></span>
              </span>
            </a>
          </>
        </div>
      )}
    </>
  );
}

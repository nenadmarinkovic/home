import { ReactNode } from 'react';

export interface Language {
  language: string;
  count: number;
}

interface RepositoryLanguage {
  name: string;
}

export interface Repository {
  name: string;
  languages: {
    nodes: RepositoryLanguage[];
  };
}

interface RepositoriesPageInfo {
  endCursor: string | null;
  hasNextPage: boolean;
}

export interface UserRepositories {
  nodes: Repository[];
  pageInfo: RepositoriesPageInfo;
}

export interface UserData {
  user: {
    repositories: UserRepositories;
  };
}

export interface Repo {
  name: string;
  languages_url: string;
}

export interface RepoData {
  name: string;
  languages: Record<string, number>;
}

export interface DevelopChartProps {
  data: { language: string; percentage: number }[];
  maxPercentage: number;
}

<<<<<<< HEAD
export type SpotifyDataType = {
  is_playing: boolean;
  item: {
    name: string;
    artists: { name: string }[];
    external_urls: {
      spotify: string;
    };
  } | null;
};

=======
>>>>>>> 5dde058b2d476e232491e4786c127f4df43884de
export type SpotifySongType = {
  album: any;
  albumImageUrl: any;
  isPlaying: boolean;
  songUrl: string;
  artist: string;
  title: string;
};

export type ErrorResponse = {
  error: string;
};

type BoxItemTypes = {
  icon: ReactNode;
  text: string;
};

export type BoxPropsTypes = {
  title: string;
  boxColor: 'blue' | 'green' | 'orange';
  headerText: string;
  mainTitle: string;
  boxItems: BoxItemTypes[];
};
<<<<<<< HEAD

export type BannerProps = {
  title: string;
  highlightedText?: string;
  paragraphText: JSX.Element | string;
  additionalText?: string;
  children?: React.ReactNode;
};
=======
>>>>>>> 5dde058b2d476e232491e4786c127f4df43884de

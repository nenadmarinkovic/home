import { ReactNode } from 'react';

export type Language = {
  language: string;
  count: number;
};

type RepositoryLanguage = {
  name: string;
};

export type Repository = {
  name: string;
  languages: {
    nodes: RepositoryLanguage[];
  };
};

type RepositoriesPageInfo = {
  endCursor: string | null;
  hasNextPage: boolean;
};

export type UserRepositories = {
  nodes: Repository[];
  pageInfo: RepositoriesPageInfo;
};

export type UserData = {
  user: {
    repositories: UserRepositories;
  };
};

export type ProductItemProps = {
  title: string;
  text: string;
  icon: React.ReactNode;
};

export type SectionHeaderProps = {
  header: string;
  title: string;
  text: string;
};

export type Repo = {
  name: string;
  languages_url: string;
};

export type RepoData = {
  name: string;
  languages: Record<string, number>;
};

export type DevelopChartProps = {
  data: { language: string; percentage: number }[];
  maxPercentage: number;
};

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

export type BannerProps = {
  title: string;
  highlightedText?: string;
  paragraphText: JSX.Element | string;
  additionalText?: string;
  children?: React.ReactNode;
  fullWidth?: boolean;
};

export type TagType = {
  color: string;
  text: string;
};

export type TagButtonType = {
  color: string;
  text: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  active?: string | boolean;
};

export type FormInput = {
  name: string;
  email: string;
  message: string;
};

export type EmailProps = {
  name: string;
  email: string;
  message: string;
};

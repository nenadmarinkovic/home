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

export type ArtistType = {
  name: string;
};

type AlbumType = {
  name: string;
  images: { url: string }[];
};

export type SongType = {
  is_playing: boolean;
  item: {
    name: string;
    artists: ArtistType[];
    album: AlbumType;
    external_urls: { spotify: string };
  };
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

export type PostMeta = {
  tag: string;
  date: string;
  title: string;
  description: string;
};

export type Post = {
  meta: PostMeta;
  slug: string;
};

export type TagProps = {
  tags: string[];
  posts: Post[];
};

export type RawArticleType = {
  item_id: string;
  time_added: string;
  resolved_url: string;
  resolved_title: string;
  excerpt: string;
};

export type ArticleType = {
  id: string;
  date: string;
  url: string;
  title: string;
  excerpt: string;
};

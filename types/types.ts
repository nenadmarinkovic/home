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

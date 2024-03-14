// GitHub API types

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

export interface LanguageChartProps {
  data: { language: string; percentage: number }[];
  maxPercentage: number;
}

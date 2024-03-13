import {
  ApolloClient,
  InMemoryCache,
  gql,
  ApolloQueryResult,
} from '@apollo/client';

import {
  Repository,
  UserRepositories,
  UserData,
} from '../types/types';

const getGitHubData = async (
  username: string
): Promise<Repository[]> => {
  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

  const client = new ApolloClient({
    uri: 'https://api.github.com/graphql',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: new InMemoryCache(),
  });

  try {
    const query = gql`
      query GetUserRepos($username: String!, $endCursor: String) {
        user(login: $username) {
          repositories(
            first: 100
            ownerAffiliations: OWNER
            after: $endCursor
          ) {
            nodes {
              name
              languages(first: 10) {
                nodes {
                  name
                }
              }
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      }
    `;

    let hasNextPage = true;
    let endCursor: string | null = null;
    let allRepos: Repository[] = [];

    while (hasNextPage) {
      const { data }: ApolloQueryResult<UserData> =
        await client.query({
          query,
          variables: {
            username,
            endCursor,
          },
        });

      const repositories: UserRepositories = data.user.repositories;

      if (!repositories.nodes.length) {
        break;
      }

      allRepos = [...allRepos, ...repositories.nodes];
      hasNextPage = repositories.pageInfo.hasNextPage;
      endCursor = repositories.pageInfo.endCursor;
    }

    return allRepos;
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    throw error;
  }
};

export default getGitHubData;

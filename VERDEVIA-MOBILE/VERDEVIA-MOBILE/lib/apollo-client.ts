import { ApolloClient, InMemoryCache, HttpLink, from, ApolloLink } from '@apollo/client/core';
import { ErrorLink } from '@apollo/client/link/error';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
const API_ORIGIN_URL = API_BASE_URL?.replace(/\/api$/, '');

const GRAPHQL_URL = API_ORIGIN_URL
  ? `${API_ORIGIN_URL}/graphql`
  : 'http://localhost:3333/graphql';

const TOKEN_KEY = '@VERDEVIA:token';

/**
 * Error Link — Apollo v4 API.
 * Uses ErrorLink class + CombinedGraphQLErrors.is() discriminator.
 */
const errorLink = new ErrorLink(({ error }) => {
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message, path }) => {
      console.error(`[GraphQL Error] ${message} at ${String(path)}`);
    });
  } else {
    console.error(`[Network/Protocol Error] ${error}`);
  }
});

/**
 * Auth Link — reads token from AsyncStorage (React Native secure storage).
 * Non-blocking: uses a synchronous cache with async pre-loading.
 */
let cachedToken: string | null = null;

AsyncStorage.getItem(TOKEN_KEY)
  .then((t) => { cachedToken = t; })
  .catch(() => {});

const authLink = new ApolloLink((operation, forward) => {
  if (cachedToken) {
    operation.setContext(({ headers = {} }: { headers: Record<string, string> }) => ({
      headers: { ...headers, Authorization: `Bearer ${cachedToken}` },
    }));
  }
  return forward(operation);
});

const httpLink = new HttpLink({
  uri: GRAPHQL_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
});

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        posts: {
          keyArgs: ['filter', ['category', 'search']],
          merge(existing: any, incoming: any) {
            return {
              ...incoming,
              items: [...(existing?.items ?? []), ...(incoming?.items ?? [])],
            };
          },
        },
      },
    },
    PostType: { keyFields: ['id'] },
    CommentType: { keyFields: ['id'] },
  },
});

export const apolloClient: ApolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache,
});

/**
 * Updates the in-memory token cache and persists to AsyncStorage.
 * Call this after login/logout.
 */
export async function setApolloToken(token: string | null): Promise<void> {
  cachedToken = token;
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
    apolloClient.resetStore().catch(() => {});
  }
}

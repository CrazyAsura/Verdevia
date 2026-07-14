'use client';

import { ApolloClient, InMemoryCache, HttpLink, from, ApolloLink } from '@apollo/client/core';
import { ErrorLink } from '@apollo/client/link/error';
import { CombinedGraphQLErrors } from '@apollo/client/errors';

const PUBLIC_OPERATIONS = new Set([
  'GetJobs',
  'ApplyForJob',
  'GetComplianceVersions',
]);

function isPublicOperation(operationName?: string): boolean {
  return operationName ? PUBLIC_OPERATIONS.has(operationName) : false;
}

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? '/api/careers/graphql';

/**
 * Error Link — handles GraphQL and network errors globally.
 * Uses Apollo v4's ErrorLink class directly (onError is deprecated).
 * Errors arrive as { error } — use CombinedGraphQLErrors.is() to discriminate.
 */
const errorLink = new ErrorLink(({ error, operation }) => {
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message, path }) => {
      console.error(`[GraphQL Error] ${message} at ${String(path)}`);
      if (typeof window !== 'undefined') {
        const isAuthError =
          message === 'Token inválido ou expirado' ||
          message === 'Token invalido ou expirado';
        const isPublicOperationName = isPublicOperation(operation.operationName);

        if (!isAuthError || !isPublicOperationName) {
          window.dispatchEvent(
            new CustomEvent('ECOA-toast', {
              detail: {
                message,
                type: 'error',
              },
            })
          );
        }
      }
    });
  } else {
    // Network or protocol error
    console.error(`[Network/Protocol Error] ${error}`);
    if (
      typeof window !== 'undefined' &&
      error instanceof Error &&
      'statusCode' in error &&
      (error as any).statusCode === 401
    ) {
      window.dispatchEvent(
        new CustomEvent('ECOA-toast', {
          detail: {
            message: 'Sessão administrativa expirada.',
            type: 'error',
          },
        })
      );
    }
    
    if (typeof window !== 'undefined') {
      const errorMessage = error instanceof Error ? error.message : String(error);
      window.dispatchEvent(
        new CustomEvent('ECOA-toast', {
          detail: {
            message: errorMessage,
            type: 'error',
          },
        })
      );
    }
  }
});

/**
 * Auth Link — injects Bearer token from localStorage into every request.
 */
const authLink = new ApolloLink((operation, forward) => {
  if (typeof window !== 'undefined') {
    const token = isPublicOperation(operation.operationName)
      ? null
      : localStorage.getItem('ECOA_token');
    if (token) {
      operation.setContext(({ headers = {} }: { headers: Record<string, string> }) => ({
        headers: { ...headers, Authorization: `Bearer ${token}` },
      }));
    }
  }
  return forward(operation);
});

const httpLink = new HttpLink({
  uri: GRAPHQL_URL,
  credentials: 'include',
});

/**
 * InMemoryCache with merge policies for paginated forum data.
 */
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

/**
 * Singleton Apollo Client instance (SSR-safe).
 * In Apollo v4, ApolloClient is not generic.
 */
let apolloClientInstance: ApolloClient | null = null;

function createApolloClient(): ApolloClient {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: from([errorLink, authLink, httpLink]),
    cache,
  });
}

export function getApolloClient(): ApolloClient {
  if (typeof window === 'undefined') return createApolloClient();
  if (!apolloClientInstance) apolloClientInstance = createApolloClient();
  return apolloClientInstance;
}

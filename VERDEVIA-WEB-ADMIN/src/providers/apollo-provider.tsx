'use client';

import React from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { getApolloClient } from '@/lib/apollo-client';

interface ApolloProviderWrapperProps {
  children: React.ReactNode;
}

/**
 * ApolloProviderWrapper — makes Apollo Client available to the React tree.
 * Must be a Client Component ('use client') as Apollo context uses React context API.
 */
export function ApolloProviderWrapper({ children }: ApolloProviderWrapperProps) {
  const client = getApolloClient();
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

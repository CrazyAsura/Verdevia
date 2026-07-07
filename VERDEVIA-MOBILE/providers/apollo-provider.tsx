import React from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from '@/lib/apollo-client';

interface ApolloProviderWrapperProps {
  children: React.ReactNode;
}

/**
 * ApolloProviderWrapper — Provides Apollo context to the Expo app.
 * Wrap the root _layout.tsx to enable GraphQL throughout the app.
 */
export function ApolloProviderWrapper({ children }: ApolloProviderWrapperProps) {
  return (
    <ApolloProvider client={apolloClient}>
      {children}
    </ApolloProvider>
  );
}

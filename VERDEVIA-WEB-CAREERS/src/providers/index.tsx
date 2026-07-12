'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store';
import React, { useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ToastContainer } from '@/components/ToastContainer';
import { LazyMotion } from 'framer-motion';
import { ApolloProviderWrapper } from './apollo-provider';
import { ThemeProvider } from '@/context/ThemeContext';

const loadFeatures = () => import("@/lib/framer-features").then(res => res.default);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <ApolloProviderWrapper>
      <ReduxProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <ToastProvider>
                <AuthProvider>
                  <LazyMotion features={loadFeatures}>
                    {children}
                    <ToastContainer />
                  </LazyMotion>
                </AuthProvider>
              </ToastProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </PersistGate>
      </ReduxProvider>
    </ApolloProviderWrapper>
  );
}

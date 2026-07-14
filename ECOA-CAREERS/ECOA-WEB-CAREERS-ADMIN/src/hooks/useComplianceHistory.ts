'use client';

import { useState, useEffect } from 'react';
import { getApolloClient } from '@/lib/apollo-client';
import { GET_COMPLIANCE_VERSIONS } from '@/graphql/queries/compliance';
import {
  ACTIVATE_COMPLIANCE_VERSION,
  DELETE_COMPLIANCE_VERSION,
  PUBLISH_COMPLIANCE_VERSION,
} from '@/graphql/mutations/compliance-versions';

export type DocType = 'terms' | 'privacy' | 'cookies';

export interface DocumentVersion {
  id: string;
  version: string;
  content: string;
  pdfName: string;
  publishedAt: string;
  isActive: boolean;
}

export type VersionHistory = Record<DocType, DocumentVersion[]>;
type ComplianceVersionsQuery = { complianceVersions: DocumentVersion[] };

export function useComplianceHistory() {
  const [history, setHistory] = useState<VersionHistory | null>(null);

  const fetchAllHistory = async () => {
    try {
      const [termsRes, privacyRes, cookiesRes] = await Promise.all([
        getApolloClient().query<ComplianceVersionsQuery>({
          query: GET_COMPLIANCE_VERSIONS,
          variables: { type: 'terms' },
          fetchPolicy: 'network-only',
        }),
        getApolloClient().query<ComplianceVersionsQuery>({
          query: GET_COMPLIANCE_VERSIONS,
          variables: { type: 'privacy' },
          fetchPolicy: 'network-only',
        }),
        getApolloClient().query<ComplianceVersionsQuery>({
          query: GET_COMPLIANCE_VERSIONS,
          variables: { type: 'cookies' },
          fetchPolicy: 'network-only',
        })
      ]);
      
      setHistory({
        terms: termsRes.data?.complianceVersions ?? [],
        privacy: privacyRes.data?.complianceVersions ?? [],
        cookies: cookiesRes.data?.complianceVersions ?? []
      });
    } catch (e) {
      console.error('Failed to load compliance history from SQLite:', e);
    }
  };

  // Load from backend SQLite on mount
  useEffect(() => {
    fetchAllHistory();
  }, []);

  const publishVersion = async (type: DocType, version: string, content: string, pdfName: string) => {
    try {
      await getApolloClient().mutate({
        mutation: PUBLISH_COMPLIANCE_VERSION,
        variables: { input: { type, version, content, pdfName } },
      });
      await fetchAllHistory(); // Refresh state from DB
    } catch (e) {
      console.error('Failed to publish compliance version:', e);
      throw e;
    }
  };

  const activateVersion = async (type: DocType, id: string) => {
    try {
      await getApolloClient().mutate({
        mutation: ACTIVATE_COMPLIANCE_VERSION,
        variables: { id },
      });
      await fetchAllHistory(); // Refresh state from DB
    } catch (e) {
      console.error('Failed to activate compliance version:', e);
    }
  };

  const deleteVersion = async (type: DocType, id: string) => {
    try {
      await getApolloClient().mutate({
        mutation: DELETE_COMPLIANCE_VERSION,
        variables: { id },
      });
      await fetchAllHistory(); // Refresh state from DB
    } catch (e) {
      console.error('Failed to delete compliance version:', e);
    }
  };

  const getActiveVersion = (type: DocType): DocumentVersion | null => {
    if (!history) return null;
    return history[type].find(v => v.isActive) || history[type][0] || null;
  };

  return {
    history,
    publishVersion,
    activateVersion,
    deleteVersion,
    getActiveVersion,
    isLoading: history === null
  };
}

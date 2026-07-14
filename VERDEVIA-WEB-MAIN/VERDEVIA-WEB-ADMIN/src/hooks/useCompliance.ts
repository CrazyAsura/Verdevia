'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { GET_CONSENTS } from '@/graphql/queries/compliance';
import { UPDATE_CONSENTS, EXPORT_DATA, ANONYMIZE_DATA } from '@/graphql/mutations/compliance';

export function useUserConsents(userId: string) {
  const { data, loading, error, refetch } = useQuery<{ userConsents: any[] }>(GET_CONSENTS, {
    variables: { userId },
    skip: !userId,
  });

  return {
    consents: data?.userConsents ?? [],
    loading,
    error,
    refetch,
  };
}

export function useComplianceMutations() {
  const [updateConsentsMutation, { loading: updatingConsents }] = useMutation(UPDATE_CONSENTS);
  const [exportDataMutation, { loading: exportingData }] = useMutation(EXPORT_DATA);
  const [anonymizeMutation, { loading: anonymizing }] = useMutation(ANONYMIZE_DATA);

  return {
    updateConsents: (userId: string, updates: any[]) =>
      updateConsentsMutation({ variables: { userId, updates } }),
    exportUserData: (userId: string) =>
      exportDataMutation({ variables: { userId } }),
    anonymizeUserData: (userId: string) =>
      anonymizeMutation({ variables: { userId } }),
    updatingConsents,
    exportingData,
    anonymizing,
  };
}

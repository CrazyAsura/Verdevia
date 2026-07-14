'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { GET_COMPLAINTS, GET_COMPLAINT } from '@/graphql/queries/complaints';
import { CREATE_COMPLAINT, UPDATE_COMPLAINT, DELETE_COMPLAINT } from '@/graphql/mutations/complaints';

interface ComplaintsFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export function useComplaintsList(filter?: ComplaintsFilter) {
  const { data, loading, error, refetch, fetchMore } = useQuery<{
    complaints: { items: any[]; total: number; page: number; lastPage: number };
  }>(GET_COMPLAINTS, {
    variables: { filter },
    notifyOnNetworkStatusChange: true,
  });

  const loadMore = (page: number) => {
    fetchMore({
      variables: { filter: { ...filter, page } },
    });
  };

  return {
    complaints: data?.complaints?.items ?? [],
    total: data?.complaints?.total ?? 0,
    page: data?.complaints?.page ?? 1,
    lastPage: data?.complaints?.lastPage ?? 1,
    loading,
    error,
    refetch,
    loadMore,
  };
}

export function useComplaintDetails(id: string) {
  const { data, loading, error, refetch } = useQuery<{ complaint: any }>(GET_COMPLAINT, {
    variables: { id },
    skip: !id,
  });

  return {
    complaint: data?.complaint ?? null,
    loading,
    error,
    refetch,
  };
}

export function useComplaintMutations() {
  const [createMutation, { loading: creating }] = useMutation(CREATE_COMPLAINT, {
    refetchQueries: [{ query: GET_COMPLAINTS }],
  });
  const [updateMutation, { loading: updating }] = useMutation(UPDATE_COMPLAINT);
  const [deleteMutation, { loading: deleting }] = useMutation(DELETE_COMPLAINT, {
    refetchQueries: [{ query: GET_COMPLAINTS }],
  });

  return {
    createComplaint: (input: any) => createMutation({ variables: { input } }),
    updateComplaint: (id: string, input: any) => updateMutation({ variables: { id, input } }),
    deleteComplaint: (id: string) => deleteMutation({ variables: { id } }),
    creating,
    updating,
    deleting,
  };
}

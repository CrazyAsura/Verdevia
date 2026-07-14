'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { GET_USER, GET_PROFILE, GET_ACHIEVEMENTS } from '@/graphql/queries/users';
import {
  REGISTER_USER,
  LOGIN_USER,
  UPDATE_USER_PROFILE,
  UPDATE_USER,
  REMOVE_USER,
} from '@/graphql/mutations/users';

export function useUserProfile(id: string) {
  const { data, loading, error, refetch } = useQuery<{ user: any }>(GET_USER, {
    variables: { id },
    skip: !id,
  });

  return {
    user: data?.user ?? null,
    loading,
    error,
    refetch,
  };
}

export function useUserAchievements(userId: string) {
  const { data, loading, error, refetch } = useQuery<{ achievements: any[] }>(GET_ACHIEVEMENTS, {
    variables: { userId },
    skip: !userId,
  });

  return {
    achievements: data?.achievements ?? [],
    loading,
    error,
    refetch,
  };
}

export function useUserMutations() {
  const [registerMutation, { loading: registering }] = useMutation(REGISTER_USER);
  const [loginMutation, { loading: loggingIn }] = useMutation(LOGIN_USER);
  const [updateProfileMutation, { loading: updatingProfile }] = useMutation(UPDATE_USER_PROFILE);
  const [updateAuthMutation, { loading: updatingAuth }] = useMutation(UPDATE_USER);
  const [removeMutation, { loading: removing }] = useMutation(REMOVE_USER);

  return {
    register: (input: any) => registerMutation({ variables: { input } }),
    login: (input: any) => loginMutation({ variables: { input } }),
    updateProfile: (id: string, input: any) => updateProfileMutation({ variables: { id, input } }),
    updateAuth: (id: string, input: any) => updateAuthMutation({ variables: { id, input } }),
    removeUser: (id: string) => removeMutation({ variables: { id } }),
    registering,
    loggingIn,
    updatingProfile,
    updatingAuth,
    removing,
  };
}

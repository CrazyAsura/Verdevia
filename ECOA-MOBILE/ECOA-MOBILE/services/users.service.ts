import { apolloClient, setApolloToken } from '@/lib/apollo-client';
import {
  GET_ACHIEVEMENTS,
  GET_PROFILE,
  LOGIN_USER,
  REGISTER_USER,
  REQUEST_PASSWORD_RESET,
  RESET_PASSWORD,
  UPDATE_USER_PROFILE,
} from '@/graphql/users';

export interface User {
  id: string;
  name: string;
  realName?: string;
  email: string;
  role: string;
  points?: number;
  level?: number;
  streak?: number;
  complaintsCount?: number;
  avatarUrl?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface PasswordResetResponse {
  message: string;
}

interface LoginMutationData {
  loginUser: {
    token: string;
    user: GraphQLUser;
  };
}

interface RegisterMutationData {
  registerUser: GraphQLUser;
}

interface MessageMutationData {
  requestPasswordReset?: PasswordResetResponse;
  resetPassword?: PasswordResetResponse;
}

interface ProfileQueryData {
  profile: GraphQLProfile | null;
}

interface AchievementsQueryData {
  achievements: Array<{
    id: string;
    name: string;
    icon: string;
    status: string;
    progress?: number | null;
    isLocked: boolean;
    date?: string | null;
  }>;
}

interface UpdateUserProfileMutationData {
  updateUserProfile: GraphQLUser;
}

interface GraphQLUser {
  id: string;
  email: string;
  role: string;
  profile?: {
    realName?: string | null;
    avatarUrl?: string | null;
  } | null;
  gamification?: {
    xp?: number | null;
    level?: number | null;
  } | null;
}

interface GraphQLProfile {
  id: string;
  realName?: string | null;
  avatarUrl?: string | null;
}

function normalizeUser(user: GraphQLUser): User {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.profile?.realName ?? user.email,
    realName: user.profile?.realName ?? undefined,
    avatarUrl: user.profile?.avatarUrl ?? undefined,
    points: user.gamification?.xp ?? undefined,
    level: user.gamification?.level ?? undefined,
  };
}

const UsersService = {
  /**
   * Authenticates a user and returns { user, token }.
   * GraphQL: loginUser
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await apolloClient.mutate({
      mutation: LOGIN_USER,
      variables: { input: { email, password } },
    });
    const raw = (data as LoginMutationData).loginUser;
    await setApolloToken(raw.token);
    return { user: normalizeUser(raw.user), token: raw.token };
  },

  /**
   * Registers a new user account.
   * GraphQL: registerUser
   */
  register: async (input: {
    realName: string;
    identity: string;
    gender: string;
    ethnicity: string;
    birthDate: string;
    address: {
      zipCode: string;
      street: string;
      city: string;
      state: string;
      district: string;
      country: string;
      number?: string;
    };
    phones: Array<{
      ddi: string;
      ddd: string;
      number: string;
    }>;
    email: string;
    password: string;
  }): Promise<User> => {
    const { data } = await apolloClient.mutate({
      mutation: REGISTER_USER,
      variables: { input },
    });
    return normalizeUser((data as RegisterMutationData).registerUser);
  },

  /**
   * Requests a password reset e-mail through the backend SMTP service.
   * GraphQL: requestPasswordReset
   */
  requestPasswordReset: async (email: string): Promise<PasswordResetResponse> => {
    const { data } = await apolloClient.mutate({
      mutation: REQUEST_PASSWORD_RESET,
      variables: { input: { email, portal: 'mobile' } },
    });
    return (data as MessageMutationData).requestPasswordReset!;
  },

  /**
   * Completes password reset using the token sent by e-mail.
   * GraphQL: resetPassword
   */
  resetPassword: async (
    email: string,
    token: string,
    password: string,
  ): Promise<PasswordResetResponse> => {
    const { data } = await apolloClient.mutate({
      mutation: RESET_PASSWORD,
      variables: { input: { email, token, password } },
    });
    return (data as MessageMutationData).resetPassword!;
  },

  /**
   * Fetches consolidated profile data including gamification.
   * GraphQL: profile
   */
  getProfile: async (id: string): Promise<User> => {
    const { data } = await apolloClient.query({
      query: GET_PROFILE,
      variables: { id },
      fetchPolicy: 'network-only',
    });
    const profile = (data as ProfileQueryData).profile;
    return {
      id: profile?.id ?? id,
      email: '',
      role: '',
      name: profile?.realName ?? '',
      realName: profile?.realName ?? undefined,
      avatarUrl: profile?.avatarUrl ?? undefined,
    };
  },

  /**
   * Updates a user's profile metadata.
   * GraphQL: updateUserProfile
   */
  updateProfile: async (id: string, data: Partial<User>): Promise<User> => {
    const input = {
      realName: data.realName ?? data.name,
      avatarUrl: data.avatarUrl,
    };
    const { data: result } = await apolloClient.mutate({
      mutation: UPDATE_USER_PROFILE,
      variables: { id, input },
    });
    return normalizeUser((result as UpdateUserProfileMutationData).updateUserProfile);
  },

  /**
   * Fetches a user's achievements/badges.
   * GraphQL: achievements
   */
  getAchievements: async (id: string): Promise<AchievementsQueryData['achievements']> => {
    const { data } = await apolloClient.query({
      query: GET_ACHIEVEMENTS,
      variables: { userId: id },
      fetchPolicy: 'network-only',
    });
    return (data as AchievementsQueryData).achievements;
  },
};

export default UsersService;

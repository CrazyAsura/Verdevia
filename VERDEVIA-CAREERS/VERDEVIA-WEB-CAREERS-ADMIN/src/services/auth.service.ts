import { getApolloClient } from '@/lib/apollo-client';
import { LOGIN_USER, REQUEST_PASSWORD_RESET, RESET_PASSWORD } from '@/graphql/mutations/users';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  plan?: string;
  subscriptionStatus?: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export interface PasswordResetResponse {
  message: string;
}

interface LoginMutationData {
  loginUser: {
    token: string;
    user: {
      id: string;
      email: string;
      role: string;
      profile?: { realName?: string | null } | null;
      plan?: string | null;
      subscription?: {
        plan?: string | null;
        subscriptionStatus?: string | null;
      } | null;
      subscriptionStatus?: string | null;
    };
  };
}

interface RequestPasswordResetMutationData {
  requestPasswordReset: PasswordResetResponse;
}

interface ResetPasswordMutationData {
  resetPassword: PasswordResetResponse;
}

const AuthService = {
  /**
   * Authenticates a user against the real backend.
   * GraphQL: loginUser
   * Returns { user, token } on success.
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await getApolloClient().mutate({
      mutation: LOGIN_USER,
      variables: { input: { email, password } },
    });
    const raw = (data as LoginMutationData).loginUser;

    // The backend entity nests the display name inside profile.realName.
    // Normalize to the flat AuthUser shape expected by AuthContext.
    const user: AuthUser = {
      id: raw.user.id,
      email: raw.user.email,
      role: raw.user.role,
      name: raw.user.profile?.realName ?? raw.user.email,
      plan: raw.user.plan ?? raw.user.subscription?.plan ?? undefined,
      subscriptionStatus:
        raw.user.subscriptionStatus ??
        raw.user.subscription?.subscriptionStatus ??
        undefined,
    };

    return { user, token: raw.token };
  },

  requestPasswordReset: async (
    email: string,
    portal: 'admin' | 'super-admin' | 'contractor' | 'super-contractor',
  ): Promise<PasswordResetResponse> => {
    const { data } = await getApolloClient().mutate({
      mutation: REQUEST_PASSWORD_RESET,
      variables: { input: { email, portal } },
    });
    return (data as RequestPasswordResetMutationData).requestPasswordReset;
  },

  resetPassword: async (
    email: string,
    token: string,
    password: string,
  ): Promise<PasswordResetResponse> => {
    const { data } = await getApolloClient().mutate({
      mutation: RESET_PASSWORD,
      variables: { input: { email, token, password } },
    });
    return (data as ResetPasswordMutationData).resetPassword;
  },

  /**
   * Persists the auth session to localStorage.
   * Called after a successful login to keep the token available for API interceptors.
   */
  persistSession: (user: AuthUser, token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('VERDEVIA_user', JSON.stringify(user));
      localStorage.setItem('VERDEVIA_token', token);
    }
  },

  /**
   * Clears the local session (logout).
   */
  clearSession: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('VERDEVIA_user');
      localStorage.removeItem('VERDEVIA_token');
    }
  },
};

export default AuthService;


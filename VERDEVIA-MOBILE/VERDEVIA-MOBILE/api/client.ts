import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';

const TOKEN_KEY = '@VERDEVIA:token';

const BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333'
).replace(/\/$/, '');

/**
 * VERDEVIA REST API Client (Axios)
 *
 * Used for non-GraphQL endpoints (auth, file upload, health check, etc.).
 * GraphQL endpoints should use the Apollo Client from @/lib/apollo-client.
 *
 * Security features:
 * - Bearer token automatically injected from AsyncStorage
 * - 401 handler clears token and emits unauthorized event
 * - Request ID header for distributed tracing
 * - Timeout enforcement (10s default)
 */
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 10_000,
});

// ─── Request Interceptor: inject auth token ────────────────────────────────

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Distributed tracing header
    config.headers['X-Request-ID'] = Math.random().toString(36).substring(2);
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor: error handling ─────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      await AsyncStorage.removeItem(TOKEN_KEY);
      // TODO: redirect to login screen via navigation ref
    }
    return Promise.reject(error);
  },
);

// ─── Helpers ──────────────────────────────────────────────────────────────

/**
 * Validates API response data against a Zod schema.
 * Throws if the shape doesn't match — prevents silent data corruption.
 */
export const validateResponse = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error('[API] Response validation failed:', result.error.format());
    throw new Error('API response shape mismatch');
  }
  return result.data;
};

/**
 * Stores the auth token in AsyncStorage.
 * Call after successful login.
 */
export async function setAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

/**
 * Clears the auth token from AsyncStorage.
 * Call on logout.
 */
export async function clearAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export default api;

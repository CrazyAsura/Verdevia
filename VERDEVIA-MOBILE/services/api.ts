import axios from 'axios';
import { DeviceEventEmitter, Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';
import { cryptoHelper } from '../utils/crypto';

/**
 * Resolves the backend base URL dynamically from Metro host, or environment config.
 */
const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  
  // 1. Use env URL if it is configured and is not local loopback
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/$/, '');
  }

  // 2. In development (Metro), resolve IP dynamically from host Uri
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:3333`;
  }

  // 3. Fallback for emulator / localhost
  if (Platform.OS === 'android') return 'http://10.0.2.2:3333';
  return 'http://localhost:3333';
};

export const API_BASE_URL = getBaseUrl();
const getApiOriginUrl = () => API_BASE_URL.replace(/\/api$/, '');

async function ensureSecureSession() {
  if (cryptoHelper.hasSession()) return;

  const clientPublicKeyHex = Array.from(cryptoHelper.ephemeralPublicKey)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  try {
    const response = await axios.post(
      `${getApiOriginUrl()}/api/security/handshake`,
      {
        clientPublicKey: clientPublicKeyHex,
      },
      {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      },
    );
    const { serverPublicKey, sessionToken } = response.data;
    cryptoHelper.setSession(serverPublicKey, sessionToken);
  } catch (error) {
    console.error('[Crypto] Handshake failed:', error);
    throw error;
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// ─── Request: inject JWT and encrypt/compress payload ────────────────────────
api.interceptors.request.use(async (config) => {
  const token = store.getState().auth.token || (await AsyncStorage.getItem('token'));
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Skip security layer for handshake itself
  if (config.url?.includes('/api/security/handshake')) {
    return config;
  }

  await ensureSecureSession();

  // Always attach session token for server to decrypt/decompress response
  config.headers['x-session-token'] = cryptoHelper.getSessionToken() || '';

  if (config.data) {
    try {
      const plaintext = JSON.stringify(config.data);
      const encrypted = cryptoHelper.encryptAndCompress(plaintext);

      config.data = { payload: encrypted.ciphertext };
      config.headers['x-iv'] = encrypted.iv;
      config.headers['x-auth-tag'] = encrypted.authTag;
    } catch (err) {
      console.error('[Crypto] Request encrypt/compress failed:', err);
      return Promise.reject(err);
    }
  }


  return config;
});

// ─── Response: decrypt/decompress payload and handle 401 ─────────────────────
api.interceptors.response.use(
  (response) => {
    if (response.config.url?.includes('/api/security/handshake')) {
      return response;
    }

    const iv = response.headers['x-iv'] || response.headers['X-IV'];
    const authTag = response.headers['x-auth-tag'] || response.headers['X-Auth-Tag'];

    if (response.data && response.data.payload && iv && authTag) {
      try {
        const decryptedPlaintext = cryptoHelper.decryptAndDecompress(
          response.data.payload,
          iv as string,
          authTag as string,
        );
        response.data = JSON.parse(decryptedPlaintext);
      } catch (err) {
        console.error('[Crypto] Response decrypt/decompress failed:', err);
        return Promise.reject(err);
      }
    }

    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      AsyncStorage.multiRemove(['user', 'token']).catch(() => undefined);
      import('../store/slices/authSlice').then(({ logout }) => {
        store.dispatch(logout());
      });
      DeviceEventEmitter.emit('VERDEVIA:unauthorized');
    }
    return Promise.reject(error);
  }
);

export default api;

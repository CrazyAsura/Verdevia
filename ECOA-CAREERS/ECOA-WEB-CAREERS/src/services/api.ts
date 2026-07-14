import axios from 'axios';
import { cryptoHelper } from '../utils/crypto';

export const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `${window.location.origin}/api`;
  }

  return 'http://localhost:3333';
};

const getSecurityHandshakeUrl = () => {
  const baseUrl = getApiBaseUrl();
  return baseUrl.endsWith('/api')
    ? `${baseUrl}/security/handshake`
    : `${baseUrl}/api/security/handshake`;
};

async function ensureSecureSession() {
  if (cryptoHelper.hasSession()) return;

  const clientPublicKeyHex = Array.from(cryptoHelper.ephemeralPublicKey)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  try {
    const response = await axios.post(getSecurityHandshakeUrl(), {
      clientPublicKey: clientPublicKeyHex,
    });
    const { serverPublicKey, sessionToken } = response.data;
    cryptoHelper.setSession(serverPublicKey, sessionToken);
  } catch (error) {
    console.error('[Crypto] Handshake failed:', error);
    throw error;
  }
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request: inject JWT and encrypt/compress payload ────────────────────────
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ECOA_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Skip security layer for handshake itself
  if (config.url?.includes('/api/security/handshake')) {
    return config;
  }

  await ensureSecureSession();

  // Always attach session token for server to decrypt/decompress response
  config.headers['x-session-token'] = cryptoHelper.getSessionToken() || '';


  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type'];
    return config;
  }

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
    if (typeof window !== 'undefined') {
      if (error.response?.status === 401) {
        localStorage.removeItem('ECOA_token');
        localStorage.removeItem('ECOA_user');
        window.location.href = '/';
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Erro inesperado no servidor';
      window.dispatchEvent(
        new CustomEvent('ECOA-toast', {
          detail: {
            message: errorMessage,
            type: 'error',
          },
        })
      );
    }
    return Promise.reject(error);
  }
);

export default api;

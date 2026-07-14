/**
 * Simple encryption utility for URL parameters.
 * In a real production app, use a proper library like crypto-js.
 */

export function encryptParam(text: string): string {
  // Simple Base64 encoding + salt for demonstration
  const salt = 'VERDEVIA_secure_';
  return btoa(salt + text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decryptParam(encoded: string): string {
  try {
    const salt = 'VERDEVIA_secure_';
    const decoded = atob(encoded.replace(/-/g, '+').replace(/_/g, '/'));
    if (decoded.startsWith(salt)) {
      return decoded.replace(salt, '');
    }
    return decoded;
  } catch {
    return '';
  }
}

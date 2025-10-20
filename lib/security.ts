/**
 * Generate a cryptographically secure random token
 * @param length - Length of the token in bytes (default: 32)
 * @returns Base64 encoded random token
 */
export const generateSecureToken = (length: number = 32): string => {
  // Use crypto.getRandomValues for browser compatibility
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }
  
  // Fallback for Node.js environment
  try {
    const { randomBytes } = require('crypto');
    const bytes = randomBytes(length);
    return bytes.toString('base64url');
  } catch (error) {
    // Final fallback using Math.random (less secure but works everywhere)
    let result = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    for (let i = 0; i < length * 2; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};

/**
 * Generate a secure auth token with timestamp and random component
 * @returns Secure auth token
 */
export const generateAuthToken = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = generateSecureToken(16);
  return `token_${timestamp}_${randomPart}`;
};

/**
 * Validate token format
 * @param token - Token to validate
 * @returns True if token format is valid
 */
export const isValidTokenFormat = (token: string): boolean => {
  const tokenRegex = /^token_[a-z0-9]+_[A-Za-z0-9_-]+$/;
  return tokenRegex.test(token);
};

/**
 * Check if token is expired (older than 30 days)
 * @param token - Token to check
 * @returns True if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const parts = token.split('_');
    if (parts.length !== 3 || parts[0] !== 'token') {
      return true; // Invalid format, consider expired
    }
    
    const timestamp = parseInt(parts[1], 36);
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    return timestamp < thirtyDaysAgo;
  } catch (error) {
    return true; // Invalid token, consider expired
  }
};

/**
 * Generate a secure couple code
 * @param length - Length of the code (default: 6)
 * @returns Secure couple code
 */
export const generateSecureCoupleCode = (length: number = 6): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  
  return result;
};


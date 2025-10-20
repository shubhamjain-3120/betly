import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const AUTH_TOKEN_KEY = 'bet_platform_auth_token';

export interface AuthUser {
  id: string;
  name: string;
  couple_id: string;
  partner_id: string | null;
  is_paired: boolean;
  auth_token: string;
}

export interface Couple {
  id: string;
  couple_code: string;
  created_at: string;
}

// Store auth token
export const storeAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error storing auth token:', error);
    }
    throw error;
  }
};

// Get stored auth token
export const getStoredAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error getting auth token:', error);
    }
    return null;
  }
};

// Clear auth token (logout)
export const clearAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error clearing auth token:', error);
    }
    throw error;
  }
};

// Get current user data using auth token
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const token = await getStoredAuthToken();
    if (!token) return null;

    // Check if token is expired
    const { isTokenExpired, isValidTokenFormat } = require('./security');
    if (!isValidTokenFormat(token) || isTokenExpired(token)) {
      console.warn('Token is invalid or expired, clearing auth');
      await clearAuthToken();
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        couple_id,
        partner_id,
        is_paired,
        auth_token
      `)
      .eq('auth_token', token);

    if (error || !data || data.length === 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error fetching user:', error);
      }
      return null;
    }

    return data[0] as AuthUser;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error getting current user:', error);
    }
    return null;
  }
};

// Get current couple data
export const getCurrentCouple = async (): Promise<Couple | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('couples')
      .select('id, couple_code, created_at')
      .eq('id', user.couple_id);

    if (error || !data || data.length === 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error fetching couple:', error);
      }
      return null;
    }

    return data[0] as Couple;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error getting current couple:', error);
    }
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    return user !== null;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error checking authentication:', error);
    }
    return false;
  }
};

// Login with auth token
export const loginWithToken = async (token: string): Promise<AuthUser | null> => {
  try {
    // Store the token
    await storeAuthToken(token);
    
    // Get user data
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error logging in with token:', error);
    }
    return null;
  }
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    await clearAuthToken();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error logging out:', error);
    }
    throw error;
  }
};

// Generate auth token using secure method
export const generateAuthToken = (): string => {
  const { generateAuthToken: secureGenerateAuthToken } = require('./security');
  return secureGenerateAuthToken();
};

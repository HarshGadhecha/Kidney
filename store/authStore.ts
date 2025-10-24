/**
 * Authentication State Store
 * Manages user authentication, session, and premium status
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User, AuthState } from '../types';

interface AuthStore extends AuthState {
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setPremiumStatus: (isPremium: boolean, expiryDate?: string) => void;
  signIn: (user: User, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  checkPremiumStatus: () => Promise<void>;
}

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';
const PREMIUM_STATUS_KEY = 'premium_status';

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  token: null,
  isAuthenticated: false,
  isPremium: false,
  subscriptionExpiry: undefined,

  // Set user
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  // Set token
  setToken: (token) => {
    set({ token });
  },

  // Set premium status
  setPremiumStatus: (isPremium, expiryDate) => {
    set({ isPremium, subscriptionExpiry: expiryDate });
  },

  // Sign in
  signIn: async (user, token) => {
    try {
      // Store in secure storage
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(user));

      // Update state
      set({
        user,
        token,
        isAuthenticated: true,
      });

      // Check premium status
      await get().checkPremiumStatus();
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  // Sign out
  signOut: async () => {
    try {
      // Clear secure storage
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_DATA_KEY);
      await SecureStore.deleteItemAsync(PREMIUM_STATUS_KEY);

      // Clear state
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isPremium: false,
        subscriptionExpiry: undefined,
      });
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  // Load stored authentication
  loadStoredAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      const userData = await SecureStore.getItemAsync(USER_DATA_KEY);

      if (token && userData) {
        const user = JSON.parse(userData) as User;

        set({
          user,
          token,
          isAuthenticated: true,
        });

        // Check premium status
        await get().checkPremiumStatus();
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    }
  },

  // Check premium status
  checkPremiumStatus: async () => {
    try {
      const premiumData = await SecureStore.getItemAsync(PREMIUM_STATUS_KEY);

      if (premiumData) {
        const { isPremium, expiryDate } = JSON.parse(premiumData);

        // Check if subscription is still valid
        if (isPremium && expiryDate) {
          const now = new Date();
          const expiry = new Date(expiryDate);

          if (now < expiry) {
            set({ isPremium: true, subscriptionExpiry: expiryDate });
          } else {
            set({ isPremium: false, subscriptionExpiry: undefined });
            await SecureStore.deleteItemAsync(PREMIUM_STATUS_KEY);
          }
        } else if (isPremium && !expiryDate) {
          // Lifetime premium or no expiry
          set({ isPremium: true });
        }
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  },
}));

// Helper to save premium status
export async function savePremiumStatus(
  isPremium: boolean,
  expiryDate?: string
): Promise<void> {
  try {
    await SecureStore.setItemAsync(
      PREMIUM_STATUS_KEY,
      JSON.stringify({ isPremium, expiryDate })
    );

    useAuthStore.getState().setPremiumStatus(isPremium, expiryDate);
  } catch (error) {
    console.error('Error saving premium status:', error);
    throw error;
  }
}

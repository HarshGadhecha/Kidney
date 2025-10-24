/**
 * App Settings Store
 * Manages app configuration, preferences, and notification settings
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, ColorScheme } from '../types';

interface SettingsStore extends AppSettings {
  // Actions
  setTheme: (theme: ColorScheme | 'auto') => Promise<void>;
  setLanguage: (language: string) => Promise<void>;
  setUnits: (units: Partial<AppSettings['units']>) => Promise<void>;
  setNotificationSettings: (
    settings: Partial<AppSettings['notifications']>
  ) => Promise<void>;
  loadSettings: () => Promise<void>;
  resetSettings: () => Promise<void>;
}

const SETTINGS_KEY = 'app_settings';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'auto',
  language: 'en',
  units: {
    weight: 'kg',
    height: 'cm',
    temperature: 'c',
    fluid: 'ml',
  },
  notifications: {
    labAlerts: true,
    medicationReminders: true,
    fluidAlerts: true,
    vitalAlerts: true,
    appointmentReminders: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  },
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...DEFAULT_SETTINGS,

  // Set theme
  setTheme: async (theme) => {
    try {
      const settings = { ...get(), theme };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      set({ theme });
    } catch (error) {
      console.error('Error setting theme:', error);
      throw error;
    }
  },

  // Set language
  setLanguage: async (language) => {
    try {
      const settings = { ...get(), language };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      set({ language });
    } catch (error) {
      console.error('Error setting language:', error);
      throw error;
    }
  },

  // Set units
  setUnits: async (newUnits) => {
    try {
      const units = { ...get().units, ...newUnits };
      const settings = { ...get(), units };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      set({ units });
    } catch (error) {
      console.error('Error setting units:', error);
      throw error;
    }
  },

  // Set notification settings
  setNotificationSettings: async (newSettings) => {
    try {
      const notifications = { ...get().notifications, ...newSettings };
      const settings = { ...get(), notifications };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      set({ notifications });
    } catch (error) {
      console.error('Error setting notification settings:', error);
      throw error;
    }
  },

  // Load settings
  loadSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);

      if (stored) {
        const settings = JSON.parse(stored) as AppSettings;
        set(settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  },

  // Reset settings
  resetSettings: async () => {
    try {
      await AsyncStorage.removeItem(SETTINGS_KEY);
      set(DEFAULT_SETTINGS);
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  },
}));

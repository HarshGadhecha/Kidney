/**
 * Modern theme configuration for Kidney Care App
 * Healthcare-focused color palette with excellent accessibility
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Primary colors - Calming medical blues
    primary: '#0066CC',
    primaryDark: '#004C99',
    primaryLight: '#E6F2FF',

    // Secondary colors - Healing greens
    secondary: '#00B894',
    secondaryDark: '#00856A',
    secondaryLight: '#E6F9F5',

    // Background
    background: '#FFFFFF',
    backgroundSecondary: '#F8FAFB',
    surface: '#FFFFFF',

    // Text
    text: '#1A2332',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',

    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Chart colors
    chart: {
      line1: '#0066CC',
      line2: '#00B894',
      line3: '#F59E0B',
      line4: '#8B5CF6',
      line5: '#EC4899',
    },

    // UI elements
    border: '#E5E7EB',
    divider: '#F3F4F6',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.5)',

    // Component specific
    card: '#FFFFFF',
    input: '#F9FAFB',
    disabled: '#D1D5DB',
    placeholder: '#9CA3AF',

    // Vitals specific
    vitals: {
      weight: '#3B82F6',
      bp: '#EF4444',
      oxygen: '#10B981',
      fluid: '#06B6D4',
    },

    // Lab values
    labs: {
      normal: '#10B981',
      warning: '#F59E0B',
      critical: '#EF4444',
    },

    // Tab bar
    tint: '#0066CC',
    icon: '#687076',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#0066CC',
  },

  dark: {
    // Primary colors
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    primaryLight: '#1E3A5F',

    // Secondary colors
    secondary: '#10B981',
    secondaryDark: '#059669',
    secondaryLight: '#1F3A33',

    // Background
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    surface: '#1E293B',

    // Text
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',

    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Chart colors
    chart: {
      line1: '#3B82F6',
      line2: '#10B981',
      line3: '#F59E0B',
      line4: '#A78BFA',
      line5: '#F472B6',
    },

    // UI elements
    border: '#334155',
    divider: '#1E293B',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.7)',

    // Component specific
    card: '#1E293B',
    input: '#0F172A',
    disabled: '#475569',
    placeholder: '#64748B',

    // Vitals specific
    vitals: {
      weight: '#60A5FA',
      bp: '#F87171',
      oxygen: '#34D399',
      fluid: '#22D3EE',
    },

    // Lab values
    labs: {
      normal: '#34D399',
      warning: '#FBBF24',
      critical: '#F87171',
    },

    // Tab bar
    tint: '#3B82F6',
    icon: '#9BA1A6',
    tabIconDefault: '#64748B',
    tabIconSelected: '#3B82F6',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },

  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
};

export const Animations = {
  // Duration
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },

  // Easing curves
  easing: {
    easeInOut: 'ease-in-out',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    spring: 'spring',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export type Theme = typeof Colors.light;
export type ColorScheme = 'light' | 'dark';

/**
 * Badge Component
 * Small status indicator for labs, vitals, and notifications
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useColorScheme } from 'react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
} from '../../constants/theme';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function Badge({
  label,
  variant = 'default',
  size = 'md',
  style,
}: BadgeProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'success':
        return {
          container: {
            backgroundColor: `${colors.success}20`,
            borderColor: colors.success,
          },
          text: { color: colors.success },
        };
      case 'warning':
        return {
          container: {
            backgroundColor: `${colors.warning}20`,
            borderColor: colors.warning,
          },
          text: { color: colors.warning },
        };
      case 'error':
        return {
          container: {
            backgroundColor: `${colors.error}20`,
            borderColor: colors.error,
          },
          text: { color: colors.error },
        };
      case 'info':
        return {
          container: {
            backgroundColor: `${colors.info}20`,
            borderColor: colors.info,
          },
          text: { color: colors.info },
        };
      default:
        return {
          container: {
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
          },
          text: { color: colors.text },
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingHorizontal: Spacing.sm,
            paddingVertical: Spacing.xs,
          },
          text: {
            fontSize: Typography.fontSize.xs,
          },
        };
      case 'lg':
        return {
          container: {
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.sm,
          },
          text: {
            fontSize: Typography.fontSize.base,
          },
        };
      default:
        return {
          container: {
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.xs,
          },
          text: {
            fontSize: Typography.fontSize.sm,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.badge,
        variantStyles.container,
        sizeStyles.container,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          variantStyles.text,
          sizeStyles.text,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
});

/**
 * Modern Button Component
 * Customizable button with variants, sizes, and animations
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../../constants/theme';

interface ButtonProps {
  title?: string;
  children?: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  gradient?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function Button({
  title,
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  gradient = false,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];
  const scale = useSharedValue(1);

  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!isDisabled) {
      scale.value = withSpring(0.96, {
        damping: 15,
        stiffness: 300,
      });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.sm,
            minHeight: 36,
          },
          text: {
            fontSize: Typography.fontSize.sm,
            fontWeight: Typography.fontWeight.semibold,
          },
        };
      case 'lg':
        return {
          container: {
            paddingHorizontal: Spacing.xl,
            paddingVertical: Spacing.md,
            minHeight: 56,
          },
          text: {
            fontSize: Typography.fontSize.lg,
            fontWeight: Typography.fontWeight.bold,
          },
        };
      default:
        return {
          container: {
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.md,
            minHeight: 48,
          },
          text: {
            fontSize: Typography.fontSize.base,
            fontWeight: Typography.fontWeight.semibold,
          },
        };
    }
  };

  const getVariantStyles = (): {
    container: ViewStyle;
    text: TextStyle;
  } => {
    switch (variant) {
      case 'secondary':
        return {
          container: {
            backgroundColor: colors.secondary,
            ...Shadows.sm,
          },
          text: { color: '#FFFFFF' },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: colors.primary,
          },
          text: { color: colors.primary },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: { color: colors.primary },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: colors.error,
            ...Shadows.sm,
          },
          text: { color: '#FFFFFF' },
        };
      default:
        return {
          container: {
            backgroundColor: colors.primary,
            ...Shadows.md,
          },
          text: { color: '#FFFFFF' },
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  const containerStyle: StyleProp<ViewStyle> = [
    styles.button,
    sizeStyles.container,
    variantStyles.container,
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const buttonTextStyle: StyleProp<TextStyle> = [
    styles.text,
    sizeStyles.text,
    variantStyles.text,
    isDisabled && styles.disabledText,
    textStyle,
  ];

  const content = (
    <>
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'outline' || variant === 'ghost'
              ? colors.primary
              : '#FFFFFF'
          }
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text style={buttonTextStyle}>{children || title}</Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </>
  );

  if (gradient && variant === 'primary' && !isDisabled) {
    return (
      <AnimatedTouchable
        style={[animatedStyle, fullWidth && styles.fullWidth]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[containerStyle, { backgroundColor: 'transparent' }]}
        >
          {content}
        </LinearGradient>
      </AnimatedTouchable>
    );
  }

  return (
    <AnimatedTouchable
      style={[animatedStyle, containerStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={0.9}
    >
      {content}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});

/**
 * Modern Input Component
 * Text input with floating label, validation, and icons
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
} from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode | string;
  rightIcon?: React.ReactNode | string;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  multiline?: boolean;
  numberOfLines?: number;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  value,
  onFocus,
  onBlur,
  multiline = false,
  numberOfLines = 1,
  ...props
}: InputProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];
  const [isFocused, setIsFocused] = useState(false);

  const labelPosition = useSharedValue(value ? 1 : 0);
  const borderColor = useSharedValue(colors.border);

  const hasValue = value && value.length > 0;

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withTiming(labelPosition.value === 1 ? -24 : 0, {
          duration: 200,
        }),
      },
      {
        scale: withTiming(labelPosition.value === 1 ? 0.85 : 1, {
          duration: 200,
        }),
      },
    ],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(borderColor.value, { duration: 200 }),
  }));

  const handleFocus = (e: any) => {
    setIsFocused(true);
    labelPosition.value = 1;
    borderColor.value = error ? colors.error : colors.primary;
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (!hasValue) {
      labelPosition.value = 0;
    }
    borderColor.value = error ? colors.error : colors.border;
    onBlur?.(e);
  };

  const getLabelColor = () => {
    if (error) return colors.error;
    if (isFocused) return colors.primary;
    return colors.textSecondary;
  };

  const renderIcon = (icon: React.ReactNode | string | undefined, defaultColor: string) => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return <Ionicons name={icon as any} size={20} color={defaultColor} />;
    }
    return icon;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Animated.View
          style={[
            styles.labelContainer,
            labelAnimatedStyle,
            (isFocused || hasValue) && styles.labelContainerFloating,
          ]}
          pointerEvents="none"
        >
          <Text
            style={[
              styles.label,
              { color: getLabelColor() },
              (isFocused || hasValue) && styles.labelFloating,
            ]}
          >
            {label}
          </Text>
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.inputContainer,
          containerAnimatedStyle,
          {
            backgroundColor: colors.input,
            borderColor: error ? colors.error : colors.border,
          },
          isFocused && {
            borderColor: error ? colors.error : colors.primary,
            borderWidth: 2,
          },
          multiline && styles.inputContainerMultiline,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{renderIcon(leftIcon, colors.textSecondary)}</View>}

        <TextInput
          style={[
            styles.input,
            { color: colors.text },
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            multiline && styles.inputMultiline,
            inputStyle,
          ]}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={colors.placeholder}
          multiline={multiline}
          numberOfLines={numberOfLines}
          {...props}
        />

        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {renderIcon(rightIcon, colors.textSecondary)}
          </TouchableOpacity>
        )}
      </Animated.View>

      {(error || helperText) && (
        <View style={styles.helperContainer}>
          <Text
            style={[
              styles.helperText,
              {
                color: error ? colors.error : colors.textSecondary,
              },
            ]}
          >
            {error || helperText}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  labelContainer: {
    position: 'absolute',
    left: Spacing.md,
    top: 16,
    zIndex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.xs,
  },
  labelContainerFloating: {
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.regular,
  },
  labelFloating: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    minHeight: 56,
    paddingHorizontal: Spacing.md,
  },
  inputContainerMultiline: {
    minHeight: 100,
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.regular,
    paddingVertical: Spacing.sm,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  inputWithLeftIcon: {
    paddingLeft: Spacing.sm,
  },
  inputWithRightIcon: {
    paddingRight: Spacing.sm,
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
  },
  helperContainer: {
    marginTop: Spacing.xs,
    marginLeft: Spacing.md,
  },
  helperText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
  },
});

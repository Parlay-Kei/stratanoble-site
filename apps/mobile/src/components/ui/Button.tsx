import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const buttonStyles = [
    styles.base,
    styles.sizes[size],
    styles.variants[variant],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles.textSizes[size],
    styles.textVariants[variant],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#ffffff' : '#1e3a8a'}
          style={styles.spinner}
        />
      )}
      <Text style={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  sizes: {
    sm: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      minHeight: 36,
    },
    md: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: 44,
    },
    lg: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      minHeight: 52,
    },
  },
  variants: {
    primary: {
      backgroundColor: '#1e3a8a', // Navy blue
    },
    secondary: {
      backgroundColor: '#10b981', // Emerald
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#d1d5db',
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  },
  disabled: {
    backgroundColor: '#e5e7eb',
    borderColor: '#e5e7eb',
  },
  text: {
    fontWeight: '600',
  },
  textSizes: {
    sm: {
      fontSize: 14,
    },
    md: {
      fontSize: 16,
    },
    lg: {
      fontSize: 18,
    },
  },
  textVariants: {
    primary: {
      color: '#ffffff',
    },
    secondary: {
      color: '#ffffff',
    },
    outline: {
      color: '#374151',
    },
    ghost: {
      color: '#1e3a8a',
    },
  },
  disabledText: {
    color: '#9ca3af',
  },
  spinner: {
    marginRight: 8,
  },
});
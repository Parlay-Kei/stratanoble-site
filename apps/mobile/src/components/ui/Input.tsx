import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
  variant?: 'default' | 'outline' | 'filled';
}

export function Input({
  label,
  error,
  hint,
  containerStyle,
  variant = 'outline',
  style,
  ...props
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          styles.variants[variant],
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      {hint && !error && <Text style={styles.hintText}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: '#374151',
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  variants: {
    default: {
      backgroundColor: 'transparent',
      borderBottomWidth: 1,
      borderBottomColor: '#d1d5db',
      borderRadius: 0,
    },
    outline: {
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#d1d5db',
    },
    filled: {
      backgroundColor: '#f9fafb',
      borderWidth: 1,
      borderColor: 'transparent',
    },
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
  hintText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
});
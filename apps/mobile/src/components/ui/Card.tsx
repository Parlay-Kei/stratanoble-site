import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ 
  children, 
  style, 
  variant = 'default', 
  padding = 'md' 
}: CardProps) {
  const cardStyles = [
    styles.base,
    styles.variants[variant],
    styles.padding[padding],
    style,
  ];

  return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  variants: {
    default: {
      // No additional styling
    },
    elevated: {
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    outlined: {
      borderWidth: 1,
      borderColor: '#e5e7eb',
    },
  },
  padding: {
    none: {
      padding: 0,
    },
    sm: {
      padding: 12,
    },
    md: {
      padding: 16,
    },
    lg: {
      padding: 20,
    },
  },
});
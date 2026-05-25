// components/Button/Button.tsx
// A flexible button component with variants, sizes, and loading state

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';

// Define all possible props for the Button component
// Using TypeScript interfaces ensures type safety and better IDE support
interface ButtonProps {
  // The text displayed inside the button
  title: string;

  // Function called when button is pressed
  onPress: (event: GestureResponderEvent) => void;

  // Visual style variant - determines colors and borders
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';

  // Size affects padding and font size
  size?: 'small' | 'medium' | 'large';

  // Shows spinner and disables interaction when true
  loading?: boolean;

  // Prevents interaction when true
  disabled?: boolean;

  // Optional icon component to display before text
  leftIcon?: React.ReactNode;

  // Optional icon component to display after text
  rightIcon?: React.ReactNode;

  // Custom styles to override defaults
  style?: ViewStyle;
  textStyle?: TextStyle;

  // Accessibility label for screen readers
  accessibilityLabel?: string;
}

// Main Button component using functional component with destructured props
export const Buttons: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  accessibilityLabel,
}) => {
  // Determine if button should be non-interactive
  const isDisabled = disabled || loading;

  // Combine multiple style objects based on current state
  // Order matters - later styles override earlier ones
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[`${size}Button`],
    isDisabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    isDisabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {/* Show loading spinner when loading prop is true */}
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : '#007AFF'}
        />
      ) : (
        <>
          {/* Render left icon if provided */}
          {leftIcon && <>{leftIcon}</>}

          {/* Button text */}
          <Text style={textStyles}>{title}</Text>

          {/* Render right icon if provided */}
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
};

// StyleSheet.create provides performance optimizations
// and validates style properties at compile time
const styles = StyleSheet.create({
  // Base styles applied to all buttons
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    gap: 0,
  },

  // Variant styles - each defines unique appearance
  primary: {
    backgroundColor: '#1C2942',
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: '#E5E5EA',
    borderWidth: 0,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },

  // Size styles for button container
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 28,
  },

  // Disabled state overlay
  disabled: {
    opacity: 0.5,
  },

  // Text base styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },

  // Text variant colors
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#000000',
  },
  outlineText: {
    color: '#007AFF',
  },
  ghostText: {
    color: '#007AFF',
  },

  // Text size styles
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },

  disabledText: {
    color: '#8E8E93',
  },
});
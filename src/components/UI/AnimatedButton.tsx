import React from 'react';
import {
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { useScaleAnimation, useHapticFeedback } from '../../hooks/useAnimations';
import { useTheme } from '../../context/ThemeContext';

type AnimatedButtonProps = {
  onPress: () => void;
  text: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'filled' | 'outlined' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  hapticFeedback?: boolean;
  animationDuration?: number;
};

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  text,
  style,
  textStyle,
  disabled = false,
  loading = false,
  variant = 'filled',
  size = 'medium',
  iconLeft,
  iconRight,
  fullWidth = false,
  hapticFeedback = true,
  animationDuration = 150,
}) => {
  const { theme } = useTheme();
  const { scaleAnim, pressIn, pressOut } = useScaleAnimation(animationDuration);
  const { triggerImpact } = useHapticFeedback();

  const handlePressIn = () => {
    pressIn();
  };

  const handlePressOut = () => {
    pressOut();
  };

  const handlePress = () => {
    if (disabled || loading) return;
    
    if (hapticFeedback) {
      triggerImpact('light');
    }
    
    onPress();
  };

  const getButtonStyles = (): ViewStyle => {
    let buttonStyle: ViewStyle = {};
    
    // Base styles
    buttonStyle = {
      ...styles.button,
      ...getSizeStyles(),
      ...(fullWidth && styles.fullWidth),
    };
    
    // Variant styles
    switch (variant) {
      case 'filled':
        buttonStyle = {
          ...buttonStyle,
          backgroundColor: theme.colors.primary,
          borderWidth: 0,
        };
        break;
      case 'outlined':
        buttonStyle = {
          ...buttonStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.primary,
        };
        break;
      case 'ghost':
        buttonStyle = {
          ...buttonStyle,
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
        break;
    }
    
    // Disabled state
    if (disabled) {
      buttonStyle = {
        ...buttonStyle,
        opacity: 0.5,
      };
    }
    
    return buttonStyle;
  };

  const getTextStyles = (): TextStyle => {
    let textStyles: TextStyle = {
      ...styles.text,
    };
    
    // Size-based text styles
    switch (size) {
      case 'small':
        textStyles = {
          ...textStyles,
          fontSize: theme.typography.fontSize.sm,
        };
        break;
      case 'medium':
        textStyles = {
          ...textStyles,
          fontSize: theme.typography.fontSize.md,
        };
        break;
      case 'large':
        textStyles = {
          ...textStyles,
          fontSize: theme.typography.fontSize.lg,
        };
        break;
    }
    
    // Variant-based text styles
    switch (variant) {
      case 'filled':
        textStyles = {
          ...textStyles,
          color: theme.colors.text.inverse,
        };
        break;
      case 'outlined':
      case 'ghost':
        textStyles = {
          ...textStyles,
          color: theme.colors.primary,
        };
        break;
    }
    
    return textStyles;
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radius.sm,
        };
      case 'medium':
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radius.md,
        };
      case 'large':
        return {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.xl,
          borderRadius: theme.radius.lg,
        };
    }
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
    >
      <Animated.View
        style={[
          getButtonStyles(),
          {
            transform: [{ scale: scaleAnim }],
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'filled' ? theme.colors.text.inverse : theme.colors.primary}
          />
        ) : (
          <Animated.View style={styles.contentContainer}>
            {iconLeft && <Animated.View style={styles.iconLeft}>{iconLeft}</Animated.View>}
            <Text style={[getTextStyles(), textStyle]}>{text}</Text>
            {iconRight && <Animated.View style={styles.iconRight}>{iconRight}</Animated.View>}
          </Animated.View>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default AnimatedButton;
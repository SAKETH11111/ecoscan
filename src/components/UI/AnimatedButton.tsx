import React, { useEffect } from 'react';
import {
  TouchableWithoutFeedback,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
  withSequence,
  withRepeat,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useScaleAnimation, useHapticFeedback } from '../../hooks/useAnimations';
import { useTheme } from '../../context/ThemeContext';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

type AnimatedButtonProps = {
  onPress: () => void;
  text: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'filled' | 'outlined' | 'ghost' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  hapticFeedback?: boolean;
  animationDuration?: number;
  gradientColors?: string[];
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
  gradientColors,
}) => {
  const { theme, isDark } = useTheme();
  
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const elevation = useSharedValue(isDark ? 2 : 4);
  const gradientProgress = useSharedValue(0);
  const highlightOpacity = useSharedValue(0);
  
  const { triggerImpact } = useHapticFeedback();

  // Start subtle gradient animation if using gradient variant
  useEffect(() => {
    if (variant === 'gradient' && !disabled) {
      startGradientAnimation();
    }
    
    return () => {
      cancelAnimation(gradientProgress);
    };
  }, [variant, disabled]);
  
  // Gradient animation
  const startGradientAnimation = () => {
    gradientProgress.value = 0;
    gradientProgress.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  };

  // Handle press in animation
  const handlePressIn = () => {
    if (disabled || loading) return;
    
    // Scale down button
    scale.value = withTiming(0.96, { 
      duration: animationDuration,
      easing: Easing.out(Easing.quad)
    });
    
    // Lower elevation
    elevation.value = withTiming(isDark ? 1 : 2, { 
      duration: animationDuration 
    });
    
    // Add highlight flash
    highlightOpacity.value = withSequence(
      withTiming(0.12, { duration: 50 }),
      withTiming(0.05, { duration: 150 })
    );
  };

  // Handle press out animation
  const handlePressOut = () => {
    if (disabled || loading) return;
    
    // Scale back up
    scale.value = withTiming(1, {
      duration: animationDuration,
      easing: Easing.out(Easing.quad)
    });
    
    // Restore elevation
    elevation.value = withTiming(isDark ? 2 : 4, { 
      duration: animationDuration 
    });
    
    // Fade out highlight
    highlightOpacity.value = withTiming(0, { duration: 150 });
  };

  // Handle the button press
  const handlePress = () => {
    if (disabled || loading) return;
    
    if (hapticFeedback) {
      triggerImpact('light');
    }
    
    onPress();
  };
  
  // Get the style for the button based on variant, size, and state
  const getButtonStyle = (): ViewStyle => {
    let buttonStyle: ViewStyle = {
      ...styles.button,
      ...getSizeStyles(),
      ...(fullWidth && styles.fullWidth),
    };
    
    // Handle disabled state
    if (disabled) {
      return {
        ...buttonStyle,
        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        opacity: 0.5,
      };
    }
    
    // Apply variant styles
    switch (variant) {
      case 'filled':
        return {
          ...buttonStyle,
          backgroundColor: theme.primary,
        };
      case 'outlined':
        return {
          ...buttonStyle,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: theme.primary,
        };
      case 'ghost':
        return {
          ...buttonStyle,
          backgroundColor: 'transparent',
          borderWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        };
      case 'gradient':
        return {
          ...buttonStyle,
          backgroundColor: 'transparent', // Gradient will be applied in the gradient component
        };
      default:
        return buttonStyle;
    }
  };

  // Get text styles based on variant
  const getTextStyle = (): TextStyle => {
    let style: TextStyle = {
      ...styles.text,
    };
    
    // Size-based text styles
    switch (size) {
      case 'small':
        style.fontSize = theme.fontSizeSm;
        break;
      case 'medium':
        style.fontSize = theme.fontSizeMd;
        break;
      case 'large':
        style.fontSize = theme.fontSizeLg;
        break;
    }
    
    // Variant-based text styles
    switch (variant) {
      case 'filled':
      case 'gradient':
        style.color = isDark ? '#FFFFFF' : theme.textInverse;
        break;
      case 'outlined':
      case 'ghost':
        style.color = theme.primary;
        break;
    }
    
    if (disabled) {
      style.color = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
    }
    
    return style;
  };

  // Get size styles
  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: theme.xs,
          paddingHorizontal: theme.md,
          borderRadius: theme.radius.sm,
        };
      case 'medium':
        return {
          paddingVertical: theme.sm,
          paddingHorizontal: theme.lg,
          borderRadius: theme.radius.md,
        };
      case 'large':
        return {
          paddingVertical: theme.md,
          paddingHorizontal: theme.xl,
          borderRadius: theme.radius.lg,
        };
    }
    
    return {};
  };
  
  // Animation styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      elevation: elevation.value,
    };
  });
  
  // Highlight overlay animation
  const highlightStyle = useAnimatedStyle(() => {
    return {
      opacity: highlightOpacity.value,
    };
  });
  
  // Gradient animation for gradient variant
  const gradientStyle = useAnimatedStyle(() => {
    // Default colors
    const defaultColors = isDark
      ? ['#4DC1A1', '#3AA183']
      : ['#3A9B7A', '#2A7459'];
      
    // Custom colors or default
    const colors = gradientColors || defaultColors;
    
    // Animate gradient position
    return {
      colors,
      start: { x: 0, y: gradientProgress.value * 0.25 },
      end: { x: gradientProgress.value * 0.25 + 0.75, y: 1 },
    };
  });

  // Render the button content
  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'filled' || variant === 'gradient'
            ? isDark ? '#FFFFFF' : theme.textInverse
            : theme.primary
          }
        />
      ) : (
        <Animated.View style={styles.contentContainer}>
          {iconLeft && <Animated.View style={styles.iconLeft}>{iconLeft}</Animated.View>}
          <Text style={[getTextStyle(), textStyle]}>{text}</Text>
          {iconRight && <Animated.View style={styles.iconRight}>{iconRight}</Animated.View>}
        </Animated.View>
      )}
      
      {/* Highlight overlay for press effect */}
      <Animated.View 
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: isDark ? '#FFFFFF' : '#000000',
            borderRadius: getButtonStyle().borderRadius,
          },
          highlightStyle
        ]}
      />
    </>
  );

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
    >
      {variant === 'gradient' ? (
        <AnimatedLinearGradient
          style={[getButtonStyle(), animatedStyle, style]}
          animatedProps={gradientStyle}
        >
          {renderContent()}
        </AnimatedLinearGradient>
      ) : (
        <Animated.View style={[getButtonStyle(), animatedStyle, style]}>
          {renderContent()}
        </Animated.View>
      )}
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    elevation: 4, // Android shadow
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
import React from 'react';
import {
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useScaleAnimation, useHapticFeedback } from '../../hooks/useAnimations';
import { useTheme } from '../../context/ThemeContext';

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  activeScale?: number;
  disabled?: boolean;
  hapticFeedback?: boolean;
  elevation?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'none' | 'small' | 'medium' | 'large';
  pressable?: boolean;
  initialDelay?: number;
  animationDuration?: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onPress,
  style,
  activeScale = 0.98,
  disabled = false,
  hapticFeedback = true,
  elevation = 'small',
  borderRadius = 'medium',
  pressable = true,
  initialDelay = 0,
  animationDuration = 200,
}) => {
  const { theme } = useTheme();
  const { scaleAnim, pressIn, pressOut } = useScaleAnimation(animationDuration, 1);
  const { triggerImpact } = useHapticFeedback();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: initialDelay,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    if (pressable && !disabled) {
      pressIn();
    }
  };

  const handlePressOut = () => {
    if (pressable && !disabled) {
      pressOut();
    }
  };

  const handlePress = () => {
    if (pressable && !disabled && onPress) {
      if (hapticFeedback) {
        triggerImpact('light');
      }
      onPress();
    }
  };

  const getBorderRadius = () => {
    switch (borderRadius) {
      case 'none':
        return 0;
      case 'small':
        return theme.radius.sm;
      case 'medium':
        return theme.radius.md;
      case 'large':
        return theme.radius.lg;
      default:
        return theme.radius.md;
    }
  };

  const getElevation = () => {
    switch (elevation) {
      case 'none':
        return {};
      case 'small':
        return theme.small;
      case 'medium':
        return theme.medium;
      case 'large':
        return theme.large;
      default:
        return theme.small;
    }
  };

  const cardStyle = {
    ...styles.card,
    ...getElevation(),
    borderRadius: getBorderRadius(),
    backgroundColor: theme.backgroundCard,
    opacity: fadeAnim,
    transform: [
      {
        scale: pressable
          ? scaleAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [activeScale, 1],
            })
          : 1,
      },
    ],
  };

  const content = (
    <Animated.View style={[cardStyle, style]}>
      {children}
    </Animated.View>
  );

  if (!pressable || disabled) {
    return content;
  }

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
    >
      {content}
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    overflow: 'hidden',
  },
});

export default AnimatedCard;
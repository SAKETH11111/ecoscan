import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useHapticFeedback } from '../hooks/useAnimations';
import { useTheme } from '../context/ThemeContext';

interface ScanButtonProps {
  onPress: () => void;
  size?: number;
  text?: string;
  disabled?: boolean;
}

const ScanButton: React.FC<ScanButtonProps> = ({
  onPress,
  size,
  text = 'Tap to Scan',
  disabled = false,
}) => {
  const { theme } = useTheme();
  const { triggerImpact } = useHapticFeedback();
  
  // Default to theme size if not specified
  const buttonSize = size || 200; // Hardcoded default to prevent type issues
  
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const pulse = useSharedValue(1);
  const rotation = useSharedValue(0);

  // Start pulse animation on mount
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.in(Easing.ease) })
      ),
      -1, // Infinite repeat
      true // Reverse
    );

    return () => {
      cancelAnimation(pulse);
    };
  }, []);

  // Button animations
  const handlePressIn = () => {
    if (disabled) return;
    
    // Scale down animation
    scale.value = withTiming(0.95, { 
      duration: 150,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    
    // Subtle opacity change
    opacity.value = withTiming(0.9, { 
      duration: 150,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    
    // Stop pulse animation
    cancelAnimation(pulse);
    pulse.value = 1;
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    // Scale back up animation
    scale.value = withTiming(1, { 
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1), 
    });
    
    // Restore opacity
    opacity.value = withTiming(1, { 
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    
    // Restart pulse animation after a delay
    pulse.value = withDelay(
      300,
      withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.in(Easing.ease) })
        ),
        -1,
        true
      )
    );
  };

  const handlePress = () => {
    if (disabled) return;
    
    // Trigger haptic feedback
    triggerImpact('medium');
    
    // Add a small rotation animation
    rotation.value = withSequence(
      withTiming(-0.05, { duration: 100 }),
      withTiming(0.05, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
    
    // Call the onPress callback
    onPress();
  };

  // Apply animations to button using useMemo to improve performance
  const animatedMainStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value * pulse.value },
        { rotate: `${rotation.value}rad` },
      ],
      opacity: opacity.value,
    };
  });

  // Inner circle animation - separate content transform to prevent blurry text
  const animatedInnerStyle = useAnimatedStyle(() => {
    // We use a counter-scale to keep text and icon crisp
    return {
      transform: [
        { scale: 1 }
      ],
    };
  });

  // Outer ring animation
  const animatedRingStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(disabled ? 0.3 : 0.7, { duration: 300 }),
      transform: [{ scale: pulse.value }],
    };
  });

  // Calculate sizes for ring
  const ringSize = buttonSize + 20;
  const ringRadius = ringSize / 2;

  // Use useMemo for static styles to improve performance
  const buttonStyle = useMemo(() => ([
    styles.button,
    {
      width: buttonSize,
      height: buttonSize,
      borderRadius: buttonSize / 2,
      backgroundColor: theme.primary,
    },
    animatedMainStyle,
  ]), [buttonSize, theme.primary, animatedMainStyle]);

  const ringStyle = useMemo(() => ([
    styles.ring, 
    { 
      width: ringSize, 
      height: ringSize, 
      borderRadius: ringRadius,
      backgroundColor: theme.primaryLight,
    },
    animatedRingStyle,
  ]), [ringSize, ringRadius, theme.primaryLight, animatedRingStyle]);

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
      >
        <View style={styles.buttonWrapper}>
          {/* Subtle animated ring */}
          <Animated.View style={ringStyle} />
          
          {/* Main button */}
          <Animated.View style={buttonStyle}>
            {/* Content container */}
            <Animated.View style={[styles.content, animatedInnerStyle]}>
              <Ionicons name="camera" size={buttonSize * 0.25} color={theme.textInverse} />
              <Text style={[styles.text, { color: theme.textInverse }]}>{text}</Text>
            </Animated.View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default ScanButton;
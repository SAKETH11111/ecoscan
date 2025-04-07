import { useRef, useEffect } from 'react';
import { Animated, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  useSharedValue,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  useAnimatedStyle,
  cancelAnimation,
  interpolateColor,
  Easing as ReanimatedEasing,
  runOnJS,
  SharedValue,
  useAnimatedProps,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

// Pulse animation hook
export const usePulseAnimation = (
  duration: number = 1500,
  minValue: number = 0.8,
  maxValue: number = 1.1
) => {
  const pulseAnim = useRef(new Animated.Value(minValue)).current;

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: maxValue,
          duration: duration / 2,
          easing: ReanimatedEasing.inOut(ReanimatedEasing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: minValue,
          duration: duration / 2,
          easing: ReanimatedEasing.inOut(ReanimatedEasing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulse = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  return {
    pulseAnim,
    startPulse,
    stopPulse,
  };
};

// Fade in animation hook (Reanimated version)
export const useFadeInAnimation = (
  duration: number = 500,
  initialValue: number = 0,
  delay: number = 0
) => {
  const fadeAnim = useSharedValue(initialValue);

  const fadeIn = (callback?: () => void) => {
    fadeAnim.value = withDelay(
      delay,
      withTiming(
        1,
        {
          duration,
          easing: ReanimatedEasing.out(ReanimatedEasing.ease),
        },
        () => {
          if (callback) {
            runOnJS(callback)();
          }
        }
      )
    );
  };

  const fadeOut = (callback?: () => void) => {
    fadeAnim.value = withTiming(
      0,
      {
        duration,
        easing: ReanimatedEasing.in(ReanimatedEasing.ease),
      },
      () => {
        if (callback) {
          runOnJS(callback)();
        }
      }
    );
  };

  return {
    fadeAnim, // Now a SharedValue
    fadeIn,
    fadeOut,
  };
};

// Scale animation hook
export const useScaleAnimation = (
  duration: number = 300,
  initialValue: number = 1
) => {
  const scaleAnim = useRef(new Animated.Value(initialValue)).current;

  const scaleTo = (value: number, callback?: () => void) => {
    Animated.timing(scaleAnim, {
      toValue: value,
      duration,
      useNativeDriver: true,
      easing: ReanimatedEasing.inOut(ReanimatedEasing.ease),
    }).start(callback);
  };

  const scaleIn = (callback?: () => void) => {
    scaleTo(1, callback);
  };

  const scaleOut = (callback?: () => void) => {
    scaleTo(0, callback);
  };

  const pressIn = () => {
    scaleTo(0.95);
  };

  const pressOut = () => {
    scaleTo(1);
  };

  return {
    scaleAnim,
    scaleTo,
    scaleIn,
    scaleOut,
    pressIn,
    pressOut,
  };
};

// Reanimated Scale Animation Hook
export const useReanimatedScale = (
  duration: number = 300,
  initialValue: number = 1
) => {
  const scale = useSharedValue(initialValue);

  const scaleTo = (value: number, callback?: () => void) => {
    scale.value = withTiming(
      value, 
      { 
        duration, 
        easing: ReanimatedEasing.bezier(0.25, 0.1, 0.25, 1) 
      },
      () => {
        callback && runOnJS(callback)();
      }
    );
  };

  const scaleInSpring = (callback?: () => void) => {
    scale.value = withSpring(
      1, 
      { 
        damping: 12,
        stiffness: 120,
        mass: 0.8,
        overshootClamping: false,
      },
      () => {
        callback && runOnJS(callback)();
      }
    );
  };

  const scaleOutSpring = (callback?: () => void) => {
    scale.value = withSpring(
      0, 
      { 
        damping: 15,
        stiffness: 150,
      },
      () => {
        callback && runOnJS(callback)();
      }
    );
  };

  const pressInAnim = () => {
    scale.value = withTiming(0.95, { duration: 150 });
  };

  const pressOutAnim = () => {
    scale.value = withTiming(1, { duration: 200 });
  };

  const scaleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return {
    scale,
    scaleTo,
    scaleInSpring,
    scaleOutSpring,
    pressInAnim,
    pressOutAnim,
    scaleStyle,
  };
};

// Slide animation hook
export const useSlideAnimation = (
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  distance: number = 100,
  duration: number = 300
) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  const getTransform = () => {
    switch (direction) {
      case 'up':
        return { transform: [{ translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [distance, 0],
        }) }] };
      case 'down':
        return { transform: [{ translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-distance, 0],
        }) }] };
      case 'left':
        return { transform: [{ translateX: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [distance, 0],
        }) }] };
      case 'right':
        return { transform: [{ translateX: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-distance, 0],
        }) }] };
    }
  };

  const slideIn = (callback?: () => void) => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration,
      useNativeDriver: true,
      easing: ReanimatedEasing.out(ReanimatedEasing.ease),
    }).start(callback);
  };

  const slideOut = (callback?: () => void) => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration,
      useNativeDriver: true,
      easing: ReanimatedEasing.in(ReanimatedEasing.ease),
    }).start(callback);
  };

  return {
    slideAnim,
    getTransform,
    slideIn,
    slideOut,
  };
};

// Reanimated Slide Animation Hook
export const useReanimatedSlide = (
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  distance: number = 100,
  duration: number = 300
) => {
  const progress = useSharedValue(0);
  
  const slideIn = (callback?: () => void) => {
    progress.value = withTiming(
      1, 
      { 
        duration,
        easing: ReanimatedEasing.bezier(0.16, 1, 0.3, 1) 
      },
      () => {
        callback && runOnJS(callback)();
      }
    );
  };
  
  const slideOut = (callback?: () => void) => {
    progress.value = withTiming(
      0, 
      { 
        duration,
        easing: ReanimatedEasing.bezier(0.16, 1, 0.3, 1) 
      },
      () => {
        callback && runOnJS(callback)();
      }
    );
  };
  
  const slideStyle = useAnimatedStyle(() => {
    let translateX = 0;
    let translateY = 0;
    
    switch (direction) {
      case 'up':
        translateY = (1 - progress.value) * distance;
        break;
      case 'down':
        translateY = (1 - progress.value) * -distance;
        break;
      case 'left':
        translateX = (1 - progress.value) * distance;
        break;
      case 'right':
        translateX = (1 - progress.value) * -distance;
        break;
    }
    
    return {
      transform: [
        { translateX },
        { translateY },
      ],
      opacity: progress.value,
    };
  });
  
  return {
    progress,
    slideIn,
    slideOut,
    slideStyle,
  };
};

// Progress animation hook
export const useProgressAnimation = (
  initialValue: number = 0,
  duration: number = 1000
) => {
  const progressAnim = useRef(new Animated.Value(initialValue)).current;

  const animateProgress = (toValue: number, callback?: () => void) => {
    Animated.timing(progressAnim, {
      toValue,
      duration,
      useNativeDriver: false,
      easing: ReanimatedEasing.inOut(ReanimatedEasing.ease),
    }).start(callback);
  };

  return {
    progressAnim,
    animateProgress,
  };
};

// Haptic feedback hook
export const useHapticFeedback = () => {
  const triggerImpact = (intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (Platform.OS !== 'web') {
      switch (intensity) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
    }
  };

  const triggerNotification = (type: 'success' | 'warning' | 'error' = 'success') => {
    if (Platform.OS !== 'web') {
      switch (type) {
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    }
  };

  const triggerSelection = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };

  return {
    triggerImpact,
    triggerNotification,
    triggerSelection,
  };
};

// Combine multiple animations
export const useCombinedAnimation = (animations: Animated.Value[]) => {
  const startAll = (callback?: () => void) => {
    Animated.parallel(
      animations.map(anim => 
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: ReanimatedEasing.out(ReanimatedEasing.ease),
        })
      )
    ).start(callback);
  };

  const resetAll = (callback?: () => void) => {
    animations.forEach(anim => anim.setValue(0));
    if (callback) callback();
  };

  return {
    startAll,
    resetAll,
  };
};

// Animated gradient background hook
type GradientPreset = 'primary' | 'success' | 'warning' | 'info' | 'neutral' | 'subtle';
type GradientOptions = {
  preset?: GradientPreset;
  lightColors?: string[];
  darkColors?: string[];
  duration?: number;
  intensity?: 'low' | 'medium' | 'high';
  autoStart?: boolean;
};

export const useAnimatedGradient = (options: GradientOptions = {}) => {
  const { theme, isDark } = useTheme();
  const { 
    preset = 'neutral', 
    lightColors,
    darkColors,
    duration = 1000,
    intensity = 'medium',
    autoStart = true,
  } = options;

  const progress = useSharedValue(0);
  const angle = useSharedValue(0);
  
  const getPresetColors = (preset: GradientPreset, isDark: boolean): readonly [string, string, ...string[]] => {
    const intensityValue = intensity === 'low' ? 0.03 : intensity === 'medium' ? 0.07 : 0.12;
    
    switch(preset) {
      case 'primary':
        return isDark 
          ? [theme.primaryDark, theme.primary, theme.primaryLight] as const
          : [theme.primaryLight, theme.primary, theme.primaryDark] as const;
      case 'success':
        return isDark
          ? ['#004d40', '#00796b', '#4db6ac'] as const
          : ['#e8f5e9', '#a5d6a7', '#66bb6a'] as const;
      case 'warning':
        return isDark
          ? ['#bf360c', '#f4511e', '#ff8a65'] as const
          : ['#fff3e0', '#ffcc80', '#ffa726'] as const;
      case 'info':
        return isDark
          ? ['#0d47a1', '#1976d2', '#64b5f6'] as const
          : ['#e3f2fd', '#90caf9', '#42a5f5'] as const;
      case 'subtle':
        return isDark
          ? [theme.backgroundTertiary, theme.backgroundSecondary, theme.backgroundPrimary] as const
          : [theme.backgroundPrimary, theme.backgroundSecondary, theme.backgroundTertiary] as const;
      case 'neutral':
      default:
        return isDark
          ? ['#2D3748', '#4A5568', '#718096'] as const
          : ['#E2E8F0', '#EDF2F7', '#F7FAFC'] as const;
    }
  };
  
  const currentLightColors = lightColors ? lightColors : getPresetColors(preset, false);
  const currentDarkColors = darkColors ? darkColors : getPresetColors(preset, true);

  const colors = isDark ? currentDarkColors : currentLightColors;
  const startColors = useRef(colors); // Store initial colors
  const endColors = useRef(colors); // Store target colors

  useEffect(() => {
    // Update target colors when theme or preset changes
    const nextColors = isDark ? currentDarkColors : currentLightColors;
    startColors.current = endColors.current; // Start from the last end colors
    endColors.current = nextColors; 
    
    // Trigger animation if colors changed
    if (JSON.stringify(startColors.current) !== JSON.stringify(endColors.current)) {
        progress.value = 0; // Reset progress
        progress.value = withTiming(1, { duration });
    }
    
  }, [isDark, preset, currentLightColors, currentDarkColors, duration]); // dependencies

  const animatedProps = useAnimatedProps(() => { // Use useAnimatedProps
    const interpolatedColors = colors.map((_, index) => {
      return interpolateColor(
        progress.value, // Use the progress shared value
        [0, 1],
        [startColors.current[index], endColors.current[index]]
      );
    });

    // Return props for AnimatedLinearGradient
    return {
      colors: interpolatedColors as unknown as readonly [string, string, ...string[]], 
      start: { x: 0, y: 0 }, 
      end: { x: 1, y: 1 },
    };
  });

  const startAnimation = () => {
    // Animate progress from 0 to 1 and repeat
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, { duration, easing: ReanimatedEasing.linear }),
      -1, // Infinite repeat
      true // Reverse
    );
    
    // Animate angle for subtle rotation
    angle.value = 0;
    angle.value = withRepeat(
      withTiming(Math.PI * 2, { duration: duration * 2, easing: ReanimatedEasing.linear }),
      -1, // Infinite repeat
      false // Don't reverse
    );
  };
  
  const stopAnimation = () => {
    cancelAnimation(progress);
    cancelAnimation(angle);
  };
  
  // Start animation if autoStart is true
  useEffect(() => {
    if (autoStart) {
      startAnimation();
    }
    
    return () => stopAnimation();
  }, [isDark]); // Restart when theme changes
  
  return {
    animatedProps, // Return animatedProps 
    startAnimation,
    stopAnimation,
  };
};
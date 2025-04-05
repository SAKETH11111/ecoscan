import { useRef, useEffect } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  useSharedValue,
  withTiming,
  withDelay,
  Easing as ReanimatedEasing,
  runOnJS,
} from 'react-native-reanimated';

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
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: minValue,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
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
      easing: Easing.inOut(Easing.ease),
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
      easing: Easing.out(Easing.ease),
    }).start(callback);
  };

  const slideOut = (callback?: () => void) => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration,
      useNativeDriver: true,
      easing: Easing.in(Easing.ease),
    }).start(callback);
  };

  return {
    slideAnim,
    getTransform,
    slideIn,
    slideOut,
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
      easing: Easing.inOut(Easing.ease),
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
          easing: Easing.out(Easing.ease),
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
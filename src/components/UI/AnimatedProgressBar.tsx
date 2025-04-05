import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, TextStyle, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

interface AnimatedProgressBarProps {
  progress: number;
  height?: number;
  width?: number | string;
  backgroundColor?: string;
  progressColor?: string;
  borderRadius?: number;
  animated?: boolean;
  duration?: number;
  showPercentage?: boolean;
  label?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  valuePrefix?: string;
  valueSuffix?: string;
}

const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  progress,
  height = 12,
  width = '100%',
  backgroundColor,
  progressColor,
  borderRadius,
  animated = true,
  duration = 1000,
  showPercentage = false,
  label,
  style,
  textStyle,
  valuePrefix = '',
  valueSuffix = '%',
}) => {
  const { theme } = useTheme();
  const progressValue = useSharedValue(0);
  
  // Default values with fallbacks
  const bgColor = backgroundColor || '#E0E0E0'; // Default to light gray
  const pgColor = progressColor || '#4CAF50'; // Default to green
  const radius = borderRadius !== undefined ? borderRadius : height / 2;

  useEffect(() => {
    // Clamp progress between 0 and 100
    const normalizedProgress = Math.min(Math.max(progress, 0), 100) / 100;
    
    if (animated) {
      progressValue.value = withTiming(normalizedProgress, {
        duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else {
      progressValue.value = normalizedProgress;
    }
  }, [progress, animated, duration, progressValue]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value * 100}%`,
    };
  });

  return (
    <View style={[styles.container, { width }, style]}>
      {(label || showPercentage) && (
        <View style={styles.labelContainer}>
          {label && <Text style={[styles.label, textStyle]}>{label}</Text>}
          {showPercentage && (
            <Text style={[styles.percentage, textStyle]}>
              {valuePrefix}
              {Math.round(progress)}
              {valueSuffix}
            </Text>
          )}
        </View>
      )}
      <View style={[styles.progressBackground, { backgroundColor: bgColor, height, borderRadius: radius }]}>
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: pgColor, borderRadius: radius },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBackground: {
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
  },
});

export default AnimatedProgressBar;
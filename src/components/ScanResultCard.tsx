import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  Easing,
  FadeIn,
  FadeOut,
  interpolateColor,
  useAnimatedGestureHandler,
  runOnJS,
  SharedValue,
  withRepeat,
  cancelAnimation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useHapticFeedback, useReanimatedScale } from '../hooks/useAnimations';
import AnimatedProgressBar from './UI/AnimatedProgressBar';

const { width, height } = Dimensions.get('window');
// Using regular components instead of animated ones for compatibility

// Define the ScanResult interface based on the JSDoc types in geminiClient.js
interface ScanResult {
  itemName: string;
  recyclable: boolean;
  category: string;
  recyclingCode: string;
  instructions: string;
  impact: {
    co2Saved: string;
    waterSaved: string;
  };
  scannedImageUrl?: string;
  isMockData?: boolean;
  errorDetails?: string;
}

interface ScanResultCardProps {
  result: ScanResult | null;
  onClose: () => void;
}

const ScanResultCard: React.FC<ScanResultCardProps> = ({ result, onClose }) => {
  const { theme, isDark, themeTransition } = useTheme();
  const { triggerImpact, triggerNotification } = useHapticFeedback();
  
  // Scale animations for content
  const { scale: titleScale, scaleStyle: titleScaleStyle } = useReanimatedScale(300, 0);
  const { scale: cardScale, scaleStyle: cardScaleStyle } = useReanimatedScale(300, 0.8);
  
  // Animation values
  const opacity = useSharedValue(0);
  const cardY = useSharedValue(50);
  const shimmerPosition = useSharedValue(-width);
  const impactBarWidth = useSharedValue(0);
  const waterBarWidth = useSharedValue(0);
  
  // Animated card swipe away
  const swipeThreshold = width * 0.4;
  const cardX = useSharedValue(0);
  const cardRotate = useSharedValue(0);
  const dismissOpacity = useSharedValue(1);
  
  useEffect(() => {
    if (result && result !== localResult) {
      // Trigger success/error haptic feedback based on recyclability
      if (result.recyclable) {
        triggerNotification('success');
      } else {
        triggerNotification('warning');
      }
      
      // Reset animation values
      cardX.value = 0;
      cardRotate.value = 0;
      dismissOpacity.value = 1;
      
      // Animate card entrance
      cardScale.value = withSequence(
        withTiming(0.8, { duration: 0 }),
        withTiming(1.05, { 
          duration: 300,
          easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        }),
        withTiming(1, { 
          duration: 200,
          easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        })
      );
      
      // Fade in
      opacity.value = withTiming(1, { 
        duration: 300,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });
      
      // Slide up
      cardY.value = withTiming(0, { 
        duration: 400,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });
      
      // Title scale animation with delay
      setTimeout(() => {
        titleScale.value = withSpring(1, {
          damping: 14,
          stiffness: 100,
        });
      }, 200);
      
      // Start shimmer animation
      startShimmerAnimation();
      
      // Animate impact bars
      setTimeout(() => {
        impactBarWidth.value = withTiming(0.8, { 
          duration: 1000,
          easing: Easing.bezier(0.33, 1, 0.68, 1)
        });
        
        waterBarWidth.value = withTiming(0.65, { 
          duration: 800,
          easing: Easing.bezier(0.33, 1, 0.68, 1)
        });
      }, 500);
    } else {
      // Reset state when result becomes null
      cardScale.value = withTiming(0.8, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
      cardY.value = withTiming(50, { duration: 300 });
      
      // Stop animations
      cancelAnimation(shimmerPosition);
    }
    
    // Cleanup animations
    return () => {
      cancelAnimation(shimmerPosition);
      cancelAnimation(impactBarWidth);
      cancelAnimation(waterBarWidth);
    };
  }, [result]);
  
  // Shimmer effect animation
  const startShimmerAnimation = () => {
    shimmerPosition.value = -width;
    shimmerPosition.value = withRepeat(
      withTiming(width, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
      -1,
      false
    );
  };

  const handleClose = () => {
    // Trigger haptic feedback
    runOnJS(triggerImpact)('light');
    
    // Animate card exit
    cardScale.value = withTiming(0.9, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 });
    cardY.value = withTiming(50, { duration: 300 });
    
    // Call onClose after animation completes
    setTimeout(onClose, 200);
  };
  
  // Gesture handler for card swipe
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = cardX.value;
    },
    onActive: (event, ctx) => {
      cardX.value = ctx.startX + event.translationX;
      // Calculate rotation based on swipe distance
      cardRotate.value = (cardX.value / width) * 0.1;
    },
    onEnd: (event) => {
      // If swiped far enough, dismiss card
      if (Math.abs(cardX.value) > swipeThreshold) {
        const direction = cardX.value > 0 ? 1 : -1;
        cardX.value = withTiming(direction * width, { duration: 400 });
        dismissOpacity.value = withTiming(0, { duration: 300 });
        runOnJS(onClose)();
      } else {
        // Otherwise, snap back to center
        cardX.value = withSpring(0, {
          damping: 20,
          stiffness: 150,
        });
        cardRotate.value = withSpring(0);
      }
    },
  });
  
  // Card swipe animation
  const cardSwipeStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: cardX.value },
        { rotate: `${cardRotate.value}rad` },
        { translateY: cardY.value },
      ],
      opacity: dismissOpacity.value * opacity.value,
    };
  });
  
  // Shimmer animation
  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shimmerPosition.value }],
    };
  });
  
  // Impact bar animations
  const co2BarStyle = useAnimatedStyle(() => {
    return {
      width: `${impactBarWidth.value * 100}%`,
    };
  });
  
  const waterBarStyle = useAnimatedStyle(() => {
    return {
      width: `${waterBarWidth.value * 100}%`,
    };
  });

  // Store result in state to maintain it during component lifecycle
  const [localResult, setLocalResult] = useState<ScanResult | null>(null);
  
  // Update local state when prop changes
  useEffect(() => {
    if (result) {
      setLocalResult(result);
    }
  }, [result]);
  
  // Skip rendering if no result
  if (!localResult) return null;

  // Get status color based on recyclability
  const statusColor = localResult.recyclable
    ? theme.success
    : theme.warning;
    
  // Define color arrays with 'as const' first
  const recyclableColorsDark = ['#004d40', '#00796b', '#4db6ac'] as const;
  const recyclableColorsLight = ['#e8f5e9', '#a5d6a7', '#66bb6a'] as const;
  const nonRecyclableColorsDark = ['#bf360c', '#f4511e', '#ff8a65'] as const;
  const nonRecyclableColorsLight = ['#fff3e0', '#ffcc80', '#ffa726'] as const;

  // Choose the correct static gradient colors based on status and theme
  const staticGradientColors = localResult.recyclable
    ? (isDark ? recyclableColorsDark : recyclableColorsLight)
    : (isDark ? nonRecyclableColorsDark : nonRecyclableColorsLight);

  // Get icon based on material category
  const getCategoryIcon = () => {
    switch (localResult.category.toLowerCase()) {
      case 'plastic':
        return <MaterialCommunityIcons name="bottle-soda-classic-outline" size={18} color={isDark ? '#e0e0e0' : '#333'} />;
      case 'glass':
        return <MaterialCommunityIcons name="glass-cocktail" size={18} color={isDark ? '#e0e0e0' : '#333'} />;
      case 'metal':
        return <MaterialCommunityIcons name="cog-outline" size={18} color={isDark ? '#e0e0e0' : '#333'} />;
      case 'paper':
        return <MaterialCommunityIcons name="newspaper-variant-outline" size={18} color={isDark ? '#e0e0e0' : '#333'} />;
      default:
        return <MaterialCommunityIcons name="recycle" size={18} color={isDark ? '#e0e0e0' : '#333'} />;
    }
  };

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View
        style={[
          styles.outerContainer, 
          { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF' }, // Solid color for shadow
          cardSwipeStyle, 
          cardScaleStyle
        ]}
        entering={FadeIn.duration(300).springify()}
        exiting={FadeOut.duration(200)}
      >
        {/* Use static LinearGradient */}
        <LinearGradient
          style={styles.gradientBackground}
          colors={staticGradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Use static BlurView */}
          <BlurView 
            intensity={isDark ? 35 : 10}
            tint={isDark ? "dark" : "light"}
            style={styles.blurContainer}
          >
            {/* Glass Card UI */}
            <View style={[styles.cardContentWrapper, { 
              borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', 
              backgroundColor: theme.backgroundSecondary,
            }]}>
            
              {/* Header with close button */}
              <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' }]}>
                <Animated.View style={[styles.headerContent, titleScaleStyle]}>
                  <View style={styles.itemNameContainer}>
                    <Text style={[styles.itemName, { color: isDark ? '#ffffff' : '#000000' }]}>
                      {localResult.itemName}
                    </Text>
                    {localResult.isMockData && (
                      <View style={[styles.mockBadge, { 
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                      }]}>
                        <Text style={[styles.mockText, { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}>
                          Example
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.categoryBadge, { 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' 
                  }]}>
                    {getCategoryIcon()}
                    <Text style={[styles.categoryText, { color: isDark ? '#e0e0e0' : '#333' }]}>
                      {localResult.category}
                    </Text>
                  </View>
                </Animated.View>
                <TouchableOpacity 
                  onPress={handleClose} 
                  style={styles.closeButton}
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <Ionicons 
                    name="close-circle" 
                    size={28} 
                    color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.3)'} 
                  />
                </TouchableOpacity>
              </View>
              
              {/* Image and Status Section */}
              <View style={styles.imageStatusContainer}>
                {/* Image with overlay */}
                <View style={styles.imageContainer}>
                  {localResult.scannedImageUrl ? (
                    <Image 
                      source={{ uri: localResult.scannedImageUrl }}
                      style={styles.scannedImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.placeholderImage, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} />
                  )}
                  
                  {/* Timestamp overlay */}
                  <View style={styles.timestampContainer}>
                    <Text style={styles.timestamp}>
                      {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                  </View>
                </View>
                
                {/* Status banner */}
                <View style={[
                  styles.statusContainer, 
                  { 
                    backgroundColor: localResult.recyclable 
                      ? isDark ? 'rgba(0, 170, 70, 0.8)' : 'rgba(0, 180, 80, 0.85)'
                      : isDark ? 'rgba(210, 70, 0, 0.8)' : 'rgba(220, 80, 0, 0.85)'
                  }
                ]}>
                  <View style={styles.statusContent}>
                    <View style={styles.statusIconContainer}>
                      <Ionicons 
                        name={localResult.recyclable ? 'checkmark-circle' : 'alert-circle'} 
                        size={22} 
                        color="white" 
                      />
                    </View>
                    <Text style={styles.statusText}>
                      {localResult.recyclable ? 'Recyclable' : 'Not Recyclable'}
                    </Text>
                    
                    {/* Recycling code */}
                    {localResult.recyclingCode && (
                      <View style={styles.recyclingCodeContainer}>
                        <Text style={styles.recyclingCode}>{localResult.recyclingCode}</Text>
                      </View>
                    )}
                  </View>
                  
                  {/* Shimmer effect */}
                  <Animated.View style={[styles.shimmerEffect, shimmerStyle]} />
                </View>
              </View>
              
              {/* Scrollable Content */}
              <ScrollView 
                style={styles.scrollView} 
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={true}
                removeClippedSubviews={false}
                scrollEventThrottle={16}
                nestedScrollEnabled={true}
                persistentScrollbar={true}
                alwaysBounceVertical={false}
                bounces={true}
              >
                {/* Instructions Section */}
                <View style={styles.sectionContainer}>
                  <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                    Instructions
                  </Text>
                  <View style={[styles.instructionsCard, { 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.02)',
                    borderColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)'
                  }]}>
                    <Text style={[styles.instructionsText, { color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)' }]}>
                      {localResult.instructions}
                    </Text>
                  </View>
                </View>
                
                {/* Environmental Impact Section */}
                {localResult.recyclable && (
                  <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                      Environmental Impact
                    </Text>
                    
                    {/* CO2 Impact */}
                    <View style={[styles.impactCard, { 
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.02)',
                      borderColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)'
                    }]}>
                      <View style={styles.impactHeader}>
                        <View style={[styles.impactIconContainer, {
                          backgroundColor: isDark ? 'rgba(77, 193, 161, 0.15)' : 'rgba(58, 155, 122, 0.1)'
                        }]}>
                          <Ionicons name="cloud-outline" size={20} color={isDark ? '#4DC1A1' : '#3A9B7A'} />
                        </View>
                        <Text style={[styles.impactLabel, { color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)' }]}>
                          CO₂ Saved
                        </Text>
                        <Text style={[styles.impactValue, { color: isDark ? '#4DC1A1' : '#3A9B7A' }]}>
                          {localResult.impact.co2Saved}
                        </Text>
                      </View>
                      
                      <View style={styles.progressContainer}>
                        <View style={[styles.progressBackground, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}>
                          <Animated.View 
                            style={[
                              styles.progressFill, 
                              { backgroundColor: isDark ? '#4DC1A1' : '#3A9B7A' },
                              co2BarStyle
                            ]} 
                          />
                        </View>
                      </View>
                    </View>
                    
                    {/* Water Impact */}
                    <View style={[styles.impactCard, { 
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.02)',
                      borderColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)'
                    }]}>
                      <View style={styles.impactHeader}>
                        <View style={[styles.impactIconContainer, {
                          backgroundColor: isDark ? 'rgba(100, 181, 246, 0.15)' : 'rgba(30, 136, 229, 0.1)'
                        }]}>
                          <Ionicons name="water-outline" size={20} color={isDark ? '#64B5F6' : '#3182CE'} />
                        </View>
                        <Text style={[styles.impactLabel, { color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)' }]}>
                          Water Saved
                        </Text>
                        <Text style={[styles.impactValue, { color: isDark ? '#64B5F6' : '#3182CE' }]}>
                          {localResult.impact.waterSaved}
                        </Text>
                      </View>
                      
                      <View style={styles.progressContainer}>
                        <View style={[styles.progressBackground, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}>
                          <Animated.View 
                            style={[
                              styles.progressFill, 
                              { backgroundColor: isDark ? '#64B5F6' : '#3182CE' },
                              waterBarStyle
                            ]} 
                          />
                        </View>
                      </View>
                    </View>
                    
                    {/* Impact Comparison */}
                    <View style={[styles.comparisonCard, { 
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.02)',
                      borderColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)'
                    }]}>
                      <Text style={[styles.comparisonTitle, { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}>
                        Equivalent To:
                      </Text>
                      <Text style={[styles.comparisonText, { color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)' }]}>
                        {localResult.category.toLowerCase() === 'plastic' ? 'Not using 3 plastic bottles' : 
                        localResult.category.toLowerCase() === 'metal' ? 'Driving 2 miles less in a car' : 
                        localResult.category.toLowerCase() === 'glass' ? 'Saving 5 minutes of shower water' : 
                        'Conserving natural resources'}
                      </Text>
                    </View>
                  </View>
                )}
                
                {/* If not recyclable, show alternative instructions */}
                {!localResult.recyclable && (
                  <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                      Alternative Options
                    </Text>
                    <View style={[styles.instructionsCard, { 
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.02)',
                      borderColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)'
                    }]}>
                      <Text style={[styles.instructionsText, { color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)' }]}>
                        Instead of throwing this in the regular trash, consider:
                      </Text>
                      <View style={styles.alternativesList}>
                        <View style={styles.alternativeItem}>
                          <Ionicons name="arrow-forward-circle-outline" size={16} color={isDark ? theme.accent : theme.warning} style={styles.bulletIcon} />
                          <Text style={[styles.alternativeText, { color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)' }]}>
                            Check local special waste disposal options
                          </Text>
                        </View>
                        <View style={styles.alternativeItem}>
                          <Ionicons name="arrow-forward-circle-outline" size={16} color={isDark ? theme.accent : theme.warning} style={styles.bulletIcon} />
                          <Text style={[styles.alternativeText, { color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)' }]}>
                            Look for brands with recyclable alternatives
                          </Text>
                        </View>
                        <View style={styles.alternativeItem}>
                          <Ionicons name="arrow-forward-circle-outline" size={16} color={isDark ? theme.accent : theme.warning} style={styles.bulletIcon} />
                          <Text style={[styles.alternativeText, { color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)' }]}>
                            Consider reusing the item if possible
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
                
                {/* Tips section */}
                <View style={styles.sectionContainer}>
                  <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                    Recycling Tips
                  </Text>
                  <View style={[styles.tipsCard, { 
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.02)',
                    borderColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)'
                  }]}>
                    <View style={styles.tipRow}>
                      <MaterialCommunityIcons 
                        name="lightbulb-outline" 
                        size={18} 
                        color={isDark ? theme.accent : theme.accent} 
                        style={styles.tipIcon}
                      />
                      <Text style={[styles.tipText, { color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)' }]}>
                        Always rinse containers before recycling
                      </Text>
                    </View>
                    <View style={styles.tipRow}>
                      <MaterialCommunityIcons 
                        name="lightbulb-outline" 
                        size={18} 
                        color={isDark ? theme.accent : theme.accent} 
                        style={styles.tipIcon}
                      />
                      <Text style={[styles.tipText, { color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)' }]}>
                        Check the recycling number on plastic items
                      </Text>
                    </View>
                    <View style={styles.tipRow}>
                      <MaterialCommunityIcons 
                        name="lightbulb-outline" 
                        size={18} 
                        color={isDark ? theme.accent : theme.accent} 
                        style={styles.tipIcon}
                      />
                      <Text style={[styles.tipText, { color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)' }]}>
                        Remove caps and labels when required by local guidelines
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </BlurView>
        </LinearGradient>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    width: '100%',
    height: '85%', // Use fixed height instead of maxHeight
    bottom: 20, // Position from bottom for better visibility
    borderRadius: 24,
    overflow: 'hidden',
    zIndex: 999,
    // Add shadow here so it's not on the LinearGradient
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    backgroundColor: '#FFF', // Solid background for shadow calculation
  },
  gradientBackground: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  blurContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    padding: 1,
  },
  cardContentWrapper: {
    flex: 1,
    borderRadius: 23,
    borderWidth: 0.5,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemNameContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 22,
    fontWeight: '700',
  },
  mockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  mockText: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 10,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  closeButton: {
    marginLeft: 16,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageStatusContainer: {
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    height: 200, // Reduced height to leave more room for content
    position: 'relative',
  },
  scannedImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
  },
  timestampContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timestamp: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  statusContainer: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIconContainer: {
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  recyclingCodeContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  recyclingCode: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    transform: [{ skewX: '-20deg' }],
  },
  scrollView: {
    flex: 1,
    minHeight: 200, // Ensure minimum height
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 50, // More padding at bottom for better scrolling
    flexGrow: 1, // Allow content to grow
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  instructionsCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  instructionsText: {
    fontSize: 15,
    lineHeight: 22,
  },
  impactCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 0.5,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  impactIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  impactLabel: {
    fontSize: 14,
    flex: 1,
  },
  impactValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressContainer: {
    height: 8,
  },
  progressBackground: {
    height: '100%',
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: 0,
    borderRadius: 4,
  },
  comparisonCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  comparisonTitle: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '500',
  },
  comparisonText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  alternativesList: {
    marginTop: 12,
  },
  alternativeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  alternativeText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  tipsCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tipIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});

export default ScanResultCard;
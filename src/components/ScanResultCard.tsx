import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Platform } from 'react-native';
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
  useAnimatedGestureHandler,
  runOnJS,
  withRepeat,
  cancelAnimation,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useHapticFeedback, useReanimatedScale } from '../hooks/useAnimations';
import { useAppContext } from '../context/AppContext';
// @ts-ignore
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Define the ScanResult interface
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
  const { theme, isDark } = useTheme();
  const { triggerImpact, triggerNotification } = useHapticFeedback();
  const { findRecyclingLocations } = useAppContext();
  const navigation = useNavigation();
  
  // Scale animations
  const { scale: cardScale, scaleStyle: cardScaleStyle } = useReanimatedScale(300, 0.8);
  
  // Animation values
  const opacity = useSharedValue(0);
  const cardY = useSharedValue(50);
  const shimmerPosition = useSharedValue(-width);
  const co2Progress = useSharedValue(0);
  const waterProgress = useSharedValue(0);
  
  // Swipe dismissal
  const swipeThreshold = width * 0.4;
  const cardX = useSharedValue(0);
  const cardRotate = useSharedValue(0);
  
  useEffect(() => {
    if (result && result !== localResult) {
      // Trigger feedback based on recyclability
      if (result.recyclable) {
        triggerNotification('success');
      } else {
        triggerNotification('warning');
      }
      
      // Reset animation values
      cardX.value = 0;
      cardRotate.value = 0;
      
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
      
      // Start shimmer animation
      startShimmerAnimation();
      
      // Animate progress bars
      setTimeout(() => {
        co2Progress.value = withTiming(0.8, { 
          duration: 1000,
          easing: Easing.bezier(0.33, 1, 0.68, 1)
        });
        
        waterProgress.value = withTiming(0.65, { 
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
      cancelAnimation(co2Progress);
      cancelAnimation(waterProgress);
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
  
  // Swipe handler for dismissal
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = cardX.value;
    },
    onActive: (event, ctx) => {
      cardX.value = ctx.startX + event.translationX;
      cardRotate.value = (cardX.value / width) * 0.1;
    },
    onEnd: () => {
      if (Math.abs(cardX.value) > swipeThreshold) {
        const direction = cardX.value > 0 ? 1 : -1;
        cardX.value = withTiming(direction * width, { duration: 400 });
        opacity.value = withTiming(0, { duration: 300 });
        runOnJS(onClose)();
      } else {
        cardX.value = withSpring(0, {
          damping: 20,
          stiffness: 150,
        });
        cardRotate.value = withSpring(0);
      }
    },
  });
  
  // Animations
  const cardSwipeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: cardX.value },
      { rotate: `${cardRotate.value}rad` },
      { translateY: cardY.value },
    ],
    opacity: opacity.value,
  }));
  
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerPosition.value }],
  }));
  
  const co2BarStyle = useAnimatedStyle(() => ({
    width: `${co2Progress.value * 100}%`,
  }));
  
  const waterBarStyle = useAnimatedStyle(() => ({
    width: `${waterProgress.value * 100}%`,
  }));

  // Local state
  const [localResult, setLocalResult] = useState<ScanResult | null>(null);
  
  useEffect(() => {
    if (result) {
      setLocalResult(result);
    }
  }, [result]);
  
  if (!localResult) return null;

  // Get category icon
  const getCategoryIcon = () => {
    const color = isDark ? '#fff' : '#333';
    const size = 18;
    
    switch (localResult.category.toLowerCase()) {
      case 'plastic':
        return <MaterialCommunityIcons name="bottle-soda-classic-outline" size={size} color={color} />;
      case 'glass':
        return <MaterialCommunityIcons name="glass-cocktail" size={size} color={color} />;
      case 'metal':
        return <MaterialCommunityIcons name="cog-outline" size={size} color={color} />;
      case 'paper':
        return <MaterialCommunityIcons name="newspaper-variant-outline" size={size} color={color} />;
      default:
        return <MaterialCommunityIcons name="recycle" size={size} color={color} />;
    }
  };

  // Status color
  const statusColor = localResult.recyclable ? 
    (isDark ? '#4DC1A1' : '#3A9B7A') : 
    (isDark ? '#FF7043' : '#F4511E');
  
  const statusBgColor = localResult.recyclable ? 
    (isDark ? 'rgba(0, 170, 70, 0.9)' : 'rgba(0, 180, 80, 0.9)') : 
    (isDark ? 'rgba(210, 70, 0, 0.9)' : 'rgba(220, 80, 0, 0.9)');

  // Handle finding recycling locations
  const handleFindRecyclingLocations = async () => {
    // Trigger haptic feedback
    triggerImpact('medium');
    
    // Find recycling locations based on the scan result
    if (result) {
      await findRecyclingLocations(result);
      
      // Navigate to Resources screen
      // @ts-ignore - navigation typing
      navigation.navigate('Resources');
    }
  };

  const renderRecyclingButton = () => {
    if (!localResult.recyclable) return null;
    
    return (
      <TouchableOpacity
        style={[styles.recyclingButton, { 
          backgroundColor: isDark ? '#4DC1A1' : '#3A9B7A'
        }]}
        onPress={handleFindRecyclingLocations}
        activeOpacity={0.8}
      >
        <Ionicons name="location-outline" size={22} color="#FFFFFF" />
        <Text style={styles.recyclingButtonText}>Find Drop-off Locations</Text>
      </TouchableOpacity>
    );
  };

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View
        style={[
          styles.container, 
          { backgroundColor: isDark ? theme.backgroundSecondary : '#FFFFFF' },
          cardSwipeStyle, 
          cardScaleStyle
        ]}
        entering={FadeIn.duration(300).springify()}
        exiting={FadeOut.duration(200)}
      >
        {/* Header */}
        <View style={[styles.header, { 
          borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
        }]}>
          <View style={styles.headerTitleRow}>
            <Text numberOfLines={1} style={[
              styles.titleText, 
              { color: isDark ? '#ffffff' : '#000000' }
            ]}>
              {localResult.itemName}
            </Text>
            <TouchableOpacity 
              onPress={handleClose} 
              style={styles.closeButton}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons 
                name="close" 
                size={24} 
                color={isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)'} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerInfoRow}>
            <View style={[styles.categoryBadge, { 
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' 
            }]}>
              {getCategoryIcon()}
              <Text style={[styles.categoryText, { 
                color: isDark ? '#e0e0e0' : '#333' 
              }]}>
                {localResult.category}
              </Text>
            </View>
            
            {localResult.isMockData && (
              <View style={[styles.mockBadge, { 
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
              }]}>
                <Text style={[styles.mockText, { 
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' 
                }]}>
                  Example
                </Text>
              </View>
            )}
            
            <Text style={[styles.timestampText, { 
              color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' 
            }]}>
              {new Date().toLocaleDateString()}
            </Text>
          </View>
        </View>
        
        {/* Scrollable Content */}
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Status Banner */}
          <View style={[styles.statusBanner, { backgroundColor: statusBgColor }]}>
            <View style={styles.statusContent}>
              <Ionicons 
                name={localResult.recyclable ? 'checkmark-circle' : 'alert-circle'} 
                size={28} 
                color="white" 
                style={styles.statusIcon}
              />
              <Text style={styles.statusText}>
                {localResult.recyclable ? 'Recyclable' : 'Not Recyclable'}
              </Text>
              
              {localResult.recyclingCode && (
                <View style={styles.recyclingCodeBadge}>
                  <Text style={styles.recyclingCodeText}>{localResult.recyclingCode}</Text>
                </View>
              )}
            </View>
            
            {/* Shimmer effect */}
            <Animated.View style={[styles.shimmer, shimmerStyle]} />
          </View>

          {/* Image Card */}
          {localResult.scannedImageUrl && (
            <View style={[styles.imageCard, { 
              backgroundColor: isDark ? theme.backgroundCard : '#FFFFFF',
            }]}>
              <Image 
                source={{ uri: localResult.scannedImageUrl }}
                style={styles.scannedImage}
                resizeMode="cover"
              />
            </View>
          )}
          
          {/* Instructions Section */}
          <View style={[styles.card, { 
            backgroundColor: isDark ? theme.backgroundCard : '#FFFFFF',
          }]}>
            <Text style={[styles.cardTitle, { 
              color: isDark ? '#ffffff' : '#000000' 
            }]}>
              Instructions
            </Text>
            <Text style={[styles.cardText, { 
              color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)' 
            }]}>
              {localResult.instructions}
            </Text>
          </View>
          
          {/* Environmental Impact Section */}
          {localResult.recyclable && (
            <View style={[styles.card, { 
              backgroundColor: isDark ? theme.backgroundCard : '#FFFFFF',
            }]}>
              <Text style={[styles.cardTitle, { 
                color: isDark ? '#ffffff' : '#000000' 
              }]}>
                Environmental Impact
              </Text>
              
              {/* CO2 Impact */}
              <View style={styles.impactRow}>
                <View style={[styles.impactIconContainer, {
                  backgroundColor: isDark ? 'rgba(77, 193, 161, 0.15)' : 'rgba(58, 155, 122, 0.1)'
                }]}>
                  <Ionicons name="cloud-outline" size={22} color={isDark ? '#4DC1A1' : '#3A9B7A'} />
                </View>
                <View style={styles.impactDetails}>
                  <View style={styles.impactLabelRow}>
                    <Text style={[styles.impactLabel, { 
                      color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)' 
                    }]}>
                      CO₂ Saved
                    </Text>
                    <Text style={[styles.impactValue, { 
                      color: isDark ? '#4DC1A1' : '#3A9B7A' 
                    }]}>
                      {localResult.impact.co2Saved}
                    </Text>
                  </View>
                  
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBg, { 
                      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' 
                    }]}>
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
              </View>
              
              {/* Water Impact */}
              <View style={styles.impactRow}>
                <View style={[styles.impactIconContainer, {
                  backgroundColor: isDark ? 'rgba(100, 181, 246, 0.15)' : 'rgba(30, 136, 229, 0.1)'
                }]}>
                  <Ionicons name="water-outline" size={22} color={isDark ? '#64B5F6' : '#3182CE'} />
                </View>
                <View style={styles.impactDetails}>
                  <View style={styles.impactLabelRow}>
                    <Text style={[styles.impactLabel, { 
                      color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)' 
                    }]}>
                      Water Saved
                    </Text>
                    <Text style={[styles.impactValue, { 
                      color: isDark ? '#64B5F6' : '#3182CE' 
                    }]}>
                      {localResult.impact.waterSaved}
                    </Text>
                  </View>
                  
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBg, { 
                      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' 
                    }]}>
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
              </View>
              
              {/* Equivalent Impact */}
              <View style={[styles.equivalentBox, {
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              }]}>
                <Text style={[styles.equivalentLabel, { 
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' 
                }]}>
                  Equivalent to:
                </Text>
                <Text style={[styles.equivalentText, { 
                  color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)' 
                }]}>
                  {localResult.category.toLowerCase() === 'plastic' ? 'Not using 3 plastic bottles' : 
                  localResult.category.toLowerCase() === 'metal' ? 'Driving 2 miles less in a car' : 
                  localResult.category.toLowerCase() === 'glass' ? 'Saving 5 minutes of shower water' : 
                  'Conserving natural resources'}
                </Text>
              </View>
            </View>
          )}
          
          {/* Alternative Options - if not recyclable */}
          {!localResult.recyclable && (
            <View style={[styles.card, { 
              backgroundColor: isDark ? theme.backgroundCard : '#FFFFFF',
            }]}>
              <Text style={[styles.cardTitle, { 
                color: isDark ? '#ffffff' : '#000000' 
              }]}>
                Alternative Options
              </Text>
              <Text style={[styles.cardText, { 
                color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)' 
              }]}>
                Instead of throwing this in the regular trash, consider:
              </Text>
              <View style={styles.alternativesList}>
                <View style={styles.alternativeItem}>
                  <Ionicons 
                    name="arrow-forward-circle-outline" 
                    size={18} 
                    color={isDark ? theme.accent : theme.warning} 
                    style={styles.bulletIcon} 
                  />
                  <Text style={[styles.alternativeText, { 
                    color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)' 
                  }]}>
                    Check local special waste disposal options
                  </Text>
                </View>
                <View style={styles.alternativeItem}>
                  <Ionicons 
                    name="arrow-forward-circle-outline" 
                    size={18} 
                    color={isDark ? theme.accent : theme.warning} 
                    style={styles.bulletIcon} 
                  />
                  <Text style={[styles.alternativeText, { 
                    color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)' 
                  }]}>
                    Look for brands with recyclable alternatives
                  </Text>
                </View>
                <View style={styles.alternativeItem}>
                  <Ionicons 
                    name="arrow-forward-circle-outline" 
                    size={18} 
                    color={isDark ? theme.accent : theme.warning} 
                    style={styles.bulletIcon} 
                  />
                  <Text style={[styles.alternativeText, { 
                    color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)' 
                  }]}>
                    Consider reusing the item if possible
                  </Text>
                </View>
              </View>
            </View>
          )}
          
          {/* Tips Card */}
          <View style={[styles.card, { 
            backgroundColor: isDark ? theme.backgroundCard : '#FFFFFF',
            marginBottom: 30
          }]}>
            <Text style={[styles.cardTitle, { 
              color: isDark ? '#ffffff' : '#000000' 
            }]}>
              Recycling Tips
            </Text>
            <View style={styles.tipsContainer}>
              <View style={styles.tipItem}>
                <MaterialCommunityIcons 
                  name="lightbulb-outline" 
                  size={18} 
                  color={isDark ? theme.accent : theme.accent} 
                  style={styles.tipIcon}
                />
                <Text style={[styles.tipText, { 
                  color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)' 
                }]}>
                  Always rinse containers before recycling
                </Text>
              </View>
              <View style={styles.tipItem}>
                <MaterialCommunityIcons 
                  name="lightbulb-outline" 
                  size={18} 
                  color={isDark ? theme.accent : theme.accent} 
                  style={styles.tipIcon}
                />
                <Text style={[styles.tipText, { 
                  color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)' 
                }]}>
                  Check the recycling number on plastic items
                </Text>
              </View>
              <View style={styles.tipItem}>
                <MaterialCommunityIcons 
                  name="lightbulb-outline" 
                  size={18} 
                  color={isDark ? theme.accent : theme.accent} 
                  style={styles.tipIcon}
                />
                <Text style={[styles.tipText, { 
                  color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)' 
                }]}>
                  Remove caps and labels when required by local guidelines
                </Text>
              </View>
            </View>
          </View>

          {/* Recycling Locations Button */}
          {renderRecyclingButton()}
          
          {/* Extra space at bottom */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  headerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  mockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 10,
  },
  mockText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timestampText: {
    fontSize: 12,
    fontWeight: '500',
  },
  scrollView: {
    maxHeight: 600,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  statusBanner: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    marginRight: 14,
  },
  statusText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  recyclingCodeBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  recyclingCodeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: 'rgba(255,255,255,0.15)',
    transform: [{ skewX: '-20deg' }],
  },
  imageCard: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  scannedImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  impactIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  impactDetails: {
    flex: 1,
  },
  impactLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  impactLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  impactValue: {
    fontSize: 17,
    fontWeight: '700',
  },
  progressContainer: {
    height: 10,
  },
  progressBg: {
    height: '100%',
    width: '100%',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: 0,
    borderRadius: 5,
  },
  equivalentBox: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
  },
  equivalentLabel: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  equivalentText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  alternativesList: {
    marginTop: 16,
  },
  alternativeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  bulletIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  alternativeText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  tipsContainer: {
    marginTop: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  recyclingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  recyclingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default ScanResultCard;
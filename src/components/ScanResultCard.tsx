import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useHapticFeedback } from '../hooks/useAnimations';
import AnimatedProgressBar from './UI/AnimatedProgressBar';

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
}

interface ScanResultCardProps {
  result: ScanResult | null;
  onClose: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ScanResultCard: React.FC<ScanResultCardProps> = ({ result, onClose }) => {
  const { theme } = useTheme();
  const { triggerImpact, triggerNotification } = useHapticFeedback();
  
  // Animation values
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const cardY = useSharedValue(50);
  const detailsHeight = useSharedValue(0);
  const isExpanded = useSharedValue(false);
  
  useEffect(() => {
    if (result) {
      // Trigger success/error haptic feedback based on recyclability
      if (result.recyclable) {
        triggerNotification('success');
      } else {
        triggerNotification('warning');
      }
      
      // Animate card entrance
      scale.value = withSequence(
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
      
      opacity.value = withTiming(1, { duration: 300 });
      cardY.value = withTiming(0, { duration: 400 });
      
      // Auto expand after a short delay
      setTimeout(() => {
        toggleExpand();
      }, 500);
    }
  }, [result]);

  const toggleExpand = () => {
    triggerImpact('light');
    
    if (isExpanded.value) {
      detailsHeight.value = withTiming(0, { duration: 300 });
      isExpanded.value = false;
    } else {
      detailsHeight.value = withTiming(300, { duration: 300 });
      isExpanded.value = true;
    }
  };

  const handleClose = () => {
    // Animate card exit
    scale.value = withTiming(0.9, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 });
    cardY.value = withTiming(50, { duration: 300 });
    
    // Call onClose after animation completes
    setTimeout(onClose, 200);
  };

  // Skip rendering if no result
  if (!result) return null;

  // Get status color based on recyclability
  const statusColor = result.recyclable
    ? theme.colors.success
    : theme.colors.warning;

  // Card animation styles
  const cardAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: cardY.value },
      ],
      opacity: opacity.value,
    };
  });
  
  // Details container animation style
  const detailsAnimStyle = useAnimatedStyle(() => {
    return {
      height: detailsHeight.value,
      opacity: detailsHeight.value === 0 ? 0 : 1,
    };
  });
  
  // Chevron rotation animation
  const chevronAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: isExpanded.value ? '180deg' : '0deg' }
      ],
    };
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.backgroundCard,
          borderRadius: theme.radius.lg,
          ...theme.shadows.medium,
        },
        cardAnimStyle
      ]}
      entering={FadeIn.duration(300).springify()}
      exiting={FadeOut.duration(200)}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.itemName, { color: theme.colors.text.primary }]}>
          {result.itemName}
        </Text>
        <TouchableOpacity 
          onPress={handleClose} 
          style={styles.closeButton}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons name="close" size={24} color={theme.colors.text.tertiary} />
        </TouchableOpacity>
      </View>
      
      {/* Status Banner */}
      <View style={[styles.statusContainer, { backgroundColor: statusColor }]}>
        <Animated.View style={styles.statusContent}>
          <Ionicons 
            name={result.recyclable ? 'checkmark-circle' : 'alert-circle'} 
            size={22} 
            color="white" 
          />
          <Text style={styles.statusText}>
            {result.recyclable ? 'Recyclable' : 'Not Recyclable'}
          </Text>
        </Animated.View>
      </View>
      
      {/* Basic Details */}
      <View style={styles.basicDetails}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
            Category:
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
            {result.category}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
            Recycling Code:
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
            {result.recyclingCode}
          </Text>
        </View>
      </View>
      
      {/* Expand/Collapse Toggle */}
      <AnimatedTouchable 
        onPress={toggleExpand}
        style={[
          styles.expandButton,
          { borderTopColor: theme.colors.border, borderBottomColor: theme.colors.border }
        ]}
      >
        <Text style={[styles.expandText, { color: theme.colors.primary }]}>
          {isExpanded.value ? 'Hide Details' : 'Show Details'}
        </Text>
        <Animated.View style={chevronAnimStyle}>
          <Ionicons name="chevron-down" size={20} color={theme.colors.primary} />
        </Animated.View>
      </AnimatedTouchable>
      
      {/* Expanded Details */}
      <Animated.View style={[styles.expandedDetails, detailsAnimStyle]}>
        <ScrollView contentContainerStyle={styles.expandedContent}>
          <View style={styles.instructionsContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Instructions
            </Text>
            <Text style={[styles.instructionsText, { color: theme.colors.text.secondary }]}>
              {result.instructions}
            </Text>
          </View>
          
          {result.recyclable && (
            <View style={styles.impactContainer}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Environmental Impact
              </Text>
              
              <View style={styles.impactDetail}>
                <View style={styles.impactIconContainer}>
                  <Ionicons name="cloud-outline" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.impactInfo}>
                  <Text style={[styles.impactLabel, { color: theme.colors.text.secondary }]}>
                    CO₂ Saved
                  </Text>
                  <Text style={[styles.impactValue, { color: theme.colors.primary }]}>
                    {result.impact.co2Saved}
                  </Text>
                </View>
              </View>
              
              <View style={styles.impactDetail}>
                <View style={styles.impactIconContainer}>
                  <Ionicons name="water-outline" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.impactInfo}>
                  <Text style={[styles.impactLabel, { color: theme.colors.text.secondary }]}>
                    Water Saved
                  </Text>
                  <Text style={[styles.impactValue, { color: theme.colors.primary }]}>
                    {result.impact.waterSaved}
                  </Text>
                </View>
              </View>
              
              <View style={styles.impactComparison}>
                <Text style={[styles.comparisonText, { color: theme.colors.text.secondary }]}>
                  Equivalent to:
                </Text>
                <Text style={[styles.comparisonDetail, { color: theme.colors.text.primary }]}>
                  {result.category === 'Plastic' ? 'Not using 3 plastic bottles' : 
                   result.category === 'Metal' ? 'Driving 2 miles less in a car' : 
                   result.category === 'Glass' ? 'Saving 5 minutes of shower water' : 
                   'Conserving natural resources'}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContainer: {
    paddingVertical: 10,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  basicDetails: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailLabel: {
    width: 120,
    fontSize: 14,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  expandText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  expandedDetails: {
    overflow: 'hidden',
  },
  expandedContent: {
    padding: 16,
  },
  instructionsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  impactContainer: {
    marginTop: 10,
  },
  impactDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  impactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  impactInfo: {
    flex: 1,
  },
  impactLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  impactValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  impactComparison: {
    marginTop: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    padding: 12,
    borderRadius: 8,
  },
  comparisonText: {
    fontSize: 12,
    marginBottom: 4,
  },
  comparisonDetail: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ScanResultCard;
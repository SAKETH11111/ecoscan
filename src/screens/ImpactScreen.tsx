import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  SlideInRight,
} from 'react-native-reanimated';

// Import components and hooks
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import AnimatedProgressBar from '../components/UI/AnimatedProgressBar';
import AnimatedCard from '../components/UI/AnimatedCard';

const { width } = Dimensions.get('window');

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface HistoryItem {
  date: string;
  itemName: string;
  recyclable: boolean;
  impact: {
    co2Saved: number;
    waterSaved: number;
  };
}

const ImpactScreen: React.FC = () => {
  const { userData, goalProgress, isLoading } = useAppContext();
  const { theme } = useTheme();
  
  // Define default colors for fallback
  const defaultColors = {
    backgroundPrimary: '#FFFFFF',
    backgroundSecondary: '#F0F0F0',
    textPrimary: '#000000',
    textSecondary: '#888888',
    primary: '#007AFF',
    primaryLight: '#D1E7FF',
    success: '#34C759',
    warning: '#FF9500',
    accent: '#FF3B30'
  };

  // Helper function to safely get theme colors
  const getThemeColor = (path: string[], defaultValue: string): string => {
    let current: any = theme;
    for (const key of path) {
      if (!current || typeof current !== 'object' || !(key in current)) {
        return defaultValue;
      }
      current = current[key];
    }
    return typeof current === 'string' ? current : defaultValue;
  };
  
  // Animation values
  const statScale = useSharedValue(0.8);
  const chartOpacity = useSharedValue(0);
  const historyOpacity = useSharedValue(0);
  
  // Start entry animations
  useEffect(() => {
    if (!isLoading && userData) {
      // Scale in the stats
      statScale.value = withSequence(
        withTiming(0.8, { duration: 0 }),
        withTiming(1.1, { 
          duration: 400,
          easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        }),
        withTiming(1, { 
          duration: 300,
          easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        })
      );
      
      // Fade in the progress chart
      chartOpacity.value = withDelay(
        300, 
        withTiming(1, { duration: 700 })
      );
      
      // Fade in the history list
      historyOpacity.value = withDelay(
        600, 
        withTiming(1, { duration: 700 })
      );
    }
  }, [isLoading, userData]);

  // Animate stats cards
  const statCardAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: statScale.value }],
    };
  });
  
  // Animate progress section
  const progressAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: chartOpacity.value,
      transform: [
        { 
          translateY: withTiming(
            chartOpacity.value === 0 ? 20 : 0,
            { duration: 700 }
          )
        }
      ],
    };
  });
  
  // Animate history section
  const historyAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: historyOpacity.value,
      transform: [
        { 
          translateY: withTiming(
            historyOpacity.value === 0 ? 20 : 0,
            { duration: 700 }
          )
        }
      ],
    };
  });
  
  // Loading state
  if (isLoading || !userData) {
    return (
      <SafeAreaView 
        style={[
          styles.container, 
          { backgroundColor: getThemeColor(['backgroundPrimary'], defaultColors.backgroundPrimary) }
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color={getThemeColor(['primary'], defaultColors.primary)} 
          />
          <Text 
            style={[
              styles.loadingText, 
              { color: getThemeColor(['textSecondary'], defaultColors.textSecondary) }
            ]}
          >
            Loading your impact data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render history item with animations
  const renderHistoryItem = ({ item, index }: { item: HistoryItem, index: number }) => (
    <Animated.View
      entering={SlideInRight.delay(index * 100).springify()}
      style={styles.historyItem}
    >
      <View style={styles.historyItemLeft}>
        <View 
          style={[
            styles.recyclableIndicator, 
            { 
              backgroundColor: item.recyclable 
                ? getThemeColor(['success'], defaultColors.success) 
                : getThemeColor(['warning'], defaultColors.warning) 
            }
          ]} 
        />
        <Text 
          style={[
            styles.historyItemName, 
            { color: getThemeColor(['textPrimary'], defaultColors.textPrimary) }
          ]}
        >
          {item.itemName}
        </Text>
      </View>
      <View style={styles.historyItemRight}>
        <Text 
          style={[
            styles.historyItemDate, 
            { color: getThemeColor(['textSecondary'], defaultColors.textSecondary) }
          ]}
        >
          {item.date}
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor: getThemeColor(['backgroundPrimary'], defaultColors.backgroundPrimary) }
      ]}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text 
          style={[
            styles.title, 
            { color: getThemeColor(['textPrimary'], defaultColors.textPrimary) }
          ]}
        >
          Your Impact
        </Text>
        
        {/* Stats Cards */}
        <Animated.View style={[styles.statsContainer, statCardAnimStyle]}>
          <AnimatedCard 
            style={{
              ...styles.statCard, 
              backgroundColor: getThemeColor(['backgroundSecondary'], defaultColors.backgroundSecondary)
            }}
            pressable={false}
            elevation="small"
            initialDelay={100}
          >
            <View style={styles.statCardContent}>
              <Text style={[styles.statValue, { color: getThemeColor(['primary'], defaultColors.primary) }]}>
                {userData.itemsRecycled}
              </Text>
              <Text style={[styles.statLabel, { color: getThemeColor(['textSecondary'], defaultColors.textSecondary) }]}>
                Items Recycled
              </Text>
            </View>
          </AnimatedCard>
          
          <AnimatedCard 
            style={{
              ...styles.statCard, 
              backgroundColor: getThemeColor(['backgroundSecondary'], defaultColors.backgroundSecondary)
            }}
            pressable={false}
            elevation="small"
            initialDelay={200}
          >
            <View style={styles.statCardContent}>
              <Text style={[styles.statValue, { color: getThemeColor(['primary'], defaultColors.primary) }]}>
                {userData.co2Saved} kg
              </Text>
              <Text style={[styles.statLabel, { color: getThemeColor(['textSecondary'], defaultColors.textSecondary) }]}>
                CO₂ Saved
              </Text>
            </View>
          </AnimatedCard>
          
          <AnimatedCard 
            style={{
              ...styles.statCard, 
              backgroundColor: getThemeColor(['backgroundSecondary'], defaultColors.backgroundSecondary)
            }}
            pressable={false}
            elevation="small"
            initialDelay={300}
          >
            <View style={styles.statCardContent}>
              <Text style={[styles.statValue, { color: getThemeColor(['primary'], defaultColors.primary) }]}>
                {userData.waterSaved} L
              </Text>
              <Text style={[styles.statLabel, { color: getThemeColor(['textSecondary'], defaultColors.textSecondary) }]}>
                Water Saved
              </Text>
            </View>
          </AnimatedCard>
        </Animated.View>

        {/* Monthly Goal Progress */}
        <Animated.View style={[styles.progressSection, progressAnimStyle]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons 
                name="trophy" 
                size={20} 
                color={getThemeColor(['primary'], defaultColors.primary)} 
                style={styles.sectionIcon}
              />
              <Text style={[styles.sectionTitle, { color: getThemeColor(['textPrimary'], defaultColors.textPrimary) }]}>
                Monthly Goal
              </Text>
            </View>
            <Text style={[styles.sectionSubtitle, { color: getThemeColor(['textSecondary'], defaultColors.textSecondary) }]}>
              {userData.itemsRecycled} of {userData.monthlyGoal} items
            </Text>
          </View>
          
          <AnimatedProgressBar
            progress={(goalProgress.currentValue / goalProgress.targetValue)}
            height={16}
            showPercentage={true}
            duration={1500}
          />
          
          <View style={styles.goalBadge}>
            <Ionicons name="star" size={16} color={getThemeColor(['accent'], defaultColors.accent)} />
            <Text style={[styles.goalBadgeText, { color: getThemeColor(['textSecondary'], defaultColors.textSecondary) }]}>
              Earn a badge by reaching your monthly goal!
            </Text>
          </View>
        </Animated.View>
        
        {/* Recent Activity */}
        <Animated.View style={[styles.historySection, historyAnimStyle]}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons 
              name="time" 
              size={20} 
              color={getThemeColor(['primary'], defaultColors.primary)} 
              style={styles.sectionIcon}
            />
            <Text style={[styles.sectionTitle, { color: getThemeColor(['textPrimary'], defaultColors.textPrimary) }]}>
              Recent Activity
            </Text>
          </View>
          
          <AnimatedCard
            style={{
              ...styles.historyCard, 
              backgroundColor: getThemeColor(['backgroundSecondary'], defaultColors.backgroundSecondary)
            }}
            pressable={false}
            elevation="small"
          >
            <FlatList
              data={userData.scannedItems}
              renderItem={renderHistoryItem}
              keyExtractor={(item, index) => `${item.itemName}-${index}`}
              scrollEnabled={false}
              style={styles.historyList}
              contentContainerStyle={{ paddingVertical: 8 }}
            />
          </AnimatedCard>
        </Animated.View>
        
        {/* Eco Tips */}
        <Animated.View 
          entering={FadeIn.delay(1000).duration(800)}
          style={styles.tipsSection}
        >
          <View style={styles.sectionTitleContainer}>
            <Ionicons 
              name="bulb" 
              size={20} 
              color={getThemeColor(['primary'], defaultColors.primary)} 
              style={styles.sectionIcon}
            />
            <Text style={[styles.sectionTitle, { color: getThemeColor(['textPrimary'], defaultColors.textPrimary) }]}>
              Eco Tips
            </Text>
          </View>
          
          <AnimatedCard
            style={{ backgroundColor: getThemeColor(['backgroundSecondary'], defaultColors.backgroundSecondary) }}
            pressable={true}
            activeScale={0.97}
            elevation="small"
            borderRadius="large"
            onPress={() => { /* TODO: Implement navigation or action for Learn More */ }}
          >
            <View style={styles.tipCard}>
              <View 
                style={[
                  styles.tipIconContainer,
                  { backgroundColor: getThemeColor(['primaryLight'], defaultColors.primaryLight) }
                ]}
              >
                <Ionicons name="leaf" size={24} color={getThemeColor(['primary'], defaultColors.primary)} />
              </View>
              <View style={styles.tipContent}>
                <Text style={[styles.tipTitle, { color: getThemeColor(['textPrimary'], defaultColors.textPrimary) }]}>
                  Reduce Single-Use Plastics
                </Text>
                <Text style={[styles.tipText, { color: getThemeColor(['textSecondary'], defaultColors.textSecondary) }]}>
                  Carry a reusable water bottle and shopping bags to minimize waste.
                </Text>
                <AnimatedTouchable 
                  style={styles.learnMoreButton}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.learnMoreText, { color: getThemeColor(['primary'], defaultColors.primary) }]}>
                    Learn more
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color={getThemeColor(['primary'], defaultColors.primary)} />
                </AnimatedTouchable>
              </View>
            </View>
          </AnimatedCard>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingBottom: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 30,
  },
  // Stats section
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  statCard: {
    width: (width - 50) / 3,
    padding: 16,
    alignItems: 'center',
  },
  statCardContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  // Progress section
  progressSection: {
    marginBottom: 36,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  goalBadgeText: {
    fontSize: 14,
    marginLeft: 8,
  },
  // History section
  historySection: {
    marginBottom: 36,
  },
  historyCard: {
    marginTop: 16,
    padding: 0,
    overflow: 'hidden',
  },
  historyList: {
    width: '100%',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recyclableIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  historyItemName: {
    fontSize: 16,
  },
  historyItemRight: {},
  historyItemDate: {
    fontSize: 14,
  },
  // Tips section
  tipsSection: {
    marginBottom: 30,
  },
  tipCard: {
    flexDirection: 'row',
    padding: 0,
  },
  tipIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
  },
  tipContent: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  learnMoreText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
});

export default ImpactScreen;
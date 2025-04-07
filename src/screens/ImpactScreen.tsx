import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  SlideInRight,
  ZoomIn,
} from "react-native-reanimated";

// Import components and hooks
import { useAppContext } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import AnimatedProgressBar from "../components/UI/AnimatedProgressBar";
import AnimatedCard from "../components/UI/AnimatedCard";

const { width } = Dimensions.get("window");

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

const EmptyHistoryState = ({ color }: { color: string }) => (
  <View style={styles.emptyStateContainer}>
    <Ionicons
      name="leaf-outline"
      size={42}
      color={color}
      style={{ opacity: 0.7 }}
    />
    <Text style={[styles.emptyStateText, { color }]}>
      No activity recorded yet. Start scanning items to track your impact!
    </Text>
  </View>
);

const ImpactScreen: React.FC = () => {
  const { userData, goalProgress, isLoading } = useAppContext();
  const { theme, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  // Define default colors for fallback
  const defaultColors = {
    backgroundPrimary: isDark ? "#131419" : "#FFFFFF",
    backgroundSecondary: isDark ? "#1B1D25" : "#F5F7FA",
    backgroundTertiary: isDark ? "#262A36" : "#E9ECEF",
    textPrimary: isDark ? "#F8F9FA" : "#1A1A2E",
    textSecondary: isDark ? "#E2E8F0" : "#4A5568",
    primary: isDark ? "#4DC1A1" : "#0080FF",
    primaryLight: isDark ? "rgba(77, 193, 161, 0.15)" : "#E6F2FF",
    primaryDark: isDark ? "#3AA183" : "#0066CC",
    success: isDark ? "#4CAF50" : "#34C759",
    successLight: isDark ? "rgba(76, 175, 80, 0.15)" : "#E6F7ED",
    warning: isDark ? "#FFAB40" : "#FF9500",
    warningLight: isDark ? "rgba(255, 171, 64, 0.15)" : "#FFF6E6",
    accent: isDark ? "#EF5350" : "#FF3B30",
    accentLight: isDark ? "rgba(239, 83, 80, 0.15)" : "#FFE8E6",
    card: isDark ? "#222630" : "#FFFFFF",
    cardBorder: isDark ? "rgba(120, 144, 156, 0.25)" : "#E0E5EB",
    divider: isDark ? "rgba(120, 144, 156, 0.25)" : "#E0E5EB",
  };

  // Helper function to safely get theme colors
  const getThemeColor = (path: string[], defaultValue: string): string => {
    let current: any = theme;
    for (const key of path) {
      if (!current || typeof current !== "object" || !(key in current)) {
        return defaultValue;
      }
      current = current[key];
    }
    return typeof current === "string" ? current : defaultValue;
  };

  // Animation values
  const statScale = useSharedValue(0.8);
  const chartOpacity = useSharedValue(0);
  const historyOpacity = useSharedValue(0);

  // Simulated pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    // In a real app, you would refresh your data here
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

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
      chartOpacity.value = withDelay(300, withTiming(1, { duration: 700 }));

      // Fade in the history list
      historyOpacity.value = withDelay(600, withTiming(1, { duration: 700 }));
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
          translateY: withTiming(chartOpacity.value === 0 ? 20 : 0, {
            duration: 700,
          }),
        },
      ],
    };
  });

  // Animate history section
  const historyAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: historyOpacity.value,
      transform: [
        {
          translateY: withTiming(historyOpacity.value === 0 ? 20 : 0, {
            duration: 700,
          }),
        },
      ],
    };
  });

  // Loading state
  if (isLoading || !userData) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: getThemeColor(
              ["backgroundPrimary"],
              defaultColors.backgroundPrimary
            ),
          },
        ]}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={getThemeColor(
            ["backgroundPrimary"],
            defaultColors.backgroundPrimary
          )}
        />
        <View style={styles.loadingContainer}>
          <Animated.View entering={ZoomIn.duration(800).springify()}>
            <ActivityIndicator
              size="large"
              color={getThemeColor(["primary"], defaultColors.primary)}
            />
          </Animated.View>
          <Animated.Text
            entering={FadeIn.delay(300).duration(600)}
            style={[
              styles.loadingText,
              {
                color: getThemeColor(
                  ["textSecondary"],
                  defaultColors.textSecondary
                ),
              },
            ]}
          >
            Loading your impact data...
          </Animated.Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render history item with animations
  const renderHistoryItem = ({
    item,
    index,
  }: {
    item: HistoryItem;
    index: number;
  }) => (
    <Animated.View
      entering={SlideInRight.delay(index * 100).springify()}
      style={[
        styles.historyItem,
        index === userData.scannedItems.slice(0, 3).length - 1 &&
          styles.historyItemLast,
        {
          borderBottomColor: getThemeColor(["divider"], defaultColors.divider),
        },
      ]}
    >
      <View style={styles.historyItemLeft}>
        <View
          style={[
            styles.recyclableIndicator,
            {
              backgroundColor: item.recyclable
                ? getThemeColor(["success"], defaultColors.success)
                : getThemeColor(["warning"], defaultColors.warning),
            },
          ]}
        />
        <View>
          <Text
            style={[
              styles.historyItemName,
              {
                color: getThemeColor(
                  ["textPrimary"],
                  defaultColors.textPrimary
                ),
              },
            ]}
          >
            {item.itemName}
          </Text>
          <Text
            style={[
              styles.historyItemImpact,
              {
                color: getThemeColor(
                  ["textSecondary"],
                  defaultColors.textSecondary
                ),
              },
            ]}
          >
            {item.recyclable
              ? `Saved ${item.impact.co2Saved}kg CO₂`
              : "Not recyclable"}
          </Text>
        </View>
      </View>
      <View style={styles.historyItemRight}>
        <Text
          style={[
            styles.historyItemDate,
            {
              color: getThemeColor(
                ["textSecondary"],
                defaultColors.textSecondary
              ),
            },
          ]}
        >
          {item.date}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={getThemeColor(["textSecondary"], defaultColors.textSecondary)}
          style={{ opacity: 0.5 }}
        />
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: getThemeColor(
            ["backgroundPrimary"],
            defaultColors.backgroundPrimary
          ),
        },
      ]}
      edges={["top"]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={getThemeColor(
          ["backgroundPrimary"],
          defaultColors.backgroundPrimary
        )}
      />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={getThemeColor(["primary"], defaultColors.primary)}
            colors={[getThemeColor(["primary"], defaultColors.primary)]}
          />
        }
      >
        <Text
          style={[
            styles.title,
            {
              color: getThemeColor(["textPrimary"], defaultColors.textPrimary),
            },
          ]}
        >
          Your Impact
        </Text>

        {/* Stats Cards */}
        <Animated.View style={[styles.statsContainer, statCardAnimStyle]}>
          <AnimatedCard
            style={styles.statCard}
            pressable={false}
            elevation="medium"
            initialDelay={100}
          >
            <View style={styles.statCardContent}>
              <View
                style={[
                  styles.statIconContainer,
                  {
                    backgroundColor: getThemeColor(
                      ["primaryLight"],
                      defaultColors.primaryLight
                    ),
                  },
                ]}
              >
                <Ionicons
                  name="repeat"
                  size={18}
                  color={getThemeColor(["primary"], defaultColors.primary)}
                />
              </View>
              <Text
                style={[
                  styles.statValue,
                  {
                    color: getThemeColor(
                      ["textPrimary"],
                      defaultColors.textPrimary
                    ),
                  },
                ]}
              >
                {userData.itemsRecycled}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: getThemeColor(
                      ["textSecondary"],
                      defaultColors.textSecondary
                    ),
                  },
                ]}
              >
                Items Recycled
              </Text>
            </View>
          </AnimatedCard>

          <AnimatedCard
            style={styles.statCard}
            pressable={false}
            elevation="medium"
            initialDelay={200}
          >
            <View style={styles.statCardContent}>
              <View
                style={[
                  styles.statIconContainer,
                  {
                    backgroundColor: getThemeColor(
                      ["successLight"],
                      defaultColors.successLight
                    ),
                  },
                ]}
              >
                <Ionicons
                  name="cloud"
                  size={18}
                  color={getThemeColor(["success"], defaultColors.success)}
                />
              </View>
              <Text
                style={[
                  styles.statValue,
                  {
                    color: getThemeColor(
                      ["textPrimary"],
                      defaultColors.textPrimary
                    ),
                  },
                ]}
              >
                {userData.co2Saved} kg
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: getThemeColor(
                      ["textSecondary"],
                      defaultColors.textSecondary
                    ),
                  },
                ]}
              >
                CO₂ Saved
              </Text>
            </View>
          </AnimatedCard>

          <AnimatedCard
            style={styles.statCard}
            pressable={false}
            elevation="medium"
            initialDelay={300}
          >
            <View style={styles.statCardContent}>
              <View
                style={[
                  styles.statIconContainer,
                  {
                    backgroundColor: getThemeColor(
                      ["primaryLight"],
                      defaultColors.primaryLight
                    ),
                  },
                ]}
              >
                <Ionicons
                  name="water"
                  size={18}
                  color={getThemeColor(["primary"], defaultColors.primary)}
                />
              </View>
              <Text
                style={[
                  styles.statValue,
                  {
                    color: getThemeColor(
                      ["textPrimary"],
                      defaultColors.textPrimary
                    ),
                  },
                ]}
              >
                {userData.waterSaved} L
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: getThemeColor(
                      ["textSecondary"],
                      defaultColors.textSecondary
                    ),
                  },
                ]}
              >
                Water Saved
              </Text>
            </View>
          </AnimatedCard>
        </Animated.View>

        {/* Monthly Goal Progress */}
        <Animated.View style={[styles.progressSection, progressAnimStyle]}>
          <AnimatedCard
            style={{
              padding: 14,
            }}
            pressable={false}
            elevation="medium"
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons
                  name="trophy"
                  size={18}
                  color={getThemeColor(["primary"], defaultColors.primary)}
                  style={styles.sectionIcon}
                />
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: getThemeColor(
                        ["textPrimary"],
                        defaultColors.textPrimary
                      ),
                    },
                  ]}
                >
                  Monthly Goal
                </Text>
              </View>
              <Text
                style={[
                  styles.sectionSubtitle,
                  {
                    color: getThemeColor(
                      ["textSecondary"],
                      defaultColors.textSecondary
                    ),
                  },
                ]}
              >
                {userData.itemsRecycled} of {userData.monthlyGoal} items
              </Text>
            </View>

            <View style={styles.progressBarContainer}>
              <AnimatedProgressBar
                progress={
                  userData.monthlyGoal > 0
                    ? (userData.itemsRecycled / userData.monthlyGoal) * 100
                    : 0
                }
                height={12}
                showPercentage={true}
                duration={1500}
                borderRadius={6}
                backgroundColor={getThemeColor(
                  ["backgroundTertiary"],
                  defaultColors.backgroundTertiary
                )}
                progressColor={getThemeColor(
                  ["primary"],
                  defaultColors.primary
                )}
                textStyle={{
                  color: getThemeColor(
                    ["textSecondary"],
                    defaultColors.textSecondary
                  ),
                  fontSize: 12,
                  fontWeight: "600",
                }}
                valuePrefix=""
                valueSuffix="%"
              />
            </View>

            <View style={styles.goalBadge}>
              <View
                style={[
                  styles.badgeIconContainer,
                  {
                    backgroundColor: getThemeColor(
                      ["accentLight"],
                      defaultColors.accentLight
                    ),
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    marginRight: 8,
                  },
                ]}
              >
                <Ionicons
                  name="star"
                  size={12}
                  color={getThemeColor(["accent"], defaultColors.accent)}
                />
              </View>
              <Text
                style={[
                  styles.goalBadgeText,
                  {
                    color: getThemeColor(
                      ["textSecondary"],
                      defaultColors.textSecondary
                    ),
                    fontSize: 13,
                  },
                ]}
              >
                Earn a badge by reaching your monthly goal!
              </Text>
            </View>
          </AnimatedCard>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View style={[styles.historySection, historyAnimStyle]}>
          <View style={[styles.sectionHeaderWithAction, { marginBottom: 12 }]}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons
                name="time"
                size={18}
                color={getThemeColor(["primary"], defaultColors.primary)}
                style={styles.sectionIcon}
              />
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: getThemeColor(
                      ["textPrimary"],
                      defaultColors.textPrimary
                    ),
                  },
                ]}
              >
                Recent Activity
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.viewAllButton,
                {
                  backgroundColor: theme?.primaryLight,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => {
                /* TODO: Navigate to full history */
              }}
            >
              <Text
                style={[
                  styles.viewAllText,
                  {
                    color: getThemeColor(["primary"], defaultColors.primary),
                  },
                ]}
              >
                View All
              </Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={getThemeColor(["primary"], defaultColors.primary)}
              />
            </TouchableOpacity>
          </View>

          <AnimatedCard
            style={{
              padding: 0,
            }}
            pressable={false}
            elevation="medium"
          >
            {userData.scannedItems && userData.scannedItems.length > 0 ? (
              <FlatList
                data={userData.scannedItems.slice(0, 3)}
                renderItem={renderHistoryItem}
                keyExtractor={(item, index) => `${item.itemName}-${index}`}
                scrollEnabled={false}
                style={styles.historyList}
                contentContainerStyle={{ paddingVertical: 8 }}
              />
            ) : (
              <EmptyHistoryState
                color={getThemeColor(
                  ["textSecondary"],
                  defaultColors.textSecondary
                )}
              />
            )}
          </AnimatedCard>
        </Animated.View>

        {/* Eco Tips */}
        <Animated.View
          entering={FadeIn.delay(1000).duration(800)}
          style={[styles.tipsSection, { marginBottom: 10 }]}
        >
          <View style={[styles.sectionTitleContainer, { marginBottom: 12 }]}>
            <Ionicons
              name="bulb"
              size={18}
              color={getThemeColor(["primary"], defaultColors.primary)}
              style={styles.sectionIcon}
            />
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: getThemeColor(
                    ["textPrimary"],
                    defaultColors.textPrimary
                  ),
                },
              ]}
            >
              Eco Tips
            </Text>
          </View>

          <AnimatedCard
            style={{
              padding: 0,
            }}
            pressable={true}
            activeScale={0.97}
            elevation="medium"
            borderRadius="large"
            onPress={() => {
              /* TODO: Implement navigation or action for Learn More */
            }}
          >
            <View style={styles.tipCard}>
              <View style={styles.tipContent}>
                <Text
                  style={[
                    styles.tipTitle,
                    {
                      color: getThemeColor(
                        ["textPrimary"],
                        defaultColors.textPrimary
                      ),
                    },
                  ]}
                >
                  Reduce Single-Use Plastics
                </Text>
                <Text
                  style={[
                    styles.tipText,
                    {
                      color: getThemeColor(
                        ["textSecondary"],
                        defaultColors.textSecondary
                      ),
                    },
                  ]}
                >
                  Carry a reusable water bottle and shopping bags to minimize
                  waste.
                </Text>
                <AnimatedTouchable
                  style={styles.learnMoreButton}
                  activeOpacity={0.7}
                  onPress={() => {
                    Linking.openURL(
                      "https://www.nationalgeographic.com/environment/article/plastic-pollution"
                    );
                  }}
                >
                  <Text
                    style={[
                      styles.learnMoreText,
                      {
                        color: getThemeColor(
                          ["primary"],
                          defaultColors.primary
                        ),
                      },
                    ]}
                  >
                    Learn more
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={getThemeColor(["primary"], defaultColors.primary)}
                  />
                </AnimatedTouchable>
              </View>
              <View
                style={[
                  styles.tipIconContainer,
                  {
                    backgroundColor: getThemeColor(
                      ["primaryLight"],
                      defaultColors.primaryLight
                    ),
                  },
                ]}
              >
                <Ionicons
                  name="leaf"
                  size={20}
                  color={getThemeColor(["primary"], defaultColors.primary)}
                />
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
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  // Stats section
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  statCard: {
    width: (width - 56) / 3,
    padding: 12,
    alignItems: "center",
  },
  statCardContent: {
    alignItems: "center",
    padding: 4,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  // Progress section
  progressSection: {
    marginBottom: 28,
  },
  progressBarContainer: {
    marginVertical: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionHeaderWithAction: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: "500",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "600",
    marginRight: 4,
  },
  badgeIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  goalBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 2,
  },
  goalBadgeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  // History section
  historySection: {
    marginBottom: 28,
  },
  historyCard: {
    padding: 0,
    overflow: "hidden",
  },
  historyList: {
    width: "100%",
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  historyItemLast: {
    borderBottomWidth: 0,
  },
  historyItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  recyclableIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  historyItemName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 3,
  },
  historyItemImpact: {
    fontSize: 12,
    fontWeight: "400",
  },
  historyItemRight: {
    alignItems: "flex-end",
    flexDirection: "row",
  },
  historyItemDate: {
    fontSize: 12,
    marginRight: 8,
  },
  // Empty state
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 36,
  },
  emptyStateText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    paddingHorizontal: 20,
  },
  // Tips section
  tipsSection: {
    marginBottom: 16,
    marginTop: 0,
  },
  tipCard: {
    flexDirection: "row",
    padding: 14,
  },
  tipIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  tipContent: {
    flex: 1,
    paddingVertical: 2,
    paddingRight: 6,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 18,
  },
  learnMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingVertical: 2,
  },
  learnMoreText: {
    fontSize: 13,
    fontWeight: "600",
    marginRight: 4,
  },
});

export default ImpactScreen;

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated as RNAnimated,
  Platform,
  Linking,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  FadeIn,
  SlideInRight,
  FadeInDown,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
  withRepeat,
} from "react-native-reanimated";

// Import components
import RecyclingMap from "../components/map/RecyclingMap";
import AnimatedCard from "../components/UI/AnimatedCard";
import { useTheme } from "../context/ThemeContext";
import { useHapticFeedback } from "../hooks/useAnimations";

const { width } = Dimensions.get("window");
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Define types for structured data
interface RecyclingLocation {
  id: string;
  name: string;
  distance: string;
  type: "recycling" | "store" | "e-waste" | "composting";
  coordinate: {
    latitude: number;
    longitude: number;
  };
}

interface ResourceGuide {
  id: string;
  title: string;
  category: string;
  icon: any;
  url: string;
}

const ResourcesScreen: React.FC = () => {
  const { theme } = useTheme();
  const { triggerSelection } = useHapticFeedback();
  const scrollY = useSharedValue(0);

  // Animation values
  const spinValue = useSharedValue(0);

  // State for active/selected card
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [loadingResource, setLoadingResource] = useState<string | null>(null);
  const [loadingDirections, setLoadingDirections] = useState<string | null>(
    null
  );
  const [mapFilterType, setMapFilterType] = useState<string | null>(null);

  // Mock data for locations and guides
  const locations: RecyclingLocation[] = [
    {
      id: "1",
      name: "City Recycling Center",
      distance: "1.2 mi",
      type: "recycling",
      coordinate: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
    },
    {
      id: "2",
      name: "Green Earth Disposal",
      distance: "2.5 mi",
      type: "e-waste",
      coordinate: {
        latitude: 37.7833,
        longitude: -122.4167,
      },
    },
    {
      id: "3",
      name: "EcoMarket",
      distance: "0.8 mi",
      type: "store",
      coordinate: {
        latitude: 37.7694,
        longitude: -122.4862,
      },
    },
    {
      id: "4",
      name: "Electronic Waste Depot",
      distance: "3.1 mi",
      type: "e-waste",
      coordinate: {
        latitude: 37.7987,
        longitude: -122.44,
      },
    },
    {
      id: "5",
      name: "Community Compost Hub",
      distance: "1.8 mi",
      type: "composting",
      coordinate: {
        latitude: 37.8061,
        longitude: -122.4157,
      },
    },
  ];

  const guides: ResourceGuide[] = [
    {
      id: "1",
      title: "Plastic Recycling Guide",
      category: "Guide",
      icon: "document-text-outline",
      url: "https://www.epa.gov/recycle/how-do-i-recycle-common-recyclables",
    },
    {
      id: "2",
      title: "Composting at Home",
      category: "Tutorial",
      icon: "leaf-outline",
      url: "https://www.epa.gov/recycle/composting-home",
    },
    {
      id: "3",
      title: "Reducing Food Waste",
      category: "Tips",
      icon: "restaurant-outline",
      url: "https://www.epa.gov/recycle/reducing-wasted-food-home",
    },
    {
      id: "4",
      title: "Electronic Waste Disposal",
      category: "Guide",
      icon: "hardware-chip-outline",
      url: "https://www.epa.gov/recycle/electronics-donation-and-recycling",
    },
  ];

  // Filter categories from guides data
  const categories = Array.from(new Set(guides.map((guide) => guide.category)));

  // Create animated scroll handler
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // Use Reanimated interpolate for header parallax effect
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 80],
      [0, -20],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateY }],
      opacity: interpolate(scrollY.value, [0, 40], [1, 0.9], Extrapolate.CLAMP),
    };
  });

  // Get icon for a location type
  const getLocationIcon = (type: string) => {
    switch (type) {
      case "recycling":
        return "refresh";
      case "store":
        return "basket";
      case "e-waste":
        return "hardware-chip";
      case "composting":
        return "leaf";
      default:
        return "location";
    }
  };

  // Get color for a location type
  const getLocationColor = (type: string) => {
    switch (type) {
      case "recycling":
        return theme.primary;
      case "store":
        return theme.info;
      case "e-waste":
        return theme.warning;
      case "composting":
        return theme.success;
      default:
        return theme.textSecondary;
    }
  };

  // Toggle show all locations
  const toggleShowAllLocations = () => {
    setShowAllLocations(!showAllLocations);
    triggerSelection();
  };

  // Handle opening URLs
  const openResourceUrl = async (url: string, resourceId: string) => {
    // Set loading state
    setLoadingResource(resourceId);

    // Start spinning animation
    spinValue.value = 0;
    spinValue.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.linear }),
      -1, // Infinite repetition
      false
    );

    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open this URL");
      }
    } catch (error) {
      console.error("Error opening URL:", error);
      Alert.alert("Error", "Something went wrong opening this resource");
    } finally {
      // Clear loading state
      setLoadingResource(null);
    }

    // Provide haptic feedback
    triggerSelection();
  };

  // Open directions in Google Maps
  const openDirections = async (location: RecyclingLocation) => {
    // Set loading state
    setLoadingDirections(location.id);

    const { latitude, longitude } = location.coordinate;
    const label = encodeURIComponent(location.name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${label}`,
    });

    try {
      // Start spinning animation for potential loading icon
      spinValue.value = 0;
      spinValue.value = withRepeat(
        withTiming(1, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );

      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback to web URL if app-specific URL isn't supported
        const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${encodeURIComponent(
          location.name
        )}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.error("Error opening directions:", error);
      Alert.alert("Error", "Cannot open directions at this time");
    } finally {
      // Clear loading state
      setLoadingDirections(null);
    }

    // Provide haptic feedback
    triggerSelection();
  };

  // Toggle category filter
  const toggleCategory = (category: string) => {
    setActiveCategory(activeCategory === category ? null : category);
    triggerSelection();
  };

  // Filtered guides based on active category
  const filteredGuides = activeCategory
    ? guides.filter((guide) => guide.category === activeCategory)
    : guides;

  // Toggle map filter type
  const toggleMapFilter = (type: string) => {
    setMapFilterType(mapFilterType === type ? null : type);
    // In a real app, you would filter the map markers here
    triggerSelection();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgroundPrimary }]}
    >
      {/* Add top padding to header container */}
      <View style={{ paddingTop: Platform.OS === "ios" ? 10 : 20 }}>
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Resources
          </Text>
        </Animated.View>
      </View>

      {/* Use Reanimated Animated.ScrollView and the new handler */}
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
      >
        {/* Map Section */}
        <View style={{ alignItems: "center" }}>
          <View
            style={[
              styles.mapContainer,
              { width: width - 40 }, // Ensure correct width
            ]}
          >
            <RecyclingMap height={200} showUserLocation={true} />
          </View>
        </View>

        <View>
          {/* Location Section */}
          <View style={[styles.sectionContainer, { marginTop: 4 }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons
                  name="location"
                  size={18}
                  color={theme.primary}
                  style={styles.sectionIcon}
                />
                <Text
                  style={[styles.sectionTitle, { color: theme.textPrimary }]}
                >
                  Nearby Locations
                </Text>
                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 12,
                    marginLeft: 8,
                  }}
                >
                  ({locations.length})
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.viewAllButton,
                  showAllLocations && styles.showLessButton,
                  {
                    backgroundColor: showAllLocations
                      ? theme.primaryLight
                      : "transparent",
                  },
                ]}
                activeOpacity={0.7}
                onPress={toggleShowAllLocations}
              >
                <Text style={[styles.viewAllText, { color: theme.primary }]}>
                  {showAllLocations ? "Show Less" : "View All"}
                </Text>
                <Ionicons
                  name={showAllLocations ? "chevron-up" : "chevron-forward"}
                  size={14}
                  color={theme.primary}
                  style={{ marginLeft: 2 }}
                />
              </TouchableOpacity>
            </View>

            {(showAllLocations ? locations : locations.slice(0, 3)).map(
              (location, index) => (
                <AnimatedTouchable
                  key={location.id}
                  entering={
                    showAllLocations && index >= 3
                      ? FadeInDown.delay(index * 60)
                          .springify()
                          .duration(350)
                      : SlideInRight.delay(index * 100).springify()
                  }
                  style={[
                    styles.locationCard,
                    selectedLocation === location.id && styles.selectedCard,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      borderColor:
                        selectedLocation === location.id
                          ? getLocationColor(location.type)
                          : "transparent",
                    },
                  ]}
                  onPress={() => {
                    setSelectedLocation(
                      selectedLocation === location.id ? null : location.id
                    );
                    triggerSelection();
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.locationIconContainer,
                      { backgroundColor: getLocationColor(location.type) },
                    ]}
                  >
                    <Ionicons
                      name={getLocationIcon(location.type)}
                      size={18}
                      color="#FFFFFF"
                    />
                  </View>

                  <View style={styles.locationInfo}>
                    <Text
                      style={[
                        styles.locationName,
                        { color: theme.textPrimary },
                      ]}
                    >
                      {location.name}
                    </Text>
                    <Text
                      style={[
                        styles.locationDistance,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {location.distance}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.directionsButton,
                      { backgroundColor: theme.primary },
                    ]}
                    onPress={() => openDirections(location)}
                    disabled={loadingDirections === location.id}
                  >
                    {loadingDirections === location.id ? (
                      <View style={styles.directionsLoadingContainer}>
                        <Text
                          style={[
                            styles.directionsButtonText,
                            { color: theme.textInverse },
                          ]}
                        >
                          Opening
                        </Text>
                        <Animated.View
                          style={{
                            marginLeft: 4,
                            transform: [
                              {
                                rotate:
                                  interpolate(
                                    spinValue.value,
                                    [0, 1],
                                    [0, 360]
                                  ) + "deg",
                              },
                            ],
                          }}
                        >
                          <Ionicons
                            name="navigate-circle-outline"
                            size={14}
                            color={theme.textInverse}
                          />
                        </Animated.View>
                      </View>
                    ) : (
                      <View style={styles.directionsLoadingContainer}>
                        <Text
                          style={[
                            styles.directionsButtonText,
                            { color: theme.textInverse },
                          ]}
                        >
                          Directions
                        </Text>
                        <Ionicons
                          name="navigate-outline"
                          size={14}
                          color={theme.textInverse}
                          style={{ marginLeft: 4 }}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                </AnimatedTouchable>
              )
            )}

            {!showAllLocations && locations.length > 3 && (
              <Animated.View
                entering={FadeIn.delay(300)}
                style={styles.moreIndicator}
              >
                <View
                  style={[
                    styles.dotIndicator,
                    { backgroundColor: theme.textSecondary },
                  ]}
                ></View>
                <View
                  style={[
                    styles.dotIndicator,
                    { backgroundColor: theme.textSecondary },
                  ]}
                ></View>
                <View
                  style={[
                    styles.dotIndicator,
                    { backgroundColor: theme.textSecondary },
                  ]}
                ></View>
              </Animated.View>
            )}
          </View>

          {/* Resource Guides Section */}
          <View
            style={[styles.sectionContainer, { marginTop: 8, marginBottom: 0 }]}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons
                  name="book"
                  size={18}
                  color={theme.primary}
                  style={styles.sectionIcon}
                />
                <Text
                  style={[styles.sectionTitle, { color: theme.textPrimary }]}
                >
                  Helpful Resources
                </Text>
              </View>
            </View>

            {/* Category filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContainer}
              style={{ marginLeft: -2 }}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    activeCategory === category && styles.activeCategoryButton,
                    {
                      backgroundColor:
                        activeCategory === category
                          ? theme.primary
                          : theme.backgroundSecondary,
                    },
                  ]}
                  onPress={() => toggleCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      {
                        color:
                          activeCategory === category
                            ? theme.textInverse
                            : theme.textPrimary,
                      },
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Guide cards */}
            <Animated.View
              entering={FadeIn.duration(400)}
              style={{ paddingTop: 4 }}
            >
              {filteredGuides.map((guide, index) => (
                <AnimatedCard
                  key={guide.id}
                  style={{
                    ...styles.guideCard,
                    backgroundColor: theme.backgroundSecondary,
                  }}
                  pressable={loadingResource !== guide.id}
                  hapticFeedback={true}
                  onPress={() => openResourceUrl(guide.url, guide.id)}
                  initialDelay={index * 100}
                >
                  <View>
                    <Text
                      style={[styles.guideTitle, { color: theme.textPrimary }]}
                    >
                      {guide.title}
                    </Text>
                    <Text
                      style={[
                        styles.guideCategory,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {guide.category}
                    </Text>
                    <View style={styles.learnMoreContainer}>
                      <Text style={[styles.guideUrl, { color: theme.primary }]}>
                        {loadingResource === guide.id
                          ? "Opening..."
                          : "Learn More"}
                      </Text>
                      {loadingResource === guide.id ? (
                        <Animated.View
                          style={[
                            {
                              marginLeft: 4,
                              transform: [
                                {
                                  rotate: spinValue.value
                                    ? interpolate(
                                        spinValue.value,
                                        [0, 1],
                                        [0, 360]
                                      ) + "deg"
                                    : "0deg",
                                },
                              ],
                            },
                          ]}
                        >
                          <Ionicons
                            name="sync-outline"
                            size={12}
                            color={theme.primary}
                          />
                        </Animated.View>
                      ) : (
                        <Ionicons
                          name="open-outline"
                          size={12}
                          color={theme.primary}
                          style={{ marginLeft: 4 }}
                        />
                      )}
                    </View>
                  </View>
                  <View
                    style={[
                      styles.guideIconContainer,
                      { backgroundColor: theme.primaryLight },
                    ]}
                  >
                    <Ionicons
                      name={guide.icon as any}
                      size={18}
                      color={theme.primary}
                    />
                  </View>
                </AnimatedCard>
              ))}
            </Animated.View>
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "relative",
    zIndex: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 2,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 30,
  },
  // Map styles
  mapContainer: {
    marginBottom: 28,
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 20,
    width: width - 40,
  },
  mapToggleButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 10,
  },
  // Section styles
  sectionContainer: {
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
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
  },
  viewAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
  },
  showLessButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "600",
  },
  // Location card styles
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCard: {
    borderWidth: 2,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  locationInfo: {
    flex: 1,
    marginRight: 12,
  },
  locationName: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  locationDistance: {
    fontSize: 13,
    opacity: 0.85,
  },
  directionsButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  directionsButtonText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  directionsLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  // Category filter
  categoryContainer: {
    paddingBottom: 16,
    paddingTop: 2,
    paddingLeft: 2,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 8,
  },
  activeCategoryButton: {},
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  // Guide card styles
  guideCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
  },
  guideTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  guideCategory: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.9,
  },
  learnMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  guideUrl: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  guideIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  moreIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
    marginTop: -2,
  },
  dotIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 2,
    opacity: 0.6,
  },
  mapStatusIndicator: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    opacity: 0.9,
  },
  expandedMapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    zIndex: 5,
  },
  mapControlsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  mapActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  mapInfoPanel: {
    borderRadius: 12,
    margin: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  mapInfoContent: {
    padding: 12,
  },
  mapInfoTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  mapLegendRow: {
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: "row",
    marginTop: 6,
    justifyContent: "space-between",
    paddingRight: 40,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  fullMapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  mapFilterContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  mapFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginRight: 6,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
  },
  mapFilterStrip: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  mapLegendPanel: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    borderRadius: 8,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.85)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});

export default ResourcesScreen;

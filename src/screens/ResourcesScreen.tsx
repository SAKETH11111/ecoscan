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
  ActivityIndicator,
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
import { useAppContext } from "../context/AppContext";
import type { PlaceResult } from "../services/placesApi";

const { width } = Dimensions.get("window");
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Define types for structured data
interface RecyclingLocation {
  id: string;
  name: string;
  distance?: string;
  type: "recycling" | "store" | "e-waste" | "composting";
  coordinate: {
    latitude: number;
    longitude: number;
  };
  address?: string;
}

// Define types for resource guides
interface ResourceGuide {
  id: string;
  title: string;
  category: string;
  icon: string;
  url: string;
}

const ResourcesScreen: React.FC = () => {
  const { theme } = useTheme();
  const { triggerSelection } = useHapticFeedback();
  const { recyclingLocations, currentScanResult, isLoadingLocations } = useAppContext();
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

  // Convert recyclingLocations to the format needed by RecyclingMap
  const adaptedLocations = recyclingLocations.map((location: PlaceResult) => ({
    id: location.id,
    name: location.name,
    distance: location.distance ? `${location.distance.toFixed(1)} km` : '',
    type: determineLocationType(location),
    coordinate: location.coordinates,
  }));

  // Determine the location type based on types or name
  function determineLocationType(location: PlaceResult): "recycling" | "store" | "e-waste" | "composting" {
    const types = location.types || [];
    const name = location.name.toLowerCase();
    
    if (types.includes('electronics_store') || name.includes('electronic') || name.includes('e-waste')) {
      return 'e-waste';
    }
    
    if (types.includes('store') || types.includes('shopping_mall') || name.includes('market') || name.includes('shop')) {
      return 'store';
    }
    
    if (name.includes('compost') || name.includes('organic')) {
      return 'composting';
    }
    
    // Default type
    return 'recycling';
  }

  // Use combined locations: API results + mock data
  const locations = adaptedLocations.length > 0
    ? adaptedLocations
    : [];

  // Mock data for guides
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

  // Handle opening directions
  const openDirections = async (locationId: string) => {
    const location = locations.find((loc) => loc.id === locationId);
    if (!location) return;

    // Set loading state
    setLoadingDirections(locationId);

    // Create directions URL
    const directionsUrl = Platform.select({
      ios: `maps://app?daddr=${location.coordinate.latitude},${location.coordinate.longitude}`,
      android: `google.navigation:q=${location.coordinate.latitude},${location.coordinate.longitude}`,
    });

    try {
      const supported = await Linking.canOpenURL(directionsUrl);

      if (supported) {
        await Linking.openURL(directionsUrl);
      } else {
        // Fallback to Google Maps web URL
        await Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${location.coordinate.latitude},${location.coordinate.longitude}`
        );
      }
    } catch (error) {
      console.error("Error opening directions:", error);
      Alert.alert("Error", "Unable to open directions");
    } finally {
      // Clear loading state
      setLoadingDirections(null);
    }

    // Provide haptic feedback
    triggerSelection();
  };

  // Filter guides by category
  const filteredGuides = activeCategory
    ? guides.filter((guide) => guide.category === activeCategory)
    : guides;

  // Show current scan info if available
  const renderCurrentScanInfo = () => {
    if (!currentScanResult) return null;

    return (
      <Animated.View 
        style={[
          styles.scanInfo, 
          { backgroundColor: theme.backgroundSecondary }
        ]}
        entering={FadeInDown.duration(300).springify()}
      >
        <Text style={[styles.scanInfoLabel, { color: theme.textSecondary }]}>
          Recycling locations for:
        </Text>
        <Text style={[styles.scanInfoItem, { color: theme.textPrimary }]}>
          {currentScanResult.itemName} ({currentScanResult.material})
        </Text>
      </Animated.View>
    );
  };

  // Update loading state to use isLoadingLocations
  const renderContent = () => {
    if (isLoadingLocations) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Finding recycling locations...
          </Text>
        </View>
      );
    }
    
    if (locations.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="leaf-outline"
            size={60}
            color={theme.accent}
            style={{ opacity: 0.5 }}
          />
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
            No Recycling Locations Found
          </Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {currentScanResult 
              ? `We couldn't find recycling locations for ${currentScanResult.itemName}.` 
              : 'Scan an item to find nearby recycling locations.'}
          </Text>
        </View>
      );
    }

    return (
      <>
        <View style={styles.locationHeader}>
          <Text style={[styles.locationTitle, { color: theme.textPrimary }]}>
            Nearby Locations
          </Text>
          
          {locations.length > 3 && (
            <TouchableOpacity onPress={toggleShowAllLocations}>
              <Text style={[styles.showAllText, { color: theme.primary }]}>
                {showAllLocations ? "Show Less" : "Show All"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Animated.View
          layout={FadeIn}
          style={styles.locationsContainer}
        >
          {(showAllLocations ? locations : locations.slice(0, 3)).map((location, index) => (
            <AnimatedCard
              key={location.id}
              style={[
                styles.locationCard,
                {
                  backgroundColor: theme.backgroundCard,
                  borderColor: selectedLocation === location.id
                    ? getLocationColor(location.type)
                    : 'transparent',
                  borderWidth: selectedLocation === location.id ? 2 : 0,
                }
              ]}
              entering={FadeIn.delay(index * 100)}
              onPress={() => setSelectedLocation(
                selectedLocation === location.id ? null : location.id
              )}
            >
              <View
                style={[
                  styles.locationTypeIcon,
                  { backgroundColor: getLocationColor(location.type) },
                ]}
              >
                <Ionicons
                  name={getLocationIcon(location.type)}
                  size={20}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.locationInfo}>
                <Text
                  style={[styles.locationName, { color: theme.textPrimary }]}
                  numberOfLines={1}
                >
                  {location.name}
                </Text>
                <View style={styles.locationDetails}>
                  {location.distance && (
                    <View style={styles.locationDetail}>
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color={theme.textSecondary}
                        style={styles.locationDetailIcon}
                      />
                      <Text
                        style={[
                          styles.locationDetailText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {location.distance}
                      </Text>
                    </View>
                  )}
                  <View style={styles.locationDetail}>
                    <Ionicons
                      name="information-circle-outline"
                      size={14}
                      color={theme.textSecondary}
                      style={styles.locationDetailIcon}
                    />
                    <Text
                      style={[
                        styles.locationDetailText,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.directionsButton,
                  { backgroundColor: theme.primary },
                ]}
                onPress={() => openDirections(location.id)}
                activeOpacity={0.7}
              >
                {loadingDirections === location.id ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="navigate" size={18} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </AnimatedCard>
          ))}
        </Animated.View>

        <View style={styles.divider} />

        <View style={styles.guidesSection}>
          <Text style={[styles.guidesTitle, { color: theme.textPrimary }]}>
            Helpful Resources
          </Text>

          <View style={styles.categories}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor:
                      activeCategory === category
                        ? theme.primaryLight
                        : "transparent",
                    borderColor: theme.primaryLight,
                  },
                ]}
                onPress={() => {
                  setActiveCategory(
                    activeCategory === category ? null : category
                  );
                  triggerSelection();
                }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color:
                        activeCategory === category
                          ? theme.primary
                          : theme.textSecondary,
                    },
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Animated.View style={styles.guides}>
            {filteredGuides.map((guide, index) => (
              <AnimatedCard
                key={guide.id}
                style={[
                  styles.guideCard,
                  { backgroundColor: theme.backgroundCard },
                ]}
                onPress={() => openResourceUrl(guide.url, guide.id)}
                entering={SlideInRight.delay(index * 100)}
              >
                <View style={styles.guideInfo}>
                  <Text
                    style={[styles.guideTitle, { color: theme.textPrimary }]}
                    numberOfLines={2}
                  >
                    {guide.title}
                  </Text>
                  <View style={styles.guideDetails}>
                    <View style={styles.guideTag}>
                      <Text
                        style={[
                          styles.guideTagText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {guide.category}
                      </Text>
                    </View>
                  </View>
                </View>

                <View
                  style={[
                    styles.guideIcon,
                    {
                      backgroundColor: theme.primaryLight,
                    },
                  ]}
                >
                  {loadingResource === guide.id ? (
                    <ActivityIndicator
                      size="small"
                      color={theme.primary}
                    />
                  ) : (
                    <Ionicons
                      name={guide.icon}
                      size={24}
                      color={theme.primary}
                    />
                  )}
                </View>
              </AnimatedCard>
            ))}
          </Animated.View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundPrimary }]}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />
      
      {/* Header Section */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Recycling Resources
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Find places to recycle your items
        </Text>
      </Animated.View>

      {/* Current scan info if available */}
      {renderCurrentScanInfo()}
      
      {/* Content */}
      <Animated.ScrollView
        style={[styles.scrollView, { backgroundColor: theme.backgroundPrimary }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Map only if we have locations */}
        {locations.length > 0 && (
          <RecyclingMap
            height={300}
            onLocationPress={(loc) => setSelectedLocation(loc.id)}
            showUserLocation={true}
            // Add locations to the map
            locations={locations}
            // Filter by type if selected
            filter={mapFilterType}
          />
        )}
        
        {/* Main content */}
        {renderContent()}
        
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
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 30,
  },
  scrollView: {
    flex: 1,
  },
  filterContainer: {
    padding: 16,
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
  currentScanCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  currentScanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentScanIcon: {
    marginRight: 8,
  },
  currentScanTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  currentScanText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  currentScanItem: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  showAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  locationsContainer: {
    padding: 16,
  },
  locationTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  locationInfo: {
    flex: 1,
  },
  locationDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationDetail: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationDetailIcon: {
    marginRight: 4,
  },
  locationDetailText: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  guidesSection: {
    padding: 16,
  },
  guidesTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  categories: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  guides: {
    marginTop: 16,
  },
  guideCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
  },
  guideInfo: {
    flex: 1,
  },
  guideDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  guideTag: {
    padding: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    marginRight: 8,
  },
  guideTagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  guideIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  scanInfo: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  scanInfoLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  scanInfoItem: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ResourcesScreen;

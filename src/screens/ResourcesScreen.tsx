import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated as RNAnimated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  FadeIn,
  SlideInRight,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

// Import components
import RecyclingMap from '../components/map/RecyclingMap';
import AnimatedCard from '../components/UI/AnimatedCard';
import { useTheme } from '../context/ThemeContext';
import { useHapticFeedback } from '../hooks/useAnimations';

const { width } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Define types for structured data
interface RecyclingLocation {
  id: string;
  name: string;
  distance: string;
  type: 'recycling' | 'store' | 'e-waste' | 'composting';
  coordinate?: {
    latitude: number;
    longitude: number;
  };
}

interface ResourceGuide {
  id: string;
  title: string;
  category: string;
  icon: string;
}

const ResourcesScreen: React.FC = () => {
  const { theme } = useTheme();
  const { triggerSelection } = useHapticFeedback();
  const scrollY = useSharedValue(0);
  
  // Animation values
  const mapHeight = useSharedValue(200);
  const mapExpanded = useSharedValue(false);
  const listOpacity = useSharedValue(1);
  
  // State for active/selected card
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Mock data for locations and guides
  const locations: RecyclingLocation[] = [
    { id: '1', name: 'City Recycling Center', distance: '1.2 mi', type: 'recycling' },
    { id: '2', name: 'Green Earth Disposal', distance: '2.5 mi', type: 'e-waste' },
    { id: '3', name: 'EcoMarket', distance: '0.8 mi', type: 'store' },
    { id: '4', name: 'Electronic Waste Depot', distance: '3.1 mi', type: 'e-waste' },
    { id: '5', name: 'Community Compost Hub', distance: '1.8 mi', type: 'composting' },
  ];

  const guides: ResourceGuide[] = [
    { id: '1', title: 'Plastic Recycling Guide', category: 'Guide', icon: 'document-text' },
    { id: '2', title: 'Composting at Home', category: 'Tutorial', icon: 'leaf' },
    { id: '3', title: 'Reducing Food Waste', category: 'Tips', icon: 'restaurant' },
    { id: '4', title: 'Electronic Waste Disposal', category: 'Guide', icon: 'hardware-chip' },
  ];
  
  // Filter categories from guides data
  const categories = Array.from(new Set(guides.map(guide => guide.category)));

  // Handle map expand/collapse
  const toggleMapExpanded = () => {
    mapExpanded.value = !mapExpanded.value;
    
    // Animate map height and list opacity
    if (mapExpanded.value) {
      mapHeight.value = withSpring(400, { 
        damping: 20,
        stiffness: 90,
      });
      listOpacity.value = withTiming(0.4, { duration: 300 });
    } else {
      mapHeight.value = withSpring(200, { 
        damping: 20,
        stiffness: 90,
      });
      listOpacity.value = withTiming(1, { duration: 300 });
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
    ? guides.filter(guide => guide.category === activeCategory)
    : guides;

  // Create animated scroll handler
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // Map height animation style
  const mapAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: mapHeight.value,
    };
  });
  
  // List content animation style
  const listAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: listOpacity.value,
    };
  });
  
  // Use Reanimated interpolate for header parallax effect
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 100],
      [0, -50],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateY }],
    };
  });

  // Get icon for a location type
  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'recycling': return 'refresh';
      case 'store': return 'basket';
      case 'e-waste': return 'hardware-chip';
      case 'composting': return 'leaf';
      default: return 'location';
    }
  };
  
  // Get color for a location type
  const getLocationColor = (type: string) => {
    switch (type) {
      case 'recycling': return theme.primary;
      case 'store': return theme.info;
      case 'e-waste': return theme.warning;
      case 'composting': return theme.success;
      default: return theme.textSecondary;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundPrimary }]}>
      {/* Use Reanimated Animated.View and the new style */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Resources
        </Text>
      </Animated.View>
      
      {/* Use Reanimated Animated.ScrollView and the new handler */}
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
      >
        {/* Map Section */}
        <Animated.View style={[styles.mapContainer, mapAnimatedStyle]}>
          <RecyclingMap height={mapExpanded.value ? 360 : 200} />
          
          {/* Map expand/collapse button */}
          <TouchableOpacity 
            style={[
              styles.mapToggleButton,
              { backgroundColor: theme.backgroundCard }
            ]}
            onPress={toggleMapExpanded}
          >
            <Ionicons 
              name={mapExpanded.value ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={theme.primary} 
            />
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View style={listAnimatedStyle}>
          {/* Location Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons 
                  name="location" 
                  size={20} 
                  color={theme.primary} 
                  style={styles.sectionIcon} 
                />
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                  Nearby Locations
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.viewAllButton}
                activeOpacity={0.7}
              >
                <Text style={[styles.viewAllText, { color: theme.primary }]}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            
            {locations.map((location, index) => (
              <AnimatedTouchable
                key={location.id}
                entering={SlideInRight.delay(index * 100).springify()}
                style={[
                  styles.locationCard,
                  selectedLocation === location.id && styles.selectedCard,
                  { 
                    backgroundColor: theme.backgroundSecondary,
                    borderColor: selectedLocation === location.id 
                      ? getLocationColor(location.type) 
                      : 'transparent' 
                  }
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
                    { backgroundColor: getLocationColor(location.type) }
                  ]}
                >
                  <Ionicons 
                    name={getLocationIcon(location.type)} 
                    size={18} 
                    color="#FFFFFF" 
                  />
                </View>
                
                <View style={styles.locationInfo}>
                  <Text style={[styles.locationName, { color: theme.textPrimary }]}>
                    {location.name}
                  </Text>
                  <Text style={[styles.locationDistance, { color: theme.textSecondary }]}>
                    {location.distance}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={[
                    styles.directionsButton,
                    { backgroundColor: theme.primary }
                  ]}
                >
                  <Text style={[styles.directionsButtonText, { color: theme.textInverse }]}>
                    Directions
                  </Text>
                </TouchableOpacity>
              </AnimatedTouchable>
            ))}
          </View>
          
          {/* Resource Guides Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons 
                  name="book" 
                  size={20} 
                  color={theme.primary} 
                  style={styles.sectionIcon} 
                />
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                  Helpful Resources
                </Text>
              </View>
            </View>
            
            {/* Category filter */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContainer}
            >
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    activeCategory === category && styles.activeCategoryButton,
                    { 
                      backgroundColor: activeCategory === category 
                        ? theme.primary 
                        : theme.backgroundSecondary 
                    }
                  ]}
                  onPress={() => toggleCategory(category)}
                >
                  <Text 
                    style={[
                      styles.categoryText,
                      { 
                        color: activeCategory === category 
                          ? theme.textInverse 
                          : theme.textPrimary 
                      }
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Guide cards */}
            <Animated.View entering={FadeIn.duration(400)}>
              {filteredGuides.map((guide, index) => (
                <AnimatedCard
                  key={guide.id}
                  style={[
                    styles.guideCard,
                    { backgroundColor: theme.backgroundSecondary }
                  ]}
                  pressable={true}
                  hapticFeedback={true}
                  onPress={() => {}}
                  initialDelay={index * 100}
                >
                  <View>
                    <Text style={[styles.guideTitle, { color: theme.textPrimary }]}>
                      {guide.title}
                    </Text>
                    <Text style={[styles.guideCategory, { color: theme.textSecondary }]}>
                      {guide.category}
                    </Text>
                  </View>
                  <View 
                    style={[
                      styles.guideIconContainer,
                      { backgroundColor: theme.primaryLight }
                    ]}
                  >
                    <Ionicons name={guide.icon} size={20} color={theme.primary} />
                  </View>
                </AnimatedCard>
              ))}
            </Animated.View>
          </View>
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  scrollContent: {
    paddingTop: 60, // Space for fixed header
    paddingBottom: 30,
  },
  // Map styles
  mapContainer: {
    width: '100%',
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mapToggleButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // Section styles
  sectionContainer: {
    marginBottom: 30,
    paddingHorizontal: 20,
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
  viewAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Location card styles
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedCard: {
    borderWidth: 2,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationDistance: {
    fontSize: 14,
  },
  directionsButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  directionsButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Category filter
  categoryContainer: {
    paddingBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  activeCategoryButton: {
    
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Guide card styles
  guideCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  guideCategory: {
    fontSize: 14,
  },
  guideIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ResourcesScreen;
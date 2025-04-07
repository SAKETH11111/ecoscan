import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Region,
  MapMarker,
} from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

// Custom map style for light theme
const lightMapStyle = [
  {
    elementType: "geometry",
    stylers: [
      {
        color: "#f5f5f5",
      },
    ],
  },
  {
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#616161",
      },
    ],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#f5f5f5",
      },
    ],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#bdbdbd",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [
      {
        color: "#eeeeee",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        color: "#e5e5e5",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      {
        color: "#ffffff",
      },
    ],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#dadada",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#616161",
      },
    ],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [
      {
        color: "#e5e5e5",
      },
    ],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [
      {
        color: "#eeeeee",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#c9c9c9",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
];

// Custom map style for dark theme
const darkMapStyle = [
  {
    elementType: "geometry",
    stylers: [
      {
        color: "#212121",
      },
    ],
  },
  {
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#212121",
      },
    ],
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "administrative.country",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
  {
    featureType: "administrative.land_parcel",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#bdbdbd",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        color: "#181818",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#616161",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#1b1b1b",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#2c2c2c",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#8a8a8a",
      },
    ],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [
      {
        color: "#373737",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#3c3c3c",
      },
    ],
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry",
    stylers: [
      {
        color: "#4e4e4e",
      },
    ],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#616161",
      },
    ],
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#000000",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#3d3d3d",
      },
    ],
  },
];

// Define types
interface RecyclingLocation {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title: string;
  description: string;
  type: "recycling" | "store" | "e-waste" | "composting";
  distance?: number; // Distance from user in meters
  address?: string; // Location address
}

interface RecyclingMapProps {
  onLocationPress?: (location: RecyclingLocation) => void;
  height?: number;
  initialRegion?: Region;
  showUserLocation?: boolean;
  apiKey?: string; // Google Places API key
  searchRadius?: number; // Search radius in meters
}

const RecyclingMap: React.FC<RecyclingMapProps> = ({
  onLocationPress,
  height = 200,
  initialRegion,
  showUserLocation = true,
  apiKey = "", // You'll need to provide a Google Places API key
  searchRadius = 5000, // Default 5km radius
}) => {
  const { theme } = useTheme();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Pulse animation for the user location
  const pulseAnim = useSharedValue(0);
  const mapRef = useRef<MapView>(null);
  const markerRefs = useRef<{ [key: string]: MapMarker | null }>({});

  // State for recycling locations
  const [recyclingLocations, setRecyclingLocations] = useState<
    RecyclingLocation[]
  >([
    {
      id: "1",
      coordinate: { latitude: 37.78925, longitude: -122.4344 },
      title: "City Recycling Center",
      description: "Full-service recycling facility",
      type: "recycling",
    },
    {
      id: "2",
      coordinate: { latitude: 37.78525, longitude: -122.4304 },
      title: "Green Earth Disposal",
      description: "Specialized in electronics recycling",
      type: "e-waste",
    },
    {
      id: "3",
      coordinate: { latitude: 37.78625, longitude: -122.4254 },
      title: "EcoMarket",
      description: "Eco-friendly products and recycling drop-off",
      type: "store",
    },
    {
      id: "4",
      coordinate: { latitude: 37.79025, longitude: -122.4374 },
      title: "Electronic Waste Depot",
      description: "E-waste collection and processing",
      type: "e-waste",
    },
    {
      id: "5",
      coordinate: { latitude: 37.77925, longitude: -122.4294 },
      title: "Community Compost Center",
      description: "Drop off organic waste for composting",
      type: "composting",
    },
  ]);

  // Active filter for location types
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Define animated style for pulse effect
  const pulseAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - pulseAnim.value,
      transform: [
        {
          scale: 1 + pulseAnim.value,
        },
      ],
    };
  });

  // Set up pulse animation
  useEffect(() => {
    startPulseAnimation();
  }, []);

  // Start pulse animation using Reanimated
  const startPulseAnimation = () => {
    pulseAnim.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1, // infinite repetitions
      true // reverse
    );
  };

  // Get user location
  useEffect(() => {
    if (initialRegion) {
      setRegion(initialRegion);
      return;
    }

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});

        // Update region centered on user location
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0122,
          longitudeDelta: 0.0121,
        };

        setRegion(newRegion);

        // Store user location
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        // Update recycling locations to be relative to the user
        updateRecyclingLocationsNearUser(
          location.coords.latitude,
          location.coords.longitude
        );
      } catch (error) {
        console.error("Error getting location:", error);
        setErrorMsg("Could not determine your location");
      }
    })();
  }, [initialRegion]);

  // Update recycling locations near the user
  const updateRecyclingLocationsNearUser = (
    latitude: number,
    longitude: number
  ) => {
    // If API key is provided, try to fetch real recycling centers
    if (apiKey) {
      fetchNearbyRecyclingCenters(latitude, longitude);
      return;
    }

    // Otherwise use mock data
    // Define different types of recycling centers
    const types = ["recycling", "e-waste", "store", "composting"];
    const names = {
      recycling: [
        "City Recycling Center",
        "Green Recycling Facility",
        "EcoWaste Management",
        "Community Recycling Depot",
      ],
      "e-waste": [
        "Electronics Recycling Center",
        "E-Waste Disposal",
        "Computer Recycling Facility",
        "Tech Waste Solutions",
      ],
      store: [
        "EcoStore",
        "Green Market",
        "Sustainable Goods Shop",
        "Zero Waste Store",
      ],
      composting: [
        "Community Compost Center",
        "Organic Waste Facility",
        "Garden Composting Station",
        "Green Waste Drop-off",
      ],
    };

    // Create a random number of locations (5-10)
    const numLocations = 5 + Math.floor(Math.random() * 6);
    const newLocations: RecyclingLocation[] = [];

    for (let i = 0; i < numLocations; i++) {
      // Random offset from user location (0.5-3km)
      const distance = 500 + Math.random() * 2500;
      const angle = Math.random() * 2 * Math.PI;

      // Convert distance and angle to lat/lng offset
      // This is an approximation that works for small distances
      const latOffset = (distance / 111111) * Math.cos(angle);
      const lngOffset =
        (distance / (111111 * Math.cos((latitude * Math.PI) / 180))) *
        Math.sin(angle);

      const locType = types[Math.floor(Math.random() * types.length)] as
        | "recycling"
        | "store"
        | "e-waste"
        | "composting";
      const nameOptions = names[locType];
      const name = nameOptions[Math.floor(Math.random() * nameOptions.length)];

      const newLocation: RecyclingLocation = {
        id: `loc-${i + 1}`,
        coordinate: {
          latitude: latitude + latOffset,
          longitude: longitude + lngOffset,
        },
        title: name,
        description: `${
          locType.charAt(0).toUpperCase() + locType.slice(1)
        } facility near you`,
        type: locType,
        distance: distance,
      };

      newLocations.push(newLocation);
    }

    // Sort by distance
    newLocations.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    setRecyclingLocations(newLocations);
  };

  // Fetch recycling centers from Google Places API
  const fetchNearbyRecyclingCenters = async (
    latitude: number,
    longitude: number
  ) => {
    setLoading(true);

    try {
      const recyclingKeywords = [
        "recycling center",
        "recycling facility",
        "waste management",
        "electronic waste",
      ];
      let allLocations: RecyclingLocation[] = [];

      for (const keyword of recyclingKeywords) {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${searchRadius}&keyword=${encodeURIComponent(
          keyword
        )}&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK" && data.results) {
          const locations = data.results.map((place: any) => {
            // Determine location type based on place types or name
            let locationType: "recycling" | "store" | "e-waste" | "composting" =
              "recycling";

            if (
              place.types.includes("electronics_store") ||
              place.name.toLowerCase().includes("electronic") ||
              place.name.toLowerCase().includes("e-waste")
            ) {
              locationType = "e-waste";
            } else if (
              place.types.includes("store") ||
              place.name.toLowerCase().includes("shop") ||
              place.name.toLowerCase().includes("market")
            ) {
              locationType = "store";
            } else if (
              place.name.toLowerCase().includes("compost") ||
              place.name.toLowerCase().includes("organic")
            ) {
              locationType = "composting";
            }

            // Calculate distance (simplified for now - could use the Haversine formula for accuracy)
            const distance = calculateDistance(
              latitude,
              longitude,
              place.geometry.location.lat,
              place.geometry.location.lng
            );

            return {
              id: place.place_id,
              coordinate: {
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
              },
              title: place.name,
              description: place.vicinity || "Recycling location",
              address: place.vicinity,
              type: locationType,
              distance: distance,
            };
          });

          allLocations = [...allLocations, ...locations];
        }
      }

      // Remove duplicates (same place_id)
      const uniqueLocations = allLocations.filter(
        (location, index, self) =>
          index === self.findIndex((l) => l.id === location.id)
      );

      // Sort by distance
      uniqueLocations.sort((a, b) => (a.distance || 0) - (b.distance || 0));

      setRecyclingLocations(uniqueLocations);
    } catch (error) {
      console.error("Error fetching recycling centers:", error);
      // Fall back to mock data by calling updateRecyclingLocationsNearUser again but with empty apiKey
      const currentApiKey = apiKey;
      apiKey = "";
      updateRecyclingLocationsNearUser(latitude, longitude);
      apiKey = currentApiKey;
    } finally {
      setLoading(false);
    }
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // in meters

    return distance;
  };

  // Generate mock data if API key is not provided
  const generateMockData = (latitude: number, longitude: number) => {
    const mockLocations: RecyclingLocation[] = [
      {
        id: "1",
        coordinate: {
          latitude: latitude + (Math.random() - 0.5) * 0.02,
          longitude: longitude + (Math.random() - 0.5) * 0.02,
        },
        title: "City Recycling Center",
        description: "Full-service recycling facility",
        type: "recycling",
      },
      {
        id: "2",
        coordinate: {
          latitude: latitude + (Math.random() - 0.5) * 0.02,
          longitude: longitude + (Math.random() - 0.5) * 0.02,
        },
        title: "Green Earth Disposal",
        description: "Specialized in electronics recycling",
        type: "e-waste",
      },
      {
        id: "3",
        coordinate: {
          latitude: latitude + (Math.random() - 0.5) * 0.02,
          longitude: longitude + (Math.random() - 0.5) * 0.02,
        },
        title: "EcoMarket",
        description: "Eco-friendly products and recycling drop-off",
        type: "store",
      },
      {
        id: "4",
        coordinate: {
          latitude: latitude + (Math.random() - 0.5) * 0.02,
          longitude: longitude + (Math.random() - 0.5) * 0.02,
        },
        title: "Electronic Waste Depot",
        description: "E-waste collection and processing",
        type: "e-waste",
      },
      {
        id: "5",
        coordinate: {
          latitude: latitude + (Math.random() - 0.5) * 0.02,
          longitude: longitude + (Math.random() - 0.5) * 0.02,
        },
        title: "Community Compost Center",
        description: "Drop off organic waste for composting",
        type: "composting",
      },
    ];

    // Add distance to each location
    mockLocations.forEach((location) => {
      location.distance = calculateDistance(
        latitude,
        longitude,
        location.coordinate.latitude,
        location.coordinate.longitude
      );
    });

    // Sort by distance
    mockLocations.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    setRecyclingLocations(mockLocations);
  };

  // Get marker color based on location type
  const getMarkerColor = (type: string) => {
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

  // Get marker icon based on location type
  const getMarkerIcon = (type: string) => {
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

  // Handle marker press
  const handleMarkerPress = (location: RecyclingLocation) => {
    if (onLocationPress) {
      onLocationPress(location);
    }
  };

  // Center map on user location
  const centerOnUserLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0122,
            longitudeDelta: 0.0121,
          },
          500
        );
      }

      // Refresh nearby locations
      updateRecyclingLocationsNearUser(
        location.coords.latitude,
        location.coords.longitude
      );
    } catch (error) {
      console.error("Error centering on user location:", error);
    }
  };

  // Handle marker press with camera animation
  const animateToMarker = (markerId: string) => {
    const marker = markerRefs.current[markerId];
    if (marker && mapRef.current) {
      marker.showCallout();
      marker.redraw();

      // Find the location data for this marker
      const location = recyclingLocations.find((loc) => loc.id === markerId);
      if (location) {
        mapRef.current.animateToRegion(
          {
            latitude: location.coordinate.latitude,
            longitude: location.coordinate.longitude,
            latitudeDelta: 0.0122,
            longitudeDelta: 0.0121,
          },
          500
        );
      }
    }
  };

  // Filter locations by type
  const filterLocationsByType = (type: string) => {
    setActiveFilter(type === activeFilter ? null : type);
  };

  // Get filtered locations
  const filteredLocations = activeFilter
    ? recyclingLocations.filter((loc) => loc.type === activeFilter)
    : recyclingLocations;

  // Error state UI
  if (errorMsg) {
    return (
      <View
        style={[
          styles.container,
          { height, backgroundColor: theme.backgroundSecondary },
        ]}
      >
        <View style={styles.errorContainer}>
          <Ionicons
            name="warning"
            size={24}
            color={theme.warning}
            style={{ marginBottom: 12 }}
          />
          <Text style={[styles.errorText, { color: theme.textSecondary }]}>
            {errorMsg}
          </Text>
        </View>
      </View>
    );
  }

  // Loading state UI
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { height, backgroundColor: theme.backgroundSecondary },
        ]}
      >
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text
            style={[
              styles.loadingText,
              { color: theme.textSecondary, marginTop: 10 },
            ]}
          >
            Finding recycling centers near you...
          </Text>
        </View>
      </View>
    );
  }

  // Map UI
  return (
    <View style={[styles.container, { height }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        customMapStyle={theme.isDark ? darkMapStyle : lightMapStyle}
        onRegionChangeComplete={setRegion}
      >
        {filteredLocations.map((location) => (
          <Marker
            key={location.id}
            ref={(ref) => (markerRefs.current[location.id] = ref)}
            coordinate={location.coordinate}
            title={location.title}
            description={location.description}
            onPress={() => handleMarkerPress(location)}
          >
            <View
              style={[
                styles.customMarker,
                { backgroundColor: getMarkerColor(location.type) },
              ]}
            >
              <Ionicons
                name={getMarkerIcon(location.type)}
                size={14}
                color="#FFFFFF"
              />
            </View>
          </Marker>
        ))}

        {/* User location with pulse effect */}
        {userLocation && !showUserLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
          >
            <View>
              <Animated.View
                style={[styles.userLocationPulse, pulseAnimatedStyle]}
              />
              <View style={styles.userLocationDot} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Floating UI controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            { backgroundColor: theme.backgroundCard },
          ]}
          onPress={centerOnUserLocation}
        >
          <Ionicons name="locate" size={20} color={theme.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            { backgroundColor: theme.backgroundCard, marginTop: 10 },
          ]}
          onPress={() => {
            if (userLocation) {
              updateRecyclingLocationsNearUser(
                userLocation.latitude,
                userLocation.longitude
              );
            }
          }}
        >
          <Ionicons name="refresh" size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter buttons for location types */}
      <View style={styles.filters}>
        {["recycling", "e-waste", "store", "composting"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  activeFilter === type
                    ? getMarkerColor(type)
                    : `${getMarkerColor(type)}80`, // 50% opacity
              },
            ]}
            onPress={() => filterLocationsByType(type)}
          >
            <Ionicons name={getMarkerIcon(type)} size={16} color="#FFFFFF" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Location count indicator */}
      <View
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          backgroundColor: theme.backgroundCard,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Text style={{ color: theme.textPrimary, fontSize: 12 }}>
          {filteredLocations.length} locations{" "}
          {activeFilter ? `(${activeFilter})` : ""}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
  loadingText: {
    fontSize: 14,
    textAlign: "center",
  },
  customMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4285F4",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userLocationPulse: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(66, 133, 244, 0.3)",
  },
  controls: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  filters: {
    position: "absolute",
    bottom: 10,
    left: 10,
    flexDirection: "row",
  },
  filterButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationsCount: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default RecyclingMap;

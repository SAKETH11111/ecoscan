import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, MapMarker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

// Custom map style for light theme
const lightMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dadada"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#c9c9c9"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  }
];

// Custom map style for dark theme
const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
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
  type: 'recycling' | 'store' | 'e-waste' | 'composting';
}

interface RecyclingMapProps {
  onLocationPress?: (location: RecyclingLocation) => void;
  height?: number;
  initialRegion?: Region;
  showUserLocation?: boolean;
}

const RecyclingMap: React.FC<RecyclingMapProps> = ({
  onLocationPress,
  height = 200,
  initialRegion,
  showUserLocation = true,
}) => {
  const { theme } = useTheme();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  // Pulse animation for the user location
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);
  const markerRefs = useRef<{ [key: string]: MapMarker | null }>({});
  
  // Mock data for recycling locations
  const [recyclingLocations, setRecyclingLocations] = useState<RecyclingLocation[]>([
    { 
      id: '1',
      coordinate: { latitude: 37.78925, longitude: -122.4344 },
      title: 'City Recycling Center',
      description: 'Full-service recycling facility',
      type: 'recycling'
    },
    { 
      id: '2',
      coordinate: { latitude: 37.78525, longitude: -122.4304 },
      title: 'Green Earth Disposal',
      description: 'Specialized in electronics recycling',
      type: 'e-waste'
    },
    { 
      id: '3',
      coordinate: { latitude: 37.78625, longitude: -122.4254 },
      title: 'EcoMarket',
      description: 'Eco-friendly products and recycling drop-off',
      type: 'store'
    },
    { 
      id: '4',
      coordinate: { latitude: 37.79025, longitude: -122.4374 },
      title: 'Electronic Waste Depot',
      description: 'E-waste collection and processing',
      type: 'e-waste'
    },
    { 
      id: '5',
      coordinate: { latitude: 37.77925, longitude: -122.4294 },
      title: 'Community Compost Center',
      description: 'Drop off organic waste for composting',
      type: 'composting'
    },
  ]);

  // Set up pulse animation
  useEffect(() => {
    startPulseAnimation();
  }, []);

  // Start pulse animation
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Get user location
  useEffect(() => {
    if (initialRegion) {
      setRegion(initialRegion);
      return;
    }
    
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
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
        
        // Update mock data locations to be relative to the user
        const updatedLocations = recyclingLocations.map((loc, index) => {
          const offsetLat = (Math.random() - 0.5) * 0.02;
          const offsetLng = (Math.random() - 0.5) * 0.02;
          
          return {
            ...loc,
            coordinate: {
              latitude: location.coords.latitude + offsetLat,
              longitude: location.coords.longitude + offsetLng,
            }
          };
        });
        
        setRecyclingLocations(updatedLocations);
        
      } catch (error) {
        console.error('Error getting location:', error);
        setErrorMsg('Could not determine your location');
      }
    })();
  }, [initialRegion]);

  // Get marker color based on location type
  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'recycling':
        return theme.primary;
      case 'store':
        return theme.info;
      case 'e-waste':
        return theme.warning;
      case 'composting':
        return theme.success;
      default:
        return theme.textSecondary;
    }
  };
  
  // Get marker icon based on location type
  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'recycling':
        return 'refresh';
      case 'store':
        return 'basket';
      case 'e-waste':
        return 'hardware-chip';
      case 'composting':
        return 'leaf';
      default:
        return 'location';
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
      
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0122,
          longitudeDelta: 0.0121,
        }, 500);
      }
    } catch (error) {
      console.error('Error centering on user location:', error);
    }
  };
  
  // Handle marker press with camera animation
  const animateToMarker = (markerId: string) => {
    const marker = markerRefs.current[markerId];
    if (marker && mapRef.current) {
      marker.showCallout();
      marker.redraw();
      
      // Find the location data for this marker
      const location = recyclingLocations.find(loc => loc.id === markerId);
      if (location) {
        mapRef.current.animateToRegion({
          latitude: location.coordinate.latitude,
          longitude: location.coordinate.longitude,
          latitudeDelta: 0.0122,
          longitudeDelta: 0.0121,
        }, 500);
      }
    }
  };

  // Error state UI
  if (errorMsg) {
    return (
      <View 
        style={[
          styles.container, 
          { height, backgroundColor: theme.backgroundSecondary }
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
        {recyclingLocations.map(location => (
          <Marker
            key={location.id}
            ref={ref => markerRefs.current[location.id] = ref}
            coordinate={location.coordinate}
            title={location.title}
            description={location.description}
            onPress={() => handleMarkerPress(location)}
          >
            <View style={[
              styles.customMarker,
              { backgroundColor: getMarkerColor(location.type) }
            ]}>
              <Ionicons 
                name={getMarkerIcon(location.type)} 
                size={14} 
                color="#FFFFFF" 
              />
            </View>
          </Marker>
        ))}
      </MapView>
      
      {/* Floating UI controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[
            styles.controlButton, 
            { backgroundColor: theme.backgroundCard }
          ]}
          onPress={centerOnUserLocation}
        >
          <Ionicons 
            name="locate" 
            size={20} 
            color={theme.primary} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Filter buttons for location types */}
      <View style={styles.filters}>
        {['recycling', 'e-waste', 'store', 'composting'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              { backgroundColor: getMarkerColor(type) }
            ]}
            onPress={() => {
              // Find a location of this type and animate to it
              const location = recyclingLocations.find(loc => loc.type === type);
              if (location) {
                animateToMarker(location.id);
              }
            }}
          >
            <Ionicons 
              name={getMarkerIcon(type)} 
              size={16} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  customMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
  userLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4285F4',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userLocationPulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(66, 133, 244, 0.3)',
  },
  controls: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  filters: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
  },
  filterButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: '#000',
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
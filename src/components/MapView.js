import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

const RecyclingMap = () => {
  const [errorMsg, setErrorMsg] = useState(null);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  const [recyclingLocations, setRecyclingLocations] = useState([
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
      type: 'recycling'
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
  ]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.error('Error getting location:', error);
        setErrorMsg('Could not determine your location');
      }
    })();
  }, []);

  const getMarkerColor = (type) => {
    switch (type) {
      case 'recycling':
        return '#4CAF50'; // green
      case 'store':
        return '#2196F3'; // blue
      case 'e-waste':
        return '#FF9800'; // orange
      default:
        return '#757575'; // grey
    }
  };

  return (
    <View style={styles.container}>
      {errorMsg ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : (
        <MapView
          style={styles.map}
          region={region}
          provider={PROVIDER_GOOGLE}
        >
          {recyclingLocations.map(location => (
            <Marker
              key={location.id}
              coordinate={location.coordinate}
              title={location.title}
              description={location.description}
              pinColor={getMarkerColor(location.type)}
            />
          ))}
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 12,
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
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default RecyclingMap;
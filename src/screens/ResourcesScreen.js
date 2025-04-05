import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RecyclingMap from '../components/MapView';

const ResourcesScreen = () => {
  // Mock data for demonstration
  const locations = [
    { id: '1', name: 'City Recycling Center', distance: '1.2 mi', type: 'recycling' },
    { id: '2', name: 'Green Earth Disposal', distance: '2.5 mi', type: 'recycling' },
    { id: '3', name: 'EcoMarket', distance: '0.8 mi', type: 'store' },
    { id: '4', name: 'Electronic Waste Depot', distance: '3.1 mi', type: 'e-waste' },
  ];

  const guides = [
    { id: '1', title: 'Plastic Recycling Guide', category: 'Guide' },
    { id: '2', title: 'Composting at Home', category: 'Tutorial' },
    { id: '3', title: 'Reducing Food Waste', category: 'Tips' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Resources</Text>
        
        <RecyclingMap />
        
        <Text style={styles.sectionTitle}>Nearby Locations</Text>
        {locations.map(location => (
          <TouchableOpacity key={location.id} style={styles.locationCard}>
            <View style={styles.locationIconPlaceholder} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>{location.name}</Text>
              <Text style={styles.locationDistance}>{location.distance}</Text>
            </View>
            <TouchableOpacity style={styles.directionsButton}>
              <Text style={styles.directionsButtonText}>Directions</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        
        <Text style={styles.sectionTitle}>Helpful Resources</Text>
        {guides.map(guide => (
          <TouchableOpacity key={guide.id} style={styles.guideCard}>
            <View>
              <Text style={styles.guideTitle}>{guide.title}</Text>
              <Text style={styles.guideCategory}>{guide.category}</Text>
            </View>
            <View style={styles.guideIconPlaceholder} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1E1E1E',
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#666666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#1E1E1E',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  locationIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1E1E',
    marginBottom: 4,
  },
  locationDistance: {
    fontSize: 14,
    color: '#666666',
  },
  directionsButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  directionsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  guideCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1E1E',
    marginBottom: 4,
  },
  guideCategory: {
    fontSize: 14,
    color: '#666666',
  },
  guideIconPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E0E0',
  },
});

export default ResourcesScreen;
import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAppContext } from '../context/AppContext';

const ImpactScreen = () => {
  const { userData, goalProgress, isLoading } = useAppContext();
  
  if (isLoading || !userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyItemLeft}>
        <View style={[styles.recyclableIndicator, { backgroundColor: item.recyclable ? '#4CAF50' : '#F44336' }]} />
        <Text style={styles.historyItemName}>{item.itemName}</Text>
      </View>
      <View style={styles.historyItemRight}>
        <Text style={styles.historyItemDate}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Your Impact</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userData.itemsRecycled}</Text>
            <Text style={styles.statLabel}>Items Recycled</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userData.co2Saved} kg</Text>
            <Text style={styles.statLabel}>CO₂ Saved</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userData.waterSaved} L</Text>
            <Text style={styles.statLabel}>Water Saved</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Monthly Goal</Text>
            <Text style={styles.sectionSubtitle}>{userData.itemsRecycled} of {userData.monthlyGoal} items</Text>
          </View>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${goalProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(goalProgress)}% Complete</Text>
        </View>
        
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <FlatList
            data={userData.scannedItems}
            renderItem={renderHistoryItem}
            keyExtractor={(item, index) => `${item.itemName}-${index}`}
            scrollEnabled={false}
            style={styles.historyList}
          />
        </View>
        
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Eco Tips</Text>
          <View style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <Ionicons name="leaf" size={24} color="#4CAF50" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Reduce Single-Use Plastics</Text>
              <Text style={styles.tipText}>
                Carry a reusable water bottle and shopping bags to minimize waste.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 30,
    color: '#1E1E1E',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  statCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '30%',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E1E1E',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
  },
  historySection: {
    marginBottom: 30,
  },
  historyList: {
    marginTop: 15,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
    color: '#1E1E1E',
  },
  historyItemRight: {},
  historyItemDate: {
    fontSize: 14,
    color: '#666666',
  },
  tipsSection: {
    marginBottom: 30,
  },
  tipCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    flexDirection: 'row',
  },
  tipIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1E1E',
    marginBottom: 5,
  },
  tipText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});

export default ImpactScreen;
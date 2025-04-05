import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const ScanResultCard = ({ result, onClose }) => {
  if (!result) return null;

  const getStatusColor = () => {
    return result.recyclable ? '#4CAF50' : '#F44336';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.itemName}>{result.itemName}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.statusContainer, { backgroundColor: getStatusColor() }]}>
        <Text style={styles.statusText}>
          {result.recyclable ? 'Recyclable' : 'Not Recyclable'}
        </Text>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Category:</Text>
          <Text style={styles.detailValue}>{result.category}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Recycling Code:</Text>
          <Text style={styles.detailValue}>{result.recyclingCode}</Text>
        </View>
        
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsLabel}>Instructions:</Text>
          <Text style={styles.instructionsText}>{result.instructions}</Text>
        </View>
        
        {result.recyclable && (
          <View style={styles.impactContainer}>
            <Text style={styles.impactLabel}>Environmental Impact:</Text>
            <View style={styles.impactDetails}>
              <View style={styles.impactItem}>
                <Text style={styles.impactValue}>{result.impact.co2Saved}</Text>
                <Text style={styles.impactMetric}>CO₂ Saved</Text>
              </View>
              <View style={styles.impactItem}>
                <Text style={styles.impactValue}>{result.impact.waterSaved}</Text>
                <Text style={styles.impactMetric}>Water Saved</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1E1E',
  },
  closeButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666666',
  },
  statusContainer: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  detailsContainer: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailLabel: {
    width: 120,
    fontSize: 14,
    color: '#666666',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1E1E1E',
  },
  instructionsContainer: {
    marginTop: 10,
    marginBottom: 16,
  },
  instructionsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E1E1E',
    marginBottom: 6,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
  },
  impactContainer: {
    marginTop: 6,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  impactLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E1E1E',
    marginBottom: 10,
  },
  impactDetails: {
    flexDirection: 'row',
  },
  impactItem: {
    marginRight: 30,
  },
  impactValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 4,
  },
  impactMetric: {
    fontSize: 12,
    color: '#666666',
  },
});

export default ScanResultCard;
import React from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';

interface TestImageProps {
  uri: string;
}

const TestImage: React.FC<TestImageProps> = ({ uri }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Image</Text>
      <Text style={styles.uri}>{uri}</Text>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  uri: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  }
});

export default TestImage; 
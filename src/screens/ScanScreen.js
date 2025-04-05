import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { analyzeImage } from '../api/geminiService';
import { useAppContext } from '../context/AppContext';
import ScanResultCard from '../components/ScanResultCard';

const ScanScreen = () => {
  const { addRecycledItem } = useAppContext();
  
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraMode, setCameraMode] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleStartScan = () => {
    if (hasPermission === null) {
      Alert.alert(
        'Camera Permission',
        'We need camera access to scan recycling items',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (hasPermission === false) {
      Alert.alert(
        'Camera Permission Denied',
        'Please enable camera access in your device settings to use the scan feature',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setCameraMode(true);
    setScanResult(null);
    setPreviewImage(null);
  };

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        setPreviewImage(photo.uri);
        setCameraMode(false);
        processScan(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Could not capture image. Please try again.');
      }
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPreviewImage(result.assets[0].uri);
        setCameraMode(false);
        processScan(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Could not select image. Please try again.');
    }
  };

  const processScan = async (imageUri) => {
    setScanning(true);
    try {
      const result = await analyzeImage(imageUri);
      // Update the user's data with the scanned item
      if (result.recyclable) {
        addRecycledItem(result);
      }
      setScanResult(result);
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', 'Could not analyze image. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const handleCloseScan = () => {
    setScanResult(null);
    setPreviewImage(null);
  };

  const handleCancelCamera = () => {
    setCameraMode(false);
  };

  if (cameraMode) {
    return (
      <View style={styles.cameraContainer}>
        <Camera 
          style={styles.camera} 
          ref={cameraRef}
          type={Camera.Constants.Type.back}
        >
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.cameraButton} onPress={handleCapture}>
              <View style={styles.cameraButtonInner} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelCamera}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Scan</Text>
        
        {!previewImage && !scanResult && (
          <>
            <TouchableOpacity style={styles.scanButton} onPress={handleStartScan}>
              <Ionicons name="camera" size={48} color="#FFFFFF" />
              <Text style={styles.scanButtonText}>Tap to Scan</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.galleryButton} onPress={handleSelectFromGallery}>
              <Text style={styles.galleryButtonText}>Select from Gallery</Text>
            </TouchableOpacity>
            
            <Text style={styles.instruction}>Point your camera at any item to identify how to recycle it</Text>
          </>
        )}
        
        {previewImage && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: previewImage }} style={styles.previewImage} />
            
            {scanning && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Analyzing item...</Text>
              </View>
            )}
          </View>
        )}
        
        {scanResult && (
          <ScanResultCard result={scanResult} onClose={handleCloseScan} />
        )}
        
        {(previewImage || scanResult) && (
          <TouchableOpacity style={styles.newScanButton} onPress={handleStartScan}>
            <Text style={styles.newScanButtonText}>Scan New Item</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 40,
    color: '#1E1E1E',
    alignSelf: 'flex-start',
  },
  scanButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  galleryButton: {
    paddingVertical: 12,
    marginBottom: 30,
  },
  galleryButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '500',
  },
  instruction: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    maxWidth: '80%',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  cameraButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cameraButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    padding: 10,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
  },
  newScanButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 20,
  },
  newScanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ScanScreen;
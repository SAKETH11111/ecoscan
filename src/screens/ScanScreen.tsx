import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import * as Camera from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

// Import components & hooks
import ScanButton from '../components/ScanButton';
import ScanResultCard from '../components/ScanResultCard';
import AnimatedButton from '../components/UI/AnimatedButton';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { useFadeInAnimation, useHapticFeedback } from '../hooks/useAnimations';

// Import services
import { analyzeImage } from '../api/geminiService';

// Animated components
const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

interface ScanResult {
  itemName: string;
  recyclable: boolean;
  category: string;
  recyclingCode: string;
  instructions: string;
  impact: {
    co2Saved: string;
    waterSaved: string;
  };
}

const ScanScreen: React.FC = () => {
  // Context & hooks
  const { theme } = useTheme();
  const { addRecycledItem } = useAppContext();
  const { triggerImpact, triggerNotification } = useHapticFeedback();
  const { fadeAnim, fadeIn, fadeOut } = useFadeInAnimation(300, 1);
  
  // Use the permissions hook
  const [permission, requestPermission] = Camera.useCameraPermissions();
  
  // Camera states
  const [cameraMode, setCameraMode] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);
  
  // Animation values
  const cameraOpacity = useSharedValue(0);
  const scanButtonScale = useSharedValue(1);
  const cameraGuideScale = useSharedValue(0.9);
  const scanningAnimation = useSharedValue(0);
  
  // Start scanning frame animation
  const startScanningAnimation = () => {
    scanningAnimation.value = 0;
    scanningAnimation.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
  };
  
  // Stop scanning frame animation
  const stopScanningAnimation = () => {
    scanningAnimation.value = withTiming(0, { duration: 300 });
  };

  // Handle starting the scan process
  const handleStartScan = async () => {
    if (!permission) {
      return;
    }
    let finalStatus = permission.status;
    if (!permission.granted) {
      const { status } = await requestPermission();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera access in settings to use this feature.',
        [{ text: 'OK' }]
      );
      return;
    }
    // Trigger haptic feedback
    triggerImpact('medium');
    
    // Animate scan button before camera opens
    scanButtonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1.1, { duration: 200 }),
      withTiming(0, { duration: 200 }),
    );
    
    // Fade out content then switch to camera
    fadeOut(() => {
      // Reset any previous scan
      setScanResult(null);
      setPreviewImage(null);
      setCameraMode(true);
      
      // Fade in camera
      cameraOpacity.value = withTiming(1, { duration: 300 });
      
      // Animate camera guide
      cameraGuideScale.value = withSequence(
        withTiming(0.9, { duration: 0 }),
        withDelay(300, withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }))
      );
      
      // Start scanning animation frame
      startScanningAnimation();
    });
  };

  // Capture photo from camera
  const handleCapture = async () => {
    if (!cameraRef.current) return;
    
    try {
      // Trigger haptic feedback
      triggerImpact('heavy');
      
      // Take picture
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      
      // Stop animations
      stopScanningAnimation();
      
      // Update state & process scan
      setPreviewImage(photo.uri);
      fadeIn();
      
      // Exit camera mode
      cameraOpacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      }, () => {
        runOnJS(setCameraMode)(false);
      });
      
      // Process the image
      processScan(photo.uri);
      
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Could not capture image. Please try again.');
      
      // Exit camera mode on error
      setCameraMode(false);
      fadeIn();
    }
  };

  // Select image from gallery
  const handleSelectFromGallery = async () => {
    try {
      // Trigger haptic feedback
      triggerImpact('light');
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPreviewImage(result.assets[0].uri);
        fadeIn();
        setCameraMode(false);
        processScan(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Could not select image. Please try again.');
    }
  };

  // Process scan and analyze image
  const processScan = async (imageUri: string) => {
    setScanning(true);
    try {
      // Analyze image
      const result = await analyzeImage(imageUri);
      
      // Update user data if recyclable
      if (result.recyclable) {
        addRecycledItem(result);
      }
      
      // Update state with result
      setScanResult(result);
      
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', 'Could not analyze image. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  // Handle closing scan result
  const handleCloseScan = () => {
    setScanResult(null);
    setPreviewImage(null);
  };

  // Handle canceling camera mode
  const handleCancelCamera = () => {
    // Stop scanning animation
    stopScanningAnimation();
    
    // Fade out camera and switch back
    cameraOpacity.value = withTiming(0, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    }, () => {
      runOnJS(setCameraMode)(false);
      runOnJS(fadeIn)();
    });
  };

  // Camera guide animation
  const cameraGuideAnimStyle = useAnimatedStyle(() => {
    // Compute primitive values for transform
    const scale = cameraGuideScale.value;
    const opacity = cameraGuideScale.value;
    
    return {
      transform: [{ scale }],
      opacity,
    };
  });
  
  // Scanning overlay animation
  const scanningAnimStyle = useAnimatedStyle(() => {
    // Compute primitive values for transform
    const opacity = 0.7 - (scanningAnimation.value * 0.5);
    const scaleX = 1 + (scanningAnimation.value * 0.1);
    const scaleY = 1 + (scanningAnimation.value * 0.1);
    
    return {
      opacity,
      transform: [
        { scaleX },
        { scaleY }
      ],
    };
  });
  
  // Scan button animation
  const scanButtonAnimStyle = useAnimatedStyle(() => {
    // Compute primitive value for transform
    const scale = scanButtonScale.value;
    
    return {
      transform: [{ scale }],
    };
  });
  
  // Camera container animation
  const cameraContainerStyle = useAnimatedStyle(() => {
    // Compute primitive value for opacity
    const opacity = cameraOpacity.value;
    
    return {
      opacity,
    };
  });

  // Animated style for the main content fade
  const contentFadeStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value, // fadeAnim is the shared value from useFadeInAnimation
    };
  });

  // Camera mode UI
  if (cameraMode) {
    return (
      <Animated.View style={[styles.cameraContainer, cameraContainerStyle]}>
        <StatusBar barStyle="light-content" translucent />
        <Camera.CameraView
          style={styles.camera}
          ref={cameraRef}
          facing={'back'}
        >
          {/* Scanning overlay frame */}
          <Animated.View style={[styles.scanningOverlay, scanningAnimStyle]}>
            <View style={styles.scanningFrame} />
          </Animated.View>
          
          {/* Camera guide frame */}
          <Animated.View style={[styles.cameraGuide, cameraGuideAnimStyle]}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </Animated.View>
          
          {/* Camera controls */}
          <View style={styles.cameraControls}>
            <TouchableOpacity 
              style={styles.cameraButton} 
              onPress={handleCapture}
              activeOpacity={0.8}
            >
              <View style={styles.cameraButtonInner} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleCancelCamera}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Camera.CameraView>
      </Animated.View>
    );
  }

  // Main UI
  return (
    <AnimatedSafeAreaView 
      style={[
        styles.container, 
        { backgroundColor: theme.backgroundPrimary }
      ]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
      
      <Animated.View 
        style={[
          styles.content,
          contentFadeStyle // Use the animated style hook here
        ]}
      >
        <Text style={[styles.title, { color: theme.textPrimary }]}>Scan</Text>
        
        {/* Initial scan UI */}
        {!previewImage && !scanResult && (
          <>
            <Animated.View style={[styles.scanButtonContainer, scanButtonAnimStyle]}>
              <ScanButton onPress={handleStartScan} text="Tap to Scan" />
            </Animated.View>
            
            <TouchableOpacity 
              style={styles.galleryButton} 
              onPress={handleSelectFromGallery}
              activeOpacity={0.7}
            >
              <Text style={[styles.galleryButtonText, { color: theme.primary }]}>
                Select from Gallery
              </Text>
            </TouchableOpacity>
            
            <Text style={[styles.instruction, { color: theme.textSecondary }]}>
              Point your camera at any item to identify how to recycle it
            </Text>
          </>
        )}
        
        {/* Preview Image */}
        {previewImage && (
          <View style={styles.previewContainer}>
            <Image 
              source={{ uri: previewImage }} 
              style={styles.previewImage}
              resizeMode="cover"
            />
            
            {/* Loading overlay */}
            {scanning && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={styles.loadingText}>Analyzing item...</Text>
              </View>
            )}
          </View>
        )}
        
        {/* Scan Result Card */}
        {scanResult && <ScanResultCard result={scanResult} onClose={handleCloseScan} />}
        
        {/* New scan button */}
        {(previewImage || scanResult) && (
          <AnimatedButton
            text="Scan New Item"
            onPress={handleStartScan}
            style={styles.newScanButton}
            variant="filled"
            size="medium"
            iconLeft={<Ionicons name="camera-outline" size={20} color="#FFFFFF" />}
          />
        )}
      </Animated.View>
    </AnimatedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 40,
    alignSelf: 'flex-start',
  },
  scanButtonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  galleryButton: {
    paddingVertical: 12,
    marginBottom: 30,
  },
  galleryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  instruction: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 22,
  },
  // Camera styles
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraGuide: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
  },
  cornerTL: {
    position: 'absolute',
    top: '30%',
    left: '20%',
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#FFFFFF',
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    position: 'absolute',
    top: '30%',
    right: '20%',
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FFFFFF',
    borderTopRightRadius: 10,
  },
  cornerBL: {
    position: 'absolute',
    bottom: '30%',
    left: '20%',
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#FFFFFF',
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    position: 'absolute',
    bottom: '30%',
    right: '20%',
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FFFFFF',
    borderBottomRightRadius: 10,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    alignItems: 'center',
    justifyContent: 'flex-end',
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
  // Preview styles
  previewContainer: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  newScanButton: {
    marginTop: 20,
  },
});

export default ScanScreen;
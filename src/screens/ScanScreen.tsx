import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import * as Camera from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  withSpring,
  Easing,
  runOnJS,
  interpolateColor,
  FadeIn,
  FadeOut,
  cancelAnimation,
} from "react-native-reanimated";

// Import components & hooks
import ScanButton from "../components/ScanButton";
import ScanResultCard from "../components/ScanResultCard";
import AnimatedButton from "../components/UI/AnimatedButton";
import { useTheme } from "../context/ThemeContext";
import { useAppContext } from "../context/AppContext";
import {
  useFadeInAnimation,
  useHapticFeedback,
  useReanimatedScale,
  useReanimatedSlide,
} from "../hooks/useAnimations";

// Animated components
const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const { width, height } = Dimensions.get("window");

// Define the ScanResult interface based on the JSDoc types in geminiClient.js
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
  scannedImageUrl?: string;
  isMockData?: boolean;
  errorDetails?: string;
}

const ScanScreen: React.FC = () => {
  // Context & hooks
  const { theme, isDark, themeTransition, toggleTheme } = useTheme();
  const { addRecycledItem } = useAppContext();
  const { triggerImpact, triggerNotification } = useHapticFeedback();
  const { fadeAnim, fadeIn, fadeOut } = useFadeInAnimation(300, 1);

  // Define gradient colors with 'as const'
  const darkGradientColors = ["#131419", "#1B1D25"] as const;
  const lightGradientColors = ["#FFFFFF", "#F7FAFC"] as const;
  // Choose the correct gradient colors based on theme
  const gradientColors = isDark ? darkGradientColors : lightGradientColors;

  // Scale animations
  const { scale: instructionScale, scaleStyle: instructionScaleStyle } =
    useReanimatedScale(400, 0);
  const { slideStyle: instructionSlideStyle, slideIn: instructionSlideIn } =
    useReanimatedSlide("up", 20, 800);

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
  const pulseValue = useSharedValue(1);
  const themeToggleScale = useSharedValue(1);
  const themeToggleRotate = useSharedValue(0);

  // Initialize animations
  useEffect(() => {
    // --- Temporarily comment out effect body for debugging ---
    /*
    // Start pulsing animation for scan button
    startPulseAnimation();
    
    // Animate instruction text in
    setTimeout(() => {
      instructionScale.value = withSpring(1, {
        damping: 14,
        stiffness: 100,
      });
      instructionSlideIn();
    }, 500);
    
    return () => {
      // Clean up animations
      cancelAnimation(pulseValue);
    };
    */
    // --- End temporary comment out ---
  }, []);

  // Pulse animation for scan button
  const startPulseAnimation = () => {
    pulseValue.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) })
      ),
      -1, // Infinite repeat
      true // Reverse
    );
  };

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
    if (finalStatus !== "granted") {
      Alert.alert(
        "Camera Permission Required",
        "Please enable camera access in settings to use this feature.",
        [{ text: "OK" }]
      );
      return;
    }
    // Trigger haptic feedback
    triggerImpact("medium");

    // Animate scan button before camera opens
    scanButtonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1.1, { duration: 200 }),
      withTiming(0, { duration: 200 })
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
        withDelay(
          300,
          withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) })
        )
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
      triggerImpact("heavy");

      // Take picture
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });

      // Stop animations
      stopScanningAnimation();

      // Update state & process scan
      setPreviewImage(photo.uri);
      fadeIn();

      // Exit camera mode
      cameraOpacity.value = withTiming(
        0,
        {
          duration: 300,
          easing: Easing.out(Easing.ease),
        },
        () => {
          runOnJS(setCameraMode)(false);
        }
      );

      // Process the image
      processScan(photo.uri);
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert("Error", "Could not capture image. Please try again.");

      // Exit camera mode on error
      setCameraMode(false);
      fadeIn();
    }
  };

  // Select image from gallery
  const handleSelectFromGallery = async () => {
    try {
      // Trigger haptic feedback
      triggerImpact("light");

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
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
      console.error("Error picking image:", error);
      Alert.alert("Error", "Could not select image. Please try again.");
    }
  };

  // Import the Gemini client at the top level
  const geminiClient = require('../geminiClient').default;
  
  // Process scan and analyze image
  const processScan = async (imageUri: string) => {
    setScanning(true);
    try {
      // Send image to Gemini API for analysis
      const result = await geminiClient.analyzeImage(imageUri);
      
      // Update user data if recyclable
      if (result.recyclable) {
        addRecycledItem(result);
      }

      // Update state with result
      setScanResult(result);
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', 'Could not analyze image. Please try again.');
      
      // Fallback to mock data if API fails
      setScanResult({
        itemName: "Analysis Failed",
        recyclable: false,
        category: "Unknown",
        recyclingCode: "",
        instructions: "Failed to analyze the image. Please check your internet connection and try again.",
        impact: {
          co2Saved: "0 kg",
          waterSaved: "0L"
        },
        scannedImageUrl: imageUri,
        errorDetails: error instanceof Error ? error.message : "Unknown error"
      });
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

    // Reset all relevant state
    setCameraMode(false);
    setPreviewImage(null);
    setScanResult(null);

    // Reset scan button scale with animation
    scanButtonScale.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });

    // Fade out camera and switch back
    cameraOpacity.value = withTiming(
      0,
      {
        duration: 300,
        easing: Easing.out(Easing.ease),
      },
      () => {
        runOnJS(fadeIn)();
      }
    );
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
    const opacity = 0.7 - scanningAnimation.value * 0.5;
    const scaleX = 1 + scanningAnimation.value * 0.1;
    const scaleY = 1 + scanningAnimation.value * 0.1;

    return {
      opacity,
      transform: [{ scaleX }, { scaleY }],
    };
  });

  // Scan button animation
  const scanButtonAnimStyle = useAnimatedStyle(() => {
    // Combine manual scale and pulse animations
    return {
      transform: [{ scale: scanButtonScale.value * pulseValue.value }],
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

  // Theme toggle animation
  const handleThemeToggle = () => {
    // Trigger haptic feedback
    triggerImpact("light");

    // Animate the theme toggle button
    themeToggleScale.value = withSequence(
      withTiming(0.8, { duration: 150 }),
      withSpring(1, { damping: 12 })
    );

    // Rotate animation
    themeToggleRotate.value = withSequence(
      withTiming(isDark ? -Math.PI : Math.PI, {
        duration: 450,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
      })
    );

    // After animation, reset rotation value
    setTimeout(() => {
      themeToggleRotate.value = 0;
    }, 500);

    // Toggle theme
    toggleTheme();
  };

  // Theme toggle animation style
  const themeToggleAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: themeToggleScale.value },
        { rotate: `${themeToggleRotate.value}rad` },
      ],
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
          facing={"back"}
        >
          {/* Animated scanning mask */}
          <View style={styles.scanMask}>
            <View style={styles.scanArea}>
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [
                      { translateY: scanningAnimation.value * 280 - 140 },
                    ],
                    opacity:
                      scanningAnimation.value > 0.9
                        ? 1 - (scanningAnimation.value - 0.9) * 10
                        : 1,
                  },
                ]}
              />
            </View>
          </View>

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

          {/* Camera features indicator */}
          <View style={styles.cameraFeatures}>
            <View style={styles.cameraFeature}>
              <Ionicons name="scan" size={20} color="white" />
              <Text style={styles.cameraFeatureText}>AI Scan</Text>
            </View>
          </View>
        </Camera.CameraView>
      </Animated.View>
    );
  }

  // Main UI
  return (
    <AnimatedSafeAreaView
      style={[styles.container, { backgroundColor: theme.backgroundPrimary }]}
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />

      {/* Simple Gradient Background */}
      <LinearGradient
        style={StyleSheet.absoluteFill}
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animated.View style={[styles.content, contentFadeStyle]}>
        {/* Header with title */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Scan</Text>

          {/* Theme toggle button */}
          <Animated.View style={themeToggleAnimStyle}>
            <TouchableOpacity
              style={[
                styles.themeToggle,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)",
                  borderColor: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.02)",
                  borderWidth: 0.5,
                },
              ]}
              onPress={handleThemeToggle}
              activeOpacity={0.7}
            >
              <Animated.View
                style={{
                  transform: [{ rotate: `${isDark ? "0deg" : "180deg"}` }],
                  opacity: isDark ? 1 : 0,
                  position: "absolute",
                }}
              >
                <Ionicons
                  name="sunny-outline"
                  size={20}
                  color={theme.textPrimary}
                />
              </Animated.View>
              <Animated.View
                style={{
                  transform: [{ rotate: `${isDark ? "180deg" : "0deg"}` }],
                  opacity: isDark ? 0 : 1,
                  position: "absolute",
                }}
              >
                <Ionicons
                  name="moon-outline"
                  size={20}
                  color={theme.textPrimary}
                />
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        </View>
        
        {/* Wrap scrollable content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
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
              
              <Animated.View style={[instructionScaleStyle, instructionSlideStyle]}>
                <View
                  style={[styles.instructionCard, { 
                    backgroundColor: isDark ? 'rgba(30,35,45,0.8)' : 'rgba(255,255,255,0.8)',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    borderWidth: 0.5
                  }]}
                >
                  <View style={styles.instructionIconContainer}>
                    <MaterialCommunityIcons 
                      name="recycle" 
                      size={24} 
                      color={theme.primary} 
                    />
                  </View>
                  <Text style={[styles.instruction, { color: theme.textSecondary }]}>
                    Point your camera at any item to identify how to recycle it
                  </Text>
                </View>
              </Animated.View>
              
              {/* Categories preview */}
              <View style={styles.categoriesContainer}>
                <Text style={[styles.categoriesTitle, { color: theme.textSecondary }]}>
                  Scan to identify:
                </Text>
                <View style={styles.categories}>
                  <View style={[styles.categoryBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    <MaterialCommunityIcons name="bottle-soda-classic-outline" size={16} color={theme.textSecondary} />
                    <Text style={[styles.categoryText, { color: theme.textSecondary }]}>Plastic</Text>
                  </View>
                  <View style={[styles.categoryBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    <MaterialCommunityIcons name="glass-cocktail" size={16} color={theme.textSecondary} />
                    <Text style={[styles.categoryText, { color: theme.textSecondary }]}>Glass</Text>
                  </View>
                  <View style={[styles.categoryBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    <MaterialCommunityIcons name="newspaper-variant-outline" size={16} color={theme.textSecondary} />
                    <Text style={[styles.categoryText, { color: theme.textSecondary }]}>Paper</Text>
                  </View>
                </View>
              </View>
            </>
          )}
          
          {/* Preview Image */}
          {previewImage && !scanResult && (
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
              variant="gradient"
              size="medium"
              gradientColors={isDark 
                ? ['#4DC1A1', '#3AA183']
                : ['#3A9B7A', '#2A7459']
              }
              iconLeft={<Ionicons name="camera-outline" size={20} color="#FFFFFF" />}
            />
          )}
        </ScrollView>
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
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollViewContent: {
    alignItems: 'center',
    paddingBottom: 100,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  scanButtonContainer: {
    marginTop: 20,
    marginBottom: 24,
  },
  galleryButton: {
    paddingVertical: 12,
    marginBottom: 24,
  },
  galleryButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  instructionCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  instructionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(77, 193, 161, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  instruction: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  categoriesContainer: {
    width: "100%",
    marginTop: 16,
  },
  categoriesTitle: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 12,
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  scanMask: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: 280,
    height: 280,
    overflow: "hidden",
  },
  scanLine: {
    position: "absolute",
    width: 280,
    height: 2,
    backgroundColor: "#4DC1A1",
    shadowColor: "#4DC1A1",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 5,
    shadowOpacity: 0.7,
  },
  cameraGuide: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scanningOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scanningFrame: {
    width: 280,
    height: 280,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 20,
  },
  cornerTL: {
    position: "absolute",
    top: height / 2 - 140,
    left: width / 2 - 140,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#FFFFFF",
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    position: "absolute",
    top: height / 2 - 140,
    right: width / 2 - 140,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: "#FFFFFF",
    borderTopRightRadius: 16,
  },
  cornerBL: {
    position: "absolute",
    bottom: height / 2 - 140,
    left: width / 2 - 140,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#FFFFFF",
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    position: "absolute",
    bottom: height / 2 - 140,
    right: width / 2 - 140,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: "#FFFFFF",
    borderBottomRightRadius: 16,
  },
  cameraControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 40,
  },
  cameraButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  cameraButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
  },
  cancelButton: {
    padding: 10,
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cameraFeatures: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  cameraFeature: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cameraFeatureText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "600",
  },
  previewContainer: {
    width: "100%",
    height: 350,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    backgroundColor: '#FFFFFF',
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 16,
    fontWeight: "500",
  },
});

export default ScanScreen;

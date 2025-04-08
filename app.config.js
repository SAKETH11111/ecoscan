import 'dotenv/config';

export default {
  expo: {
    name: "EcoScan",
    slug: "ecoscan",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#4CAF50"
    },
    extra: {
      GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
      googleMapsIos: process.env.GOOGLE_MAPS_API_KEY_IOS,
      googleMapsAndroid: process.env.GOOGLE_MAPS_API_KEY_ANDROID,
      googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY,
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription: "EcoScan needs access to your camera to scan items for recycling identification.",
        NSPhotoLibraryUsageDescription: "EcoScan needs access to your photo library to select images for recycling identification.",
        NSLocationWhenInUseUsageDescription: "EcoScan needs access to your location to find nearby recycling facilities.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "EcoScan needs access to your location to find nearby recycling facilities."
      },
      bundleIdentifier: "com.anonymous.ecoscan",
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY_IOS
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#4CAF50"
      },
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION"
      ],
      package: "com.anonymous.ecoscan",
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY_ANDROID
        }
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-camera",
        {
          cameraPermission: "EcoScan needs access to your camera to scan items for recycling identification."
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "EcoScan needs access to your location to find nearby recycling facilities."
        }
      ]
    ]
  }
}; 
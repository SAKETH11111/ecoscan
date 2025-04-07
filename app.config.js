import 'dotenv/config';

export default {
  expo: {
    name: "EcoScan",
    slug: "ecoscan",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: false,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#4CAF50"
    },
    extra: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      googleMapsIos: process.env.GOOGLE_MAPS_API_KEY_IOS,
      googleMapsAndroid: process.env.GOOGLE_MAPS_API_KEY_ANDROID,
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription: "EcoScan needs access to your camera to scan items for recycling identification.",
        NSPhotoLibraryUsageDescription: "EcoScan needs access to your photo library to select images for recycling identification."
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
        "android.permission.RECORD_AUDIO"
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
      ]
    ]
  }
}; 
// Ensure Reanimated is imported very early
import 'react-native-reanimated';

// Gesture Handler import (often needs to be early too, but after Reanimated)
import 'react-native-gesture-handler';

// The React Native initialization process must occur before any other imports that might use React Native
import { AppRegistry } from 'react-native';
import { registerRootComponent } from 'expo';

// Import your App component
import App from './App';

// Register the app component
AppRegistry.registerComponent('ecoscan', () => App);
registerRootComponent(App);
import React, { useEffect } from 'react';
import { LogBox, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './src/context/ThemeContext';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Reanimated 2',
  'AsyncStorage',
  'Require cycle:',
  'new NativeEventEmitter',
  '[Reanimated] Reduced motion setting is enabled on this device',
]);

const App = () => {
  // Log when app starts
  useEffect(() => {
    console.log('App mounted');
  }, []);

  // Error boundary
  try {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <SafeAreaProvider>
            <StatusBar style="dark" />
            <AppProvider>
              <AppNavigator />
            </AppProvider>
          </SafeAreaProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    );
  } catch (error) {
    // Show error screen if something goes wrong
    console.error('App crashed:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, marginBottom: 20, textAlign: 'center' }}>
          Something went wrong. Please restart the app.
        </Text>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
          {error instanceof Error ? error.message : String(error)}
        </Text>
      </View>
    );
  }
};

export default App;
import React from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import ScanScreen from '../screens/ScanScreen';
import ImpactScreen from '../screens/ImpactScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';

// Import custom components
import CustomTabBar from '../components/CustomTabBar';

// Import context
import { useTheme } from '../context/ThemeContext';

// Define types for navigation
export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Scan: undefined;
  Impact: undefined;
  Resources: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main tab navigator
const MainTabNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      tabBar={(props: BottomTabBarProps) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Impact" component={ImpactScreen} />
      <Tab.Screen name="Resources" component={ResourcesScreen} />
    </Tab.Navigator>
  );
};

// Root stack navigator
const AppNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.backgroundPrimary },
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
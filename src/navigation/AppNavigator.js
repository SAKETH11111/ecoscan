import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import ScanScreen from '../screens/ScanScreen';
import ImpactScreen from '../screens/ImpactScreen';
import CommunityScreen from '../screens/CommunityScreen';
import ResourcesScreen from '../screens/ResourcesScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Scan') {
              iconName = focused ? 'scan' : 'scan-outline';
            } else if (route.name === 'Impact') {
              iconName = focused ? 'leaf' : 'leaf-outline';
            } else if (route.name === 'Community') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Resources') {
              iconName = focused ? 'map' : 'map-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: '#666666',
          tabBarStyle: {
            height: 60,
            paddingBottom: 10,
            paddingTop: 10,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Scan" component={ScanScreen} />
        <Tab.Screen name="Impact" component={ImpactScreen} />
        <Tab.Screen name="Community" component={CommunityScreen} />
        <Tab.Screen name="Resources" component={ResourcesScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
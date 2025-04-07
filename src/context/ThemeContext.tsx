import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useColorScheme, Appearance, AppState, AppStateStatus } from 'react-native';
import { lightTheme, darkTheme, Theme } from '../utils/theme';
import Animated, { 
  useSharedValue, 
  withTiming, 
  Easing, 
  cancelAnimation,
  runOnJS
} from 'react-native-reanimated';

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  themeTransition: Animated.SharedValue<number>;
  systemTheme: 'light' | 'dark' | null;
  useSystemTheme: boolean;
  setUseSystemTheme: (use: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
  themeTransition: { value: 0 } as Animated.SharedValue<number>,
  systemTheme: null,
  useSystemTheme: true,
  setUseSystemTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemTheme = useColorScheme() as 'light' | 'dark' | null;
  const [useSystemTheme, setUseSystemTheme] = useState(true);
  const [isDark, setIsDark] = useState(systemTheme === 'dark');
  const themeTransition = useSharedValue(0);
  const appState = useRef(AppState.currentState);

  // Monitor system theme changes
  useEffect(() => {
    if (useSystemTheme && systemTheme) {
      animateThemeTransition(systemTheme === 'dark');
    }
  }, [systemTheme, useSystemTheme]);

  // Monitor app state to detect theme changes when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [useSystemTheme]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to the foreground
      if (useSystemTheme) {
        const currentSystemTheme = Appearance.getColorScheme() as 'light' | 'dark' | null;
        if (currentSystemTheme && currentSystemTheme !== (isDark ? 'dark' : 'light')) {
          animateThemeTransition(currentSystemTheme === 'dark');
        }
      }
    }
    appState.current = nextAppState;
  };

  const animateThemeTransition = (dark: boolean) => {
    // Cancel any ongoing animations
    cancelAnimation(themeTransition);
    
    // Start from the current value (0 = light, 1 = dark)
    themeTransition.value = isDark ? 1 : 0;
    
    // Animate to new theme
    themeTransition.value = withTiming(
      dark ? 1 : 0, 
      { 
        duration: 350, 
        easing: Easing.bezier(0.4, 0, 0.2, 1) 
      },
      () => {
        // Set the actual theme after animation completes using runOnJS
        runOnJS(setIsDark)(dark);
      }
    );
  };

  const toggleTheme = () => {
    runOnJS(setUseSystemTheme)(false);
    animateThemeTransition(!isDark);
  };

  const setTheme = (theme: 'light' | 'dark') => {
    runOnJS(setUseSystemTheme)(false);
    animateThemeTransition(theme === 'dark');
  };

  // Update system theme usage
  const handleSetUseSystemTheme = (use: boolean) => {
    runOnJS(setUseSystemTheme)(use);
    if (use && systemTheme) {
      animateThemeTransition(systemTheme === 'dark');
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      isDark, 
      toggleTheme, 
      setTheme, 
      themeTransition,
      systemTheme,
      useSystemTheme,
      setUseSystemTheme: handleSetUseSystemTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Simple theme structure to avoid complex nesting
export type ThemeColors = {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  backgroundPrimary: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  backgroundCard: string;
  backgroundHighlight: string;
  border: string;
  shadow: string;
  overlay: string;
  translucent: string;
};

export type ThemeTypography = {
  fontSizeXs: number;
  fontSizeSm: number;
  fontSizeMd: number;
  fontSizeLg: number;
  fontSizeXl: number;
  fontSizeXxl: number;
  fontSizeXxxl: number;
  fontWeightLight: string;
  fontWeightNormal: string;
  fontWeightMedium: string;
  fontWeightSemibold: string;
  fontWeightBold: string;
};

export type ThemeSpacing = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
};

export type ThemeRadius = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  round: number;
};

export type ThemeShadows = {
  small: object;
  medium: object;
  large: object;
};

export type Theme = ThemeColors & ThemeTypography & ThemeSpacing & ThemeShadows & {
  isDark: boolean;
  screenWidth: number;
  screenHeight: number;
  radius: ThemeRadius;
};

// Light theme
export const lightTheme: Theme = {
  // Colors
  primary: '#3A9B7A',
  primaryLight: 'rgba(58, 155, 122, 0.1)',
  primaryDark: '#2A7459',
  secondary: '#86B3D1',
  accent: '#F9A826',
  success: '#48BB78',
  error: '#E53E3E',
  warning: '#F6AD55',
  info: '#63B3ED',
  textPrimary: '#1A202C',
  textSecondary: '#4A5568',
  textTertiary: '#718096',
  textInverse: '#FFFFFF',
  backgroundPrimary: '#FFFFFF',
  backgroundSecondary: '#F7FAFC',
  backgroundTertiary: '#EDF2F7',
  backgroundCard: '#FFFFFF',
  backgroundHighlight: 'rgba(58, 155, 122, 0.05)',
  border: '#E2E8F0',
  shadow: '#1A202C',
  overlay: 'rgba(26, 32, 44, 0.6)',
  translucent: 'rgba(255, 255, 255, 0.8)',
  
  // Typography
  fontSizeXs: 12,
  fontSizeSm: 14,
  fontSizeMd: 16,
  fontSizeLg: 18,
  fontSizeXl: 20,
  fontSizeXxl: 24,
  fontSizeXxxl: 32,
  fontWeightLight: '300',
  fontWeightNormal: '400',
  fontWeightMedium: '500',
  fontWeightSemibold: '600',
  fontWeightBold: '700',
  
  // Spacing
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  
  // Border radius
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  round: 9999,
  
  // Add radius object
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    round: 9999,
  },
  
  // Shadows
  small: {
    shadowColor: '#1A202C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#1A202C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#1A202C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // Other
  isDark: false,
  screenWidth: width,
  screenHeight: height,
};

// Dark theme
export const darkTheme: Theme = {
  ...lightTheme,
  // Colors
  primary: '#4DC1A1',
  primaryLight: 'rgba(77, 193, 161, 0.15)',
  primaryDark: '#3AA183',
  secondary: '#88B8D6',
  accent: '#FFA74D',
  success: '#4CAF50',
  error: '#EF5350',
  warning: '#FFAB40',
  info: '#64B5F6',
  textPrimary: '#F8F9FA',
  textSecondary: '#E2E8F0',
  textTertiary: '#A0AEC0',
  textInverse: '#1A202C',
  // Premium dark backgrounds
  backgroundPrimary: '#131419',
  backgroundSecondary: '#1B1D25',
  backgroundTertiary: '#262A36',
  backgroundCard: '#222630',
  backgroundHighlight: 'rgba(77, 193, 161, 0.12)',
  border: 'rgba(120, 144, 156, 0.25)',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.75)',
  translucent: 'rgba(19, 20, 25, 0.92)',
  
  // Enhanced shadows for dark theme
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  
  // Other
  isDark: true,
};

export default {
  light: lightTheme,
  dark: darkTheme,
};
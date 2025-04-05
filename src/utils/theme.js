// EcoScan app theme
export const theme = {
  colors: {
    primary: '#4CAF50',
    primaryLight: 'rgba(76, 175, 80, 0.1)',
    secondary: '#2196F3',
    accent: '#FFC107',
    
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
    
    text: {
      primary: '#1E1E1E',
      secondary: '#666666',
      light: '#999999',
    },
    
    background: {
      primary: '#FFFFFF',
      secondary: '#F5F5F5',
      tertiary: '#E0E0E0',
    },
    
    border: '#F0F0F0',
  },
  
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16, 
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  
  radius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    round: 9999,
  },
  
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 5,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};
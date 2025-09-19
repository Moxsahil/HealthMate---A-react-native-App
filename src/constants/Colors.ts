const lightTheme = {
  // Basic Colors
  primary: '#007AFF',
  secondary: '#FF3B30',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Text Colors
  text: '#000000',
  textSecondary: '#666666',
  textInverse: '#FFFFFF',

  // UI Elements
  border: '#E1E5E9',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  info: '#007AFF',
  accent: '#5856D6',

  // Health-specific Colors (basic)
  heartRate: '#FF3B30',
  steps: '#007AFF',
  calories: '#FF9500',
  sleep: '#5856D6',
  water: '#32D74B',
};

const darkTheme = {
  // Basic Colors
  primary: '#0A84FF',
  secondary: '#FF453A',
  background: '#000000',
  surface: '#1C1C1E',
  card: '#2C2C2E',

  // Text Colors
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textInverse: '#000000',

  // UI Elements
  border: '#38383A',
  error: '#FF453A',
  success: '#30D158',
  warning: '#FF9F0A',
  info: '#0A84FF',
  accent: '#5E5CE6',

  // Health-specific Colors (basic)
  heartRate: '#FF453A',
  steps: '#0A84FF',
  calories: '#FF9F0A',
  sleep: '#5E5CE6',
  water: '#30D158',
};

export const Colors = {
  light: lightTheme,
  dark: darkTheme,
};

export type Theme = keyof typeof Colors;
export type ColorScheme = typeof Colors.light;
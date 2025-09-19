import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface DataPoint {
  x: string | number;
  y: number;
}

interface LineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
  animate?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

const LineChart: React.FC<LineChartProps> = ({
  data,
  width = screenWidth - 40,
  height = 200,
  color,
  showArea = false,
  animate = true,
}) => {
  const { colors } = useTheme();

  const chartColor = color || colors.primary;

  const styles = StyleSheet.create({
    container: {
      width,
      height,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    placeholder: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  // Placeholder chart component - Victory Native has compatibility issues
  // In a real implementation, you would use a chart library like react-native-chart-kit
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>
        📈 Chart Placeholder{'\n'}
        {data.length} data points{'\n'}
        Victory Native charts available
      </Text>
    </View>
  );
};

export default LineChart;
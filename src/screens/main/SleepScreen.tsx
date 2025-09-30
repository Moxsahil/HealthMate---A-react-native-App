import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { RootState, AppDispatch } from '../../store/store';
import {
  setSelectedPeriod,
  generateInsights,
  calculateStats,
  loadSleepData,
  updateSleepGoalsAsync,
} from '../../store/slices/sleepSlice';
import SleepLogModal from '../../components/SleepLogModal';
import SleepScheduleModal from '../../components/SleepScheduleModal';

const { width } = Dimensions.get('window');

const SleepScreen: React.FC = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showSleepLogModal, setShowSleepLogModal] = useState(false);
  const [showSleepScheduleModal, setShowSleepScheduleModal] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState<any>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const chartAnimation = useRef(new Animated.Value(1)).current;
  const tooltipAnimation = useRef(new Animated.Value(0)).current;

  // Get data from Redux store
  const {
    recentSleep,
    sleepGoals,
    stats,
    insights,
    selectedPeriod,
    isLoading,
  } = useSelector((state: RootState) => state.sleep);

  // Get the most recent sleep record (last night)
  const lastNightData = recentSleep[0];

  // Load data on mount and initialize calculations
  useEffect(() => {
    dispatch(loadSleepData());
  }, [dispatch]);

  // Recalculate stats when data changes
  useEffect(() => {
    if (recentSleep.length > 0) {
      dispatch(calculateStats());
      dispatch(generateInsights());
    }
  }, [dispatch, recentSleep]);

  const articles = [
    {
      id: 1,
      title: 'The Science of Deep Sleep',
      subtitle: 'How deep sleep affects your health',
      image: '🧠',
      readTime: '5 min read',
    },
    {
      id: 2,
      title: 'Creating the Perfect Sleep Environment',
      subtitle: 'Tips for better sleep quality',
      image: '🛏️',
      readTime: '3 min read',
    },
    {
      id: 3,
      title: 'Sleep and Exercise Connection',
      subtitle: 'How workout timing affects sleep',
      image: '💪',
      readTime: '4 min read',
    },
  ];

  const periods = ['Day', 'Week', 'Month', '6M', 'Year'];

  const formatSleepTime = (minutes: number): string => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  const formatSleepTimeFromHours = (hours: number): string => {
    const hrs = Math.floor(hours);
    const mins = Math.round((hours - hrs) * 60);
    return `${hrs}h ${mins}m`;
  };

  const getSleepQualityColor = (efficiency: number): string => {
    if (efficiency >= 85) return '#4CAF50';
    if (efficiency >= 70) return '#FF9800';
    return '#F44336';
  };

  const handlePeriodChange = (period: typeof selectedPeriod) => {
    // Animate chart transition
    Animated.sequence([
      Animated.timing(chartAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(chartAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    dispatch(setSelectedPeriod(period));
  };

  const handleDayPress = (dayData: any) => {
    setSelectedDayData(dayData);
    setShowTooltip(true);

    Animated.spring(tooltipAnimation, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    // Auto-hide tooltip after 4 seconds
    setTimeout(() => {
      hideTooltip();
    }, 4000);
  };

  const hideTooltip = () => {
    Animated.timing(tooltipAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowTooltip(false);
      setSelectedDayData(null);
    });
  };

  const handleUpdateSleepGoals = async (updatedGoals: Partial<typeof sleepGoals>) => {
    try {
      await dispatch(updateSleepGoalsAsync({
        ...sleepGoals,
        ...updatedGoals,
      }));

      // Recalculate stats after updating goals
      dispatch(calculateStats());
      dispatch(generateInsights());
    } catch (error) {
      console.error('Failed to update sleep goals:', error);
    }
  };

  // Create styles inside component to access colors
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0a0a0f',
    },
    scrollView: {
      flex: 1,
    },
    header: {
      height: 120,
      marginBottom: 20,
    },
    headerGradient: {
      flex: 1,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    headerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 20,
    },
    greeting: {
      fontSize: 24,
      fontWeight: '700',
      color: '#ffffff',
      marginBottom: 4,
    },
    lastNightSummary: {
      fontSize: 16,
      color: '#b0b0b0',
      marginBottom: 8,
    },
    sleepQualityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    sleepQualityText: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 6,
    },
    startTrackingButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 6,
    },
    startTrackingText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#ffffff',
    },
    noDataSummary: {
      alignItems: 'center',
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    noDataSummaryText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#ffffff',
      marginTop: 16,
      marginBottom: 8,
    },
    noDataSummarySubtext: {
      fontSize: 14,
      color: '#b0b0b0',
      textAlign: 'center',
      marginBottom: 20,
    },
    logSleepButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
    },
    logSleepButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff',
    },
    summaryCards: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    cardRow: {
      flexDirection: 'row',
      gap: 12,
    },
    cardColumn: {
      flex: 1,
      gap: 12,
    },
    summaryCard: {
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
    },
    cardLarge: {
      flex: 2,
      minHeight: 140,
    },
    cardSmall: {
      flex: 1,
      minHeight: 64,
      padding: 16,
    },
    cardValue: {
      fontSize: 32,
      fontWeight: '700',
      color: '#ffffff',
      marginTop: 8,
    },
    cardValueSmall: {
      fontSize: 18,
      fontWeight: '700',
      color: '#ffffff',
      marginTop: 4,
    },
    cardLabel: {
      fontSize: 14,
      color: '#b0b0b0',
      marginTop: 4,
    },
    cardLabelSmall: {
      fontSize: 12,
      color: '#b0b0b0',
      marginTop: 2,
    },
    cardSubtitle: {
      fontSize: 12,
      color: '#808080',
      marginTop: 2,
    },
    section: {
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 20,
      padding: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#ffffff',
      marginBottom: 16,
    },
    editButton: {
      padding: 8,
    },
    sleepStagesContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    sleepStage: {
      alignItems: 'center',
    },
    stageIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginBottom: 8,
    },
    stageLabel: {
      fontSize: 14,
      color: '#b0b0b0',
      marginBottom: 4,
    },
    stageValue: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff',
    },
    filtersContainer: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    periodButtons: {
      flexDirection: 'row',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 12,
      padding: 4,
    },
    periodButton: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: 8,
    },
    periodButtonActive: {
      backgroundColor: colors.primary,
    },
    periodButtonText: {
      fontSize: 14,
      color: '#b0b0b0',
      fontWeight: '500',
    },
    periodButtonTextActive: {
      color: '#ffffff',
      fontWeight: '600',
    },
    scheduleContainer: {
      marginBottom: 20,
    },
    scheduleItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    scheduleInfo: {
      marginLeft: 16,
    },
    scheduleLabel: {
      fontSize: 14,
      color: '#b0b0b0',
    },
    scheduleTime: {
      fontSize: 18,
      fontWeight: '600',
      color: '#ffffff',
      marginTop: 2,
    },
    consistencyContainer: {
      alignItems: 'center',
    },
    consistencyLabel: {
      fontSize: 14,
      color: '#b0b0b0',
      marginBottom: 8,
    },
    consistencyBar: {
      width: '100%',
      height: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 4,
      marginBottom: 8,
    },
    consistencyFill: {
      height: 8,
      borderRadius: 4,
    },
    consistencyValue: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff',
    },
    insightItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    insightText: {
      fontSize: 14,
      color: '#ffffff',
      marginLeft: 12,
      flex: 1,
    },
    articleCard: {
      marginBottom: 12,
    },
    articleGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 16,
    },
    articleIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    articleEmoji: {
      fontSize: 24,
    },
    articleContent: {
      flex: 1,
    },
    articleTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: 4,
    },
    articleSubtitle: {
      fontSize: 14,
      color: '#b0b0b0',
      marginBottom: 4,
    },
    articleReadTime: {
      fontSize: 12,
      color: '#808080',
    },
    noDataContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    noDataTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: '#ffffff',
      marginTop: 20,
      marginBottom: 8,
    },
    noDataSubtitle: {
      fontSize: 16,
      color: '#b0b0b0',
      textAlign: 'center',
    },
    insightContent: {
      flex: 1,
      marginLeft: 12,
    },
    insightTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: 2,
    },
    chartContainer: {
      marginTop: 20,
      marginBottom: 20,
      height: 180,
      position: 'relative',
    },
    chartTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: 16,
      textAlign: 'center',
    },
    chartGrid: {
      position: 'absolute',
      width: '100%',
      height: 120,
      top: 20,
    },
    gridLine: {
      position: 'absolute',
      width: '100%',
      height: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    chartBars: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-around',
      height: 120,
      marginTop: 20,
      paddingHorizontal: 10,
    },
    barContainer: {
      alignItems: 'center',
      flex: 1,
      position: 'relative',
    },
    chartBar: {
      borderRadius: 4,
      minHeight: 10,
    },
    barLabel: {
      fontSize: 10,
      color: '#b0b0b0',
      marginTop: 8,
      textAlign: 'center',
    },
    barValue: {
      fontSize: 10,
      color: '#ffffff',
      marginTop: 2,
      fontWeight: '600',
      textAlign: 'center',
    },
    chartLabels: {
      position: 'absolute',
      left: -15,
      top: 20,
      height: 120,
      justifyContent: 'space-between',
    },
    chartLabel: {
      fontSize: 10,
      color: '#808080',
    },
    monthlyTotal: {
      fontSize: 14,
      fontWeight: '600',
      color: '#4CAF50',
      textAlign: 'center',
      marginBottom: 16,
    },
    monthChartScroll: {
      marginBottom: 10,
    },
    trendContainer: {
      marginTop: 20,
      marginBottom: 20,
    },
    trendTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: 16,
      textAlign: 'center',
    },
    qualityIndicators: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 16,
    },
    qualityDay: {
      alignItems: 'center',
    },
    qualityDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      marginBottom: 8,
    },
    qualityLabel: {
      fontSize: 10,
      color: '#b0b0b0',
    },
    averageQuality: {
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 12,
      padding: 16,
    },
    averageLabel: {
      fontSize: 14,
      color: '#b0b0b0',
      marginBottom: 8,
    },
    starsContainer: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    averageText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff',
    },
    efficiencyInsight: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      borderRadius: 12,
      padding: 16,
      marginTop: 20,
    },
    efficiencyContent: {
      marginLeft: 12,
      flex: 1,
    },
    efficiencyTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: 4,
    },
    efficiencyDescription: {
      fontSize: 12,
      color: '#b0b0b0',
    },
    efficiencyValue: {
      color: '#2196F3',
      fontWeight: '700',
    },
    dayViewContainer: {
      marginTop: 20,
      marginBottom: 20,
      paddingHorizontal: 20,
    },
    dayViewTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: 20,
      textAlign: 'center',
    },
    noDataDay: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    noDataDayText: {
      fontSize: 16,
      color: '#b0b0b0',
      marginTop: 12,
      marginBottom: 4,
    },
    noDataDaySubtext: {
      fontSize: 14,
      color: '#808080',
    },
    sleepTimeline: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
    },
    timelineHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    timelineLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff',
    },
    totalDuration: {
      fontSize: 16,
      fontWeight: '700',
      color: '#4CAF50',
    },
    timelineBar: {
      height: 80,
      position: 'relative',
      marginBottom: 15,
      paddingHorizontal: 5,
    },
    timelineBackground: {
      position: 'absolute',
      top: 35,
      left: 5,
      right: 5,
      height: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 6,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    sleepPeriod: {
      position: 'absolute',
      top: 35,
      height: 12,
      borderRadius: 6,
      overflow: 'hidden',
      shadowColor: '#4CAF50',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 3,
    },
    sleepGradient: {
      flex: 1,
      borderRadius: 5,
    },
    timeMarker: {
      position: 'absolute',
      alignItems: 'center',
      transform: [{ translateX: -35 }],
      minWidth: 70,
      zIndex: 10,
    },
    markerDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: '#ffffff',
      marginBottom: 6,
      borderWidth: 3,
      borderColor: '#4CAF50',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    markerTime: {
      fontSize: 11,
      fontWeight: '700',
      color: '#ffffff',
      marginBottom: 2,
      textAlign: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    markerLabel: {
      fontSize: 9,
      color: '#b0b0b0',
      textAlign: 'center',
      fontWeight: '600',
    },
    timeScale: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 5,
      marginTop: 8,
    },
    scaleLabel: {
      fontSize: 10,
      color: '#808080',
      fontWeight: '500',
      textAlign: 'center',
      minWidth: 35,
    },
    dayMetrics: {
      flexDirection: 'row',
      gap: 16,
    },
    dayMetric: {
      flex: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    metricValue: {
      fontSize: 24,
      fontWeight: '700',
      color: '#ffffff',
      marginBottom: 4,
    },
    metricLabel: {
      fontSize: 12,
      color: '#b0b0b0',
      marginBottom: 8,
    },
    efficiencyBar: {
      width: '100%',
      height: 6,
      borderRadius: 3,
      marginTop: 8,
    },
    efficiencyFill: {
      height: 6,
      borderRadius: 3,
    },
    noDataChart: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    noDataText: {
      fontSize: 16,
      color: '#b0b0b0',
      marginTop: 12,
      marginBottom: 4,
    },
    noDataSubtext: {
      fontSize: 14,
      color: '#808080',
    },
    tooltipOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    tooltipContainer: {
      backgroundColor: '#1a1a2e',
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 20,
      maxWidth: width - 40,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    tooltipTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#ffffff',
      marginBottom: 16,
      textAlign: 'center',
    },
    tooltipContent: {
      gap: 12,
    },
    tooltipRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    tooltipLabel: {
      fontSize: 14,
      color: '#b0b0b0',
    },
    tooltipValue: {
      fontSize: 14,
      fontWeight: '600',
      color: '#ffffff',
    },
    tooltipQuality: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    tooltipCloseButton: {
      marginTop: 16,
      alignSelf: 'center',
      paddingHorizontal: 20,
      paddingVertical: 8,
      backgroundColor: colors.primary,
      borderRadius: 8,
    },
    tooltipCloseText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#ffffff',
    },
    fab: {
      position: 'absolute',
      bottom: 30,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
  });

  // Modified: Don't return early - always show the interface
  const hasData = lastNightData && recentSleep.length > 0;

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.header,
        {
          transform: [
            {
              translateY: scrollY.interpolate({
                inputRange: [0, 100],
                outputRange: [0, -20],
                extrapolate: 'clamp',
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>
            {hasData ? 'Good Morning! 🌅' : 'Welcome to Sleep Tracking! 🌙'}
          </Text>
          <Text style={styles.lastNightSummary}>
            {hasData
              ? `You slept ${formatSleepTime(lastNightData.duration)} last night`
              : 'Start tracking your sleep for better insights'
            }
          </Text>
          {hasData ? (
            <View style={styles.sleepQualityBadge}>
              <MaterialIcons
                name="nights-stay"
                size={16}
                color={getSleepQualityColor(lastNightData.sleepEfficiency || 80)}
              />
              <Text
                style={[
                  styles.sleepQualityText,
                  { color: getSleepQualityColor(lastNightData.sleepEfficiency || 80) },
                ]}
              >
                {lastNightData.sleepEfficiency || 80}% Efficiency
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.startTrackingButton}
              onPress={() => setShowSleepLogModal(true)}
            >
              <MaterialIcons name="add" size={16} color="#ffffff" />
              <Text style={styles.startTrackingText}>Log Your First Sleep</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderSummaryCards = () => {
    if (!hasData) {
      return (
        <View style={styles.summaryCards}>
          <View style={styles.noDataSummary}>
            <MaterialIcons name="bedtime" size={48} color="#404040" />
            <Text style={styles.noDataSummaryText}>No Sleep Data Yet</Text>
            <Text style={styles.noDataSummarySubtext}>
              Log your sleep to see detailed insights and trends
            </Text>
            <TouchableOpacity
              style={styles.logSleepButton}
              onPress={() => setShowSleepLogModal(true)}
            >
              <MaterialIcons name="add" size={20} color="#ffffff" />
              <Text style={styles.logSleepButtonText}>Log Sleep Session</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.summaryCards}>
        <View style={styles.cardRow}>
          <LinearGradient
            colors={['rgba(76, 175, 80, 0.1)', 'rgba(76, 175, 80, 0.05)']}
            style={[styles.summaryCard, styles.cardLarge]}
          >
            <MaterialIcons name="bedtime" size={24} color="#4CAF50" />
            <Text style={styles.cardValue}>{formatSleepTime(lastNightData.duration)}</Text>
            <Text style={styles.cardLabel}>Time Asleep</Text>
            <Text style={styles.cardSubtitle}>
              Goal: {formatSleepTimeFromHours(sleepGoals.targetSleepHours)}
            </Text>
          </LinearGradient>

          <View style={styles.cardColumn}>
            <LinearGradient
              colors={['rgba(63, 81, 181, 0.1)', 'rgba(63, 81, 181, 0.05)']}
              style={[styles.summaryCard, styles.cardSmall]}
            >
              <MaterialIcons name="schedule" size={20} color="#3F51B5" />
              <Text style={styles.cardValueSmall}>{formatSleepTime(lastNightData.duration + 15)}</Text>
              <Text style={styles.cardLabelSmall}>Time in Bed</Text>
            </LinearGradient>

            <LinearGradient
              colors={['rgba(156, 39, 176, 0.1)', 'rgba(156, 39, 176, 0.05)']}
              style={[styles.summaryCard, styles.cardSmall]}
            >
              <MaterialIcons name="trending-up" size={20} color="#9C27B0" />
              <Text style={styles.cardValueSmall}>{lastNightData.sleepEfficiency || 80}%</Text>
              <Text style={styles.cardLabelSmall}>Efficiency</Text>
            </LinearGradient>
          </View>
        </View>
      </View>
    );
  };

  const renderSleepStages = () => {
    if (!hasData) {
      return null; // Hide this section when no data
    }

    return (
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
        style={styles.section}
      >
        <Text style={styles.sectionTitle}>Sleep Stages</Text>
        <View style={styles.sleepStagesContainer}>
          <View style={styles.sleepStage}>
            <View style={[styles.stageIndicator, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.stageLabel}>Deep</Text>
            <Text style={styles.stageValue}>
              {lastNightData.deepSleep ? `${lastNightData.deepSleep}%` : 'N/A'}
            </Text>
          </View>
          <View style={styles.sleepStage}>
            <View style={[styles.stageIndicator, { backgroundColor: '#2196F3' }]} />
            <Text style={styles.stageLabel}>Light</Text>
            <Text style={styles.stageValue}>
              {lastNightData.lightSleep ? `${lastNightData.lightSleep}%` : 'N/A'}
            </Text>
          </View>
          <View style={styles.sleepStage}>
            <View style={[styles.stageIndicator, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.stageLabel}>REM</Text>
            <Text style={styles.stageValue}>
              {lastNightData.remSleep ? `${lastNightData.remSleep}%` : 'N/A'}
            </Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  const generateChartData = () => {
    const today = new Date();
    let data = [];

    switch (selectedPeriod) {
      case 'Day':
        // Single day data - today or most recent day with data
        const todayRecord = recentSleep.find(record =>
          new Date(record.date).toDateString() === today.toDateString()
        );

        if (todayRecord) {
          data.push({
            date: today,
            value: todayRecord.duration / 60,
            efficiency: todayRecord.sleepEfficiency || 0,
            quality: todayRecord.quality || 0,
            bedtime: todayRecord.bedtime,
            wakeTime: todayRecord.wakeTime,
            duration: todayRecord.duration,
            hasData: true,
          });
        } else if (recentSleep.length > 0) {
          // Show most recent data if today has no data
          const mostRecent = recentSleep[0];
          data.push({
            date: new Date(mostRecent.date),
            value: mostRecent.duration / 60,
            efficiency: mostRecent.sleepEfficiency || 0,
            quality: mostRecent.quality || 0,
            bedtime: mostRecent.bedtime,
            wakeTime: mostRecent.wakeTime,
            duration: mostRecent.duration,
            hasData: true,
          });
        }
        break;

      case 'Week':
        // Always show 7 days (Sunday to Saturday)
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);

          const sleepRecord = recentSleep.find(record =>
            new Date(record.date).toDateString() === date.toDateString()
          );

          data.push({
            date: date,
            value: sleepRecord ? sleepRecord.duration / 60 : 0,
            efficiency: sleepRecord?.sleepEfficiency || 0,
            quality: sleepRecord?.quality || 0,
            bedtime: sleepRecord?.bedtime || '',
            wakeTime: sleepRecord?.wakeTime || '',
            duration: sleepRecord?.duration || 0,
            hasData: !!sleepRecord,
          });
        }
        break;

      case 'Month':
        // Show all days of current month
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(currentYear, currentMonth, day);

          const sleepRecord = recentSleep.find(record =>
            new Date(record.date).toDateString() === date.toDateString()
          );

          data.push({
            date: date,
            value: sleepRecord ? sleepRecord.duration / 60 : 0,
            efficiency: sleepRecord?.sleepEfficiency || 0,
            quality: sleepRecord?.quality || 0,
            bedtime: sleepRecord?.bedtime || '',
            wakeTime: sleepRecord?.wakeTime || '',
            duration: sleepRecord?.duration || 0,
            hasData: !!sleepRecord,
            day: day,
          });
        }
        break;

      case '6M':
        // Show 6 months of aggregated data
        for (let i = 5; i >= 0; i--) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

          // Aggregate all sleep data for this month
          let monthlyTotal = 0;
          let daysWithData = 0;
          let totalEfficiency = 0;
          let totalQuality = 0;

          recentSleep.forEach(record => {
            const recordDate = new Date(record.date);
            if (recordDate >= monthStart && recordDate <= monthEnd) {
              monthlyTotal += record.duration;
              totalEfficiency += record.sleepEfficiency || 0;
              totalQuality += record.quality || 0;
              daysWithData++;
            }
          });

          data.push({
            date: date,
            value: monthlyTotal / 60, // Total hours for the month
            efficiency: daysWithData > 0 ? totalEfficiency / daysWithData : 0,
            quality: daysWithData > 0 ? totalQuality / daysWithData : 0,
            duration: monthlyTotal,
            hasData: daysWithData > 0,
            daysWithData: daysWithData,
          });
        }
        break;

      case 'Year':
        // Show 12 months of current year
        for (let month = 0; month < 12; month++) {
          const date = new Date(today.getFullYear(), month, 1);
          const monthStart = new Date(date.getFullYear(), month, 1);
          const monthEnd = new Date(date.getFullYear(), month + 1, 0);

          // Aggregate all sleep data for this month
          let monthlyTotal = 0;
          let daysWithData = 0;
          let totalEfficiency = 0;
          let totalQuality = 0;

          recentSleep.forEach(record => {
            const recordDate = new Date(record.date);
            if (recordDate >= monthStart && recordDate <= monthEnd) {
              monthlyTotal += record.duration;
              totalEfficiency += record.sleepEfficiency || 0;
              totalQuality += record.quality || 0;
              daysWithData++;
            }
          });

          data.push({
            date: date,
            value: monthlyTotal / 60, // Total hours for the month
            efficiency: daysWithData > 0 ? totalEfficiency / daysWithData : 0,
            quality: daysWithData > 0 ? totalQuality / daysWithData : 0,
            duration: monthlyTotal,
            hasData: daysWithData > 0,
            daysWithData: daysWithData,
            monthName: date.toLocaleDateString('en', { month: 'short' }),
          });
        }
        break;
    }

    return data;
  };

  const renderDayView = () => {
    const chartData = generateChartData();
    const todayData = chartData[0];

    if (!todayData || !todayData.hasData) {
      return (
        <View style={styles.dayViewContainer}>
          <Text style={styles.dayViewTitle}>Today's Sleep</Text>
          <View style={styles.noDataDay}>
            <MaterialIcons name="bedtime" size={48} color="#404040" />
            <Text style={styles.noDataDayText}>No sleep data for today</Text>
            <Text style={styles.noDataDaySubtext}>Tap + to log your sleep</Text>
          </View>
        </View>
      );
    }

    // Parse times for timeline - ensure we have valid time strings
    if (!todayData.bedtime || !todayData.wakeTime) {
      return (
        <View style={styles.dayViewContainer}>
          <Text style={styles.dayViewTitle}>Today's Sleep</Text>
          <View style={styles.noDataDay}>
            <MaterialIcons name="bedtime" size={48} color="#404040" />
            <Text style={styles.noDataDayText}>Incomplete sleep data</Text>
            <Text style={styles.noDataDaySubtext}>Missing bedtime or wake time</Text>
          </View>
        </View>
      );
    }

    const bedtimeParts = todayData.bedtime.split(':');
    const waketimeParts = todayData.wakeTime.split(':');

    let bedtimeMinutes = parseInt(bedtimeParts[0]) * 60 + parseInt(bedtimeParts[1]);
    let waketimeMinutes = parseInt(waketimeParts[0]) * 60 + parseInt(waketimeParts[1]);

    // Handle overnight sleep (bedtime after midnight)
    if (waketimeMinutes < bedtimeMinutes) {
      waketimeMinutes += 24 * 60; // Add 24 hours
    }

    // Calculate timeline positioning for 24-hour view (6 PM to 6 PM next day)
    // This creates a more intuitive sleep timeline centered around typical sleep hours
    const timelineStart = 18 * 60; // 6 PM
    const timelineDuration = 24 * 60; // 24 hours total

    // Adjust positions relative to timeline window
    let bedtimePos = bedtimeMinutes;
    let waketimePos = waketimeMinutes;

    // If bedtime is before 6 PM, it's next day
    if (bedtimeMinutes < timelineStart) {
      bedtimePos = bedtimeMinutes + 24 * 60;
    }

    // Calculate positions as percentages of the timeline
    const bedtimePercent = ((bedtimePos - timelineStart) / timelineDuration) * 100;
    const waketimePercent = ((waketimePos - timelineStart) / timelineDuration) * 100;
    const sleepDurationPercent = (todayData.duration / timelineDuration) * 100;

    const formatTime12Hour = (time24: string) => {
      const [hours, minutes] = time24.split(':');
      const hour12 = parseInt(hours) % 12 || 12;
      const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    };

    // Generate dynamic time scale based on sleep period
    const generateTimeScale = () => {
      const scalePoints = [];
      for (let i = 0; i <= 4; i++) {
        const minutes = timelineStart + (i * 6 * 60); // Every 6 hours
        const hours = Math.floor((minutes % (24 * 60)) / 60);
        const displayHours = hours % 12 || 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        scalePoints.push(`${displayHours} ${ampm}`);
      }
      return scalePoints;
    };

    return (
      <View style={styles.dayViewContainer}>
        <Text style={styles.dayViewTitle}>
          {todayData.date.toLocaleDateString('en', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </Text>

        {/* Sleep Timeline */}
        <View style={styles.sleepTimeline}>
          <View style={styles.timelineHeader}>
            <Text style={styles.timelineLabel}>Sleep Timeline</Text>
            <Text style={styles.totalDuration}>
              Total: {Math.floor(todayData.duration / 60)}h {todayData.duration % 60}m
            </Text>
          </View>

          <View style={styles.timelineBar}>
            {/* Background timeline (24 hours) */}
            <View style={styles.timelineBackground} />

            {/* Sleep period */}
            <View
              style={[
                styles.sleepPeriod,
                {
                  left: `${Math.max(0, Math.min(bedtimePercent, 100))}%`,
                  width: `${Math.max(0, Math.min(sleepDurationPercent, 100 - bedtimePercent))}%`,
                }
              ]}
            >
              <LinearGradient
                colors={['#4CAF50', '#8BC34A']}
                style={styles.sleepGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              />
            </View>

            {/* Time markers - Only show if within timeline bounds */}
            {bedtimePercent >= 0 && bedtimePercent <= 100 && (
              <View style={[styles.timeMarker, { left: `${bedtimePercent}%` }]}>
                <View style={[styles.markerDot, { borderColor: '#4CAF50', backgroundColor: '#4CAF50' }]} />
                <Text style={styles.markerTime}>{formatTime12Hour(todayData.bedtime!)}</Text>
                <Text style={styles.markerLabel}>Bedtime</Text>
              </View>
            )}

            {waketimePercent >= 0 && waketimePercent <= 100 && (
              <View style={[styles.timeMarker, { left: `${waketimePercent}%` }]}>
                <View style={[styles.markerDot, { borderColor: '#FF9800', backgroundColor: '#FF9800' }]} />
                <Text style={styles.markerTime}>{formatTime12Hour(todayData.wakeTime!)}</Text>
                <Text style={styles.markerLabel}>Wake Time</Text>
              </View>
            )}
          </View>

          {/* Time scale */}
          <View style={styles.timeScale}>
            {generateTimeScale().map((time, index) => (
              <Text key={index} style={styles.scaleLabel}>{time}</Text>
            ))}
          </View>
        </View>

        {/* Sleep Quality & Efficiency */}
        <View style={styles.dayMetrics}>
          <View style={styles.dayMetric}>
            <Text style={styles.metricValue}>{todayData.quality}/5</Text>
            <Text style={styles.metricLabel}>Quality</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map(star => (
                <MaterialIcons
                  key={star}
                  name="star"
                  size={16}
                  color={star <= todayData.quality ? '#FFD700' : '#404040'}
                />
              ))}
            </View>
          </View>

          <View style={styles.dayMetric}>
            <Text style={styles.metricValue}>{todayData.efficiency}%</Text>
            <Text style={styles.metricLabel}>Efficiency</Text>
            <View style={[styles.efficiencyBar, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
              <View
                style={[
                  styles.efficiencyFill,
                  {
                    width: `${todayData.efficiency}%`,
                    backgroundColor: todayData.efficiency >= 85 ? '#4CAF50' :
                                   todayData.efficiency >= 70 ? '#FF9800' : '#F44336'
                  }
                ]}
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderWeekView = () => {
    const chartData = generateChartData(); // This now always returns 7 days
    const hasAnyData = chartData.some(item => item.hasData);

    if (!hasAnyData) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Weekly Sleep Duration</Text>
          <View style={styles.noDataChart}>
            <MaterialIcons name="trending-up" size={48} color="#404040" />
            <Text style={styles.noDataText}>No sleep data this week</Text>
            <Text style={styles.noDataSubtext}>Start logging your sleep to see trends</Text>
          </View>
        </View>
      );
    }

    // Calculate max value from actual data, ensure minimum scale
    const dataValues = chartData.filter(d => d.hasData).map(d => d.value);
    const maxValue = Math.max(...dataValues, 8); // Minimum scale of 8 hours
    const chartHeight = 120;
    const chartWidth = width - 80;
    const barWidth = chartWidth / 7;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Weekly Sleep Duration</Text>

        {/* Chart Background Grid */}
        <View style={styles.chartGrid}>
          {[0, 1, 2, 3, 4].map(i => (
            <View key={i} style={[styles.gridLine, { top: (i * chartHeight) / 4 }]} />
          ))}
        </View>

        {/* Chart Bars */}
        <View style={styles.chartBars}>
          {chartData.map((dayData, index) => {
            const barHeight = dayData.hasData
              ? ((dayData.value / maxValue) * chartHeight)
              : 0;

            const isToday = dayData.date.toDateString() === new Date().toDateString();

            return (
              <TouchableOpacity
                key={index}
                style={styles.barContainer}
                onPress={() => dayData.hasData && handleDayPress(dayData)}
                activeOpacity={0.7}
              >
                {/* Bar */}
                {dayData.hasData ? (
                  <LinearGradient
                    colors={isToday ? ['#4CAF50', '#8BC34A'] : ['#2196F3', '#64B5F6']}
                    style={[
                      styles.chartBar,
                      {
                        height: Math.max(barHeight, 8),
                        width: barWidth - 12,
                      },
                    ]}
                  />
                ) : (
                  <View style={[
                    styles.chartBar,
                    {
                      height: 8,
                      width: barWidth - 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      borderStyle: 'dashed',
                    },
                  ]} />
                )}

                {/* Day Label */}
                <Text style={styles.barLabel}>
                  {dayData.date.toLocaleDateString('en', { weekday: 'short' })}
                </Text>

                {/* Value */}
                <Text style={[styles.barValue, {
                  color: dayData.hasData ? '#ffffff' : '#808080'
                }]}>
                  {dayData.hasData ? `${dayData.value.toFixed(1)}h` : '--'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Chart Y-axis Labels */}
        <View style={styles.chartLabels}>
          <Text style={styles.chartLabel}>0h</Text>
          <Text style={styles.chartLabel}>{(maxValue/2).toFixed(1)}h</Text>
          <Text style={styles.chartLabel}>{maxValue.toFixed(1)}h</Text>
        </View>
      </View>
    );
  };

  const renderMonthView = () => {
    const chartData = generateChartData(); // All days of current month
    const hasAnyData = chartData.some(item => item.hasData);

    // Calculate monthly total
    const monthlyTotal = chartData.reduce((sum, day) => sum + (day.hasData ? day.value : 0), 0);
    const currentMonth = new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' });

    if (!hasAnyData) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Monthly Sleep - {currentMonth}</Text>
          <Text style={styles.monthlyTotal}>Total: 0h this month</Text>
          <View style={styles.noDataChart}>
            <MaterialIcons name="calendar-today" size={48} color="#404040" />
            <Text style={styles.noDataText}>No sleep data this month</Text>
            <Text style={styles.noDataSubtext}>Start logging daily to see monthly trends</Text>
          </View>
        </View>
      );
    }

    const dataValues = chartData.filter(d => d.hasData).map(d => d.value);
    const maxValue = Math.max(...dataValues, 10);
    const chartHeight = 100;
    const chartWidth = width - 40;
    const barWidth = Math.max((chartWidth - 20) / chartData.length, 8);

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Monthly Sleep - {currentMonth}</Text>
        <Text style={styles.monthlyTotal}>Total: {monthlyTotal.toFixed(0)}h this month</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.monthChartScroll}
        >
          <View style={[styles.chartBars, { width: Math.max(chartWidth, chartData.length * 12) }]}>
            {chartData.map((dayData, index) => {
              const barHeight = dayData.hasData
                ? ((dayData.value / maxValue) * chartHeight)
                : 0;

              const isToday = dayData.date.toDateString() === new Date().toDateString();

              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.barContainer, { width: barWidth }]}
                  onPress={() => dayData.hasData && handleDayPress(dayData)}
                  activeOpacity={0.7}
                >
                  {dayData.hasData ? (
                    <LinearGradient
                      colors={isToday ? ['#4CAF50', '#8BC34A'] : ['#2196F3', '#64B5F6']}
                      style={[
                        styles.chartBar,
                        {
                          height: Math.max(barHeight, 6),
                          width: barWidth - 2,
                        },
                      ]}
                    />
                  ) : (
                    <View style={[
                      styles.chartBar,
                      {
                        height: 6,
                        width: barWidth - 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    ]} />
                  )}

                  <Text style={[styles.barLabel, { fontSize: 9 }]}>
                    {dayData.day}
                  </Text>

                  {dayData.hasData && (
                    <Text style={[styles.barValue, { fontSize: 8 }]}>
                      {dayData.value.toFixed(1)}h
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  const render6MonthView = () => {
    const chartData = generateChartData(); // 6 months of aggregated data
    const hasAnyData = chartData.some(item => item.hasData);

    if (!hasAnyData) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>6 Month Sleep Totals</Text>
          <View style={styles.noDataChart}>
            <MaterialIcons name="show-chart" size={48} color="#404040" />
            <Text style={styles.noDataText}>No sleep data available</Text>
            <Text style={styles.noDataSubtext}>Log your sleep to see 6-month trends</Text>
          </View>
        </View>
      );
    }

    const dataValues = chartData.filter(d => d.hasData).map(d => d.value);
    const maxValue = Math.max(...dataValues);
    const chartHeight = 120;
    const barWidth = (width - 100) / 6;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>6 Month Sleep Totals (Hours)</Text>

        <View style={styles.chartBars}>
          {chartData.map((monthData, index) => {
            const barHeight = monthData.hasData
              ? ((monthData.value / maxValue) * chartHeight)
              : 0;

            return (
              <TouchableOpacity
                key={index}
                style={styles.barContainer}
                onPress={() => monthData.hasData && handleDayPress(monthData)}
                activeOpacity={0.7}
              >
                {monthData.hasData ? (
                  <LinearGradient
                    colors={['#9C27B0', '#E1BEE7']}
                    style={[
                      styles.chartBar,
                      {
                        height: Math.max(barHeight, 10),
                        width: barWidth - 8,
                      },
                    ]}
                  />
                ) : (
                  <View style={[
                    styles.chartBar,
                    {
                      height: 10,
                      width: barWidth - 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  ]} />
                )}

                <Text style={styles.barLabel}>
                  {monthData.date.toLocaleDateString('en', { month: 'short' })}
                </Text>
                <Text style={styles.barValue}>
                  {monthData.hasData ? `${monthData.value.toFixed(0)}h` : '--'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderYearView = () => {
    const chartData = generateChartData(); // 12 months of current year
    const hasAnyData = chartData.some(item => item.hasData);

    // Calculate yearly total
    const yearlyTotal = chartData.reduce((sum, month) => sum + (month.hasData ? month.value : 0), 0);
    const currentYear = new Date().getFullYear();

    if (!hasAnyData) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{currentYear} Sleep Overview</Text>
          <Text style={styles.monthlyTotal}>Total: 0h this year</Text>
          <View style={styles.noDataChart}>
            <MaterialIcons name="calendar-view-month" size={48} color="#404040" />
            <Text style={styles.noDataText}>No sleep data this year</Text>
            <Text style={styles.noDataSubtext}>Start tracking to see yearly patterns</Text>
          </View>
        </View>
      );
    }

    const dataValues = chartData.filter(d => d.hasData).map(d => d.value);
    const maxValue = Math.max(...dataValues);
    const chartHeight = 120;
    const barWidth = (width - 80) / 12;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{currentYear} Sleep Overview</Text>
        <Text style={styles.monthlyTotal}>Total: {yearlyTotal.toFixed(0)}h this year</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.monthChartScroll}
        >
          <View style={[styles.chartBars, { width: Math.max(width - 40, 12 * 60) }]}>
            {chartData.map((monthData, index) => {
              const barHeight = monthData.hasData
                ? ((monthData.value / maxValue) * chartHeight)
                : 0;

              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.barContainer, { width: Math.max(barWidth, 50) }]}
                  onPress={() => monthData.hasData && handleDayPress(monthData)}
                  activeOpacity={0.7}
                >
                  {monthData.hasData ? (
                    <LinearGradient
                      colors={['#FF5722', '#FFAB91']}
                      style={[
                        styles.chartBar,
                        {
                          height: Math.max(barHeight, 10),
                          width: Math.max(barWidth - 8, 42),
                        },
                      ]}
                    />
                  ) : (
                    <View style={[
                      styles.chartBar,
                      {
                        height: 10,
                        width: Math.max(barWidth - 8, 42),
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    ]} />
                  )}

                  <Text style={styles.barLabel}>
                    {monthData.monthName}
                  </Text>
                  <Text style={styles.barValue}>
                    {monthData.hasData ? `${monthData.value.toFixed(0)}h` : '--'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderSleepChart = () => {
    if (selectedPeriod === 'Day') {
      return renderDayView();
    } else if (selectedPeriod === 'Week') {
      return renderWeekView();
    } else if (selectedPeriod === 'Month') {
      return renderMonthView();
    } else if (selectedPeriod === '6M') {
      return render6MonthView();
    } else if (selectedPeriod === 'Year') {
      return renderYearView();
    }

    return null;
  };

  const renderSleepQualityTrend = () => {
    const chartData = generateChartData();
    const avgQuality = chartData.reduce((sum, item) => sum + item.quality, 0) / chartData.length;

    return (
      <View style={styles.trendContainer}>
        <Text style={styles.trendTitle}>Sleep Quality Trend</Text>
        <View style={styles.qualityIndicators}>
          {chartData.slice(-7).map((item, index) => (
            <View key={index} style={styles.qualityDay}>
              <View style={[
                styles.qualityDot,
                {
                  backgroundColor: item.quality >= 4 ? '#4CAF50' :
                                 item.quality >= 3 ? '#FF9800' : '#F44336',
                  opacity: 0.3 + (item.quality / 5) * 0.7,
                }
              ]} />
              <Text style={styles.qualityLabel}>
                {item.date.toLocaleDateString('en', { weekday: 'short' })}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.averageQuality}>
          <Text style={styles.averageLabel}>Weekly Average</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <MaterialIcons
                key={star}
                name="star"
                size={20}
                color={star <= avgQuality ? '#FFD700' : '#404040'}
              />
            ))}
          </View>
          <Text style={styles.averageText}>{avgQuality.toFixed(1)}/5</Text>
        </View>
      </View>
    );
  };

  const renderChartFilters = () => (
    <LinearGradient
      colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
      style={styles.section}
    >
      <Text style={styles.sectionTitle}>Sleep Trends</Text>
      <View style={styles.periodButtons}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive,
            ]}
            onPress={() => handlePeriodChange(period as typeof selectedPeriod)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive,
              ]}
            >
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sleep Duration Chart */}
      <Animated.View
        style={{
          opacity: chartAnimation,
          transform: [
            {
              scale: chartAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              }),
            },
          ],
        }}
      >
        {renderSleepChart()}
      </Animated.View>

      {/* Sleep Quality Trend */}
      <Animated.View
        style={{
          opacity: chartAnimation,
          transform: [
            {
              scale: chartAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              }),
            },
          ],
        }}
      >
        {renderSleepQualityTrend()}
      </Animated.View>

      {/* Sleep Efficiency Insight */}
      <View style={styles.efficiencyInsight}>
        <MaterialIcons name="insights" size={24} color="#2196F3" />
        <View style={styles.efficiencyContent}>
          <Text style={styles.efficiencyTitle}>Sleep Efficiency</Text>
          <Text style={styles.efficiencyDescription}>
            Your average sleep efficiency this {selectedPeriod.toLowerCase()} is{' '}
            <Text style={styles.efficiencyValue}>
              {stats?.weeklyAverage.sleepEfficiency.toFixed(0) || '85'}%
            </Text>
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderSleepSchedule = () => (
    <LinearGradient
      colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
      style={styles.section}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sleep Schedule</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setShowSleepScheduleModal(true)}
        >
          <MaterialIcons name="edit" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.scheduleContainer}>
        <View style={styles.scheduleItem}>
          <MaterialIcons name="bedtime" size={24} color="#FF9800" />
          <View style={styles.scheduleInfo}>
            <Text style={styles.scheduleLabel}>Bedtime Goal</Text>
            <Text style={styles.scheduleTime}>{sleepGoals.bedtime}</Text>
          </View>
        </View>

        <View style={styles.scheduleItem}>
          <MaterialIcons name="alarm" size={24} color="#4CAF50" />
          <View style={styles.scheduleInfo}>
            <Text style={styles.scheduleLabel}>Wake Up Goal</Text>
            <Text style={styles.scheduleTime}>{sleepGoals.wakeTime}</Text>
          </View>
        </View>
      </View>

      <View style={styles.consistencyContainer}>
        <Text style={styles.consistencyLabel}>Weekly Consistency</Text>
        <View style={styles.consistencyBar}>
          <LinearGradient
            colors={['#4CAF50', '#8BC34A']}
            style={[styles.consistencyFill, { width: `${stats?.consistency || 0}%` }]}
          />
        </View>
        <Text style={styles.consistencyValue}>{Math.round(stats?.consistency || 0)}%</Text>
      </View>
    </LinearGradient>
  );

  const renderInsights = () => (
    <LinearGradient
      colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
      style={styles.section}
    >
      <Text style={styles.sectionTitle}>Insights & Trends</Text>

      {insights.length > 0 ? (
        insights.map((insight) => (
          <View key={insight.id} style={styles.insightItem}>
            <MaterialIcons
              name={insight.icon as any}
              size={20}
              color={insight.color}
            />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightText}>{insight.description}</Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.insightItem}>
          <MaterialIcons name="lightbulb" size={20} color="#FFC107" />
          <Text style={styles.insightText}>
            Track more sleep data to get personalized insights
          </Text>
        </View>
      )}
    </LinearGradient>
  );

  const renderArticles = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Sleep Articles & Tips</Text>
      {articles.map((article) => (
        <TouchableOpacity key={article.id} style={styles.articleCard}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
            style={styles.articleGradient}
          >
            <View style={styles.articleIcon}>
              <Text style={styles.articleEmoji}>{article.image}</Text>
            </View>
            <View style={styles.articleContent}>
              <Text style={styles.articleTitle}>{article.title}</Text>
              <Text style={styles.articleSubtitle}>{article.subtitle}</Text>
              <Text style={styles.articleReadTime}>{article.readTime}</Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={16} color={colors.textSecondary} />
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTooltip = () => {
    if (!showTooltip || !selectedDayData) return null;

    const formatTime12Hour = (time24: string) => {
      if (!time24) return 'N/A';
      const [hours, minutes] = time24.split(':');
      const hour12 = parseInt(hours) % 12 || 12;
      const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    };

    const isMonthlyOrYearlyData = selectedDayData.daysWithData !== undefined;
    const isDailyData = selectedDayData.bedtime && selectedDayData.wakeTime;

    return (
      <TouchableOpacity
        style={styles.tooltipOverlay}
        activeOpacity={1}
        onPress={hideTooltip}
      >
        <Animated.View
          style={[
            styles.tooltipContainer,
            {
              opacity: tooltipAnimation,
              transform: [
                {
                  scale: tooltipAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#1a1a2e', '#16213e', '#0f3460']}
            style={StyleSheet.absoluteFill}
          />

          <Text style={styles.tooltipTitle}>
            {isMonthlyOrYearlyData
              ? selectedDayData.date.toLocaleDateString('en', { month: 'long', year: 'numeric' })
              : selectedDayData.date.toLocaleDateString('en', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })
            }
          </Text>

          <View style={styles.tooltipContent}>
            {isMonthlyOrYearlyData ? (
              // Monthly/Yearly aggregated data tooltip
              <>
                <View style={styles.tooltipRow}>
                  <Text style={styles.tooltipLabel}>Total Sleep Hours</Text>
                  <Text style={styles.tooltipValue}>
                    {selectedDayData.value.toFixed(0)}h
                  </Text>
                </View>

                <View style={styles.tooltipRow}>
                  <Text style={styles.tooltipLabel}>Days with Data</Text>
                  <Text style={styles.tooltipValue}>
                    {selectedDayData.daysWithData} days
                  </Text>
                </View>

                <View style={styles.tooltipRow}>
                  <Text style={styles.tooltipLabel}>Average Sleep Quality</Text>
                  <View style={styles.tooltipQuality}>
                    <Text style={styles.tooltipValue}>{selectedDayData.quality?.toFixed(1) || 0}/5</Text>
                    <View style={{ flexDirection: 'row' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <MaterialIcons
                          key={star}
                          name="star"
                          size={16}
                          color={star <= (selectedDayData.quality || 0) ? '#FFD700' : '#404040'}
                        />
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.tooltipRow}>
                  <Text style={styles.tooltipLabel}>Average Efficiency</Text>
                  <Text style={[
                    styles.tooltipValue,
                    {
                      color: selectedDayData.efficiency >= 85 ? '#4CAF50' :
                             selectedDayData.efficiency >= 70 ? '#FF9800' : '#F44336'
                    }
                  ]}>
                    {selectedDayData.efficiency?.toFixed(0) || 0}%
                  </Text>
                </View>
              </>
            ) : isDailyData ? (
              // Daily data tooltip
              <>
                <View style={styles.tooltipRow}>
                  <Text style={styles.tooltipLabel}>Bedtime</Text>
                  <Text style={styles.tooltipValue}>
                    {formatTime12Hour(selectedDayData.bedtime)}
                  </Text>
                </View>

                <View style={styles.tooltipRow}>
                  <Text style={styles.tooltipLabel}>Wake Time</Text>
                  <Text style={styles.tooltipValue}>
                    {formatTime12Hour(selectedDayData.wakeTime)}
                  </Text>
                </View>

                <View style={styles.tooltipRow}>
                  <Text style={styles.tooltipLabel}>Duration</Text>
                  <Text style={styles.tooltipValue}>
                    {Math.floor(selectedDayData.duration / 60)}h {selectedDayData.duration % 60}m
                  </Text>
                </View>

                <View style={styles.tooltipRow}>
                  <Text style={styles.tooltipLabel}>Quality</Text>
                  <View style={styles.tooltipQuality}>
                    <Text style={styles.tooltipValue}>{selectedDayData.quality || 0}/5</Text>
                    <View style={{ flexDirection: 'row' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <MaterialIcons
                          key={star}
                          name="star"
                          size={16}
                          color={star <= (selectedDayData.quality || 0) ? '#FFD700' : '#404040'}
                        />
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.tooltipRow}>
                  <Text style={styles.tooltipLabel}>Efficiency</Text>
                  <Text style={[
                    styles.tooltipValue,
                    {
                      color: selectedDayData.efficiency >= 85 ? '#4CAF50' :
                             selectedDayData.efficiency >= 70 ? '#FF9800' : '#F44336'
                    }
                  ]}>
                    {selectedDayData.efficiency || 0}%
                  </Text>
                </View>
              </>
            ) : (
              // Simple data tooltip (Week view)
              <>
                <View style={styles.tooltipRow}>
                  <Text style={styles.tooltipLabel}>Sleep Duration</Text>
                  <Text style={styles.tooltipValue}>
                    {selectedDayData.value > 0 ? `${selectedDayData.value.toFixed(1)}h` : 'No data'}
                  </Text>
                </View>

                {selectedDayData.hasData && (
                  <>
                    <View style={styles.tooltipRow}>
                      <Text style={styles.tooltipLabel}>Quality</Text>
                      <Text style={styles.tooltipValue}>{selectedDayData.quality || 0}/5</Text>
                    </View>

                    <View style={styles.tooltipRow}>
                      <Text style={styles.tooltipLabel}>Efficiency</Text>
                      <Text style={styles.tooltipValue}>{selectedDayData.efficiency || 0}%</Text>
                    </View>
                  </>
                )}
              </>
            )}
          </View>

          <TouchableOpacity style={styles.tooltipCloseButton} onPress={hideTooltip}>
            <Text style={styles.tooltipCloseText}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {renderHeader()}
        {renderSummaryCards()}
        {renderSleepStages()}
        {hasData ? renderChartFilters() : null}
        {renderSleepSchedule()}
        {hasData ? renderInsights() : null}
        {renderArticles()}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowSleepLogModal(true)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.primary, '#42A5F5']}
          style={styles.fab}
        >
          <MaterialIcons name="add" size={28} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Sleep Log Modal */}
      <SleepLogModal
        visible={showSleepLogModal}
        onClose={() => setShowSleepLogModal(false)}
      />

      {/* Sleep Schedule Modal */}
      <SleepScheduleModal
        visible={showSleepScheduleModal}
        onClose={() => setShowSleepScheduleModal(false)}
        currentGoals={sleepGoals}
        onUpdateGoals={handleUpdateSleepGoals}
        isLoading={isLoading}
      />

      {/* Tooltip */}
      {renderTooltip()}
    </SafeAreaView>
  );
};

export default SleepScreen;
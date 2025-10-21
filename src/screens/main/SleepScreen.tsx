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
import { BarChart } from 'react-native-chart-kit';
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
import SleepArticleModal from '../../components/SleepArticleModal';

const { width } = Dimensions.get('window');

// Sample data generator for demo purposes
const generateSampleData = (period: string) => {
  const today = new Date();
  const data: any[] = [];

  switch (period) {
    case 'Week':
      // Generate 7 days of data with realistic variations (6-8 hours)
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        data.push({
          date: date,
          value: 6.5 + Math.random() * 1.5, // 6.5-8 hours
          efficiency: 75 + Math.random() * 20, // 75-95%
          quality: 3 + Math.random() * 2, // 3-5 stars
          hasData: true,
        });
      }
      break;

    case 'Month':
      // Generate current month data
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(today.getFullYear(), today.getMonth(), day);
        data.push({
          date: date,
          value: 6.5 + Math.random() * 1.5,
          efficiency: 75 + Math.random() * 20,
          quality: 3 + Math.random() * 2,
          hasData: day <= today.getDate(),
          day: day,
        });
      }
      break;

    case '6M':
      // Generate 6 months of weekly averages
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const weeksInMonth = 4;
        const totalHours = (6.5 + Math.random() * 1.5) * 7 * weeksInMonth;
        data.push({
          date: date,
          value: totalHours,
          efficiency: 75 + Math.random() * 20,
          quality: 3 + Math.random() * 2,
          hasData: true,
          daysWithData: 7 * weeksInMonth,
        });
      }
      break;

    case 'Year':
      // Generate 12 months of data
      for (let month = 0; month < 12; month++) {
        const date = new Date(today.getFullYear(), month, 1);
        const daysInMonth = new Date(today.getFullYear(), month + 1, 0).getDate();
        const totalHours = (6.5 + Math.random() * 1.5) * daysInMonth;
        data.push({
          date: date,
          value: totalHours,
          efficiency: 75 + Math.random() * 20,
          quality: 3 + Math.random() * 2,
          hasData: month <= today.getMonth(),
          daysWithData: month <= today.getMonth() ? daysInMonth : 0,
          monthName: date.toLocaleDateString('en', { month: 'short' }),
        });
      }
      break;
  }

  return data;
};

const SleepScreen: React.FC = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showSleepLogModal, setShowSleepLogModal] = useState(false);
  const [showSleepScheduleModal, setShowSleepScheduleModal] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState<any>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
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
      content: `##Understanding Deep Sleep
Deep sleep, also known as slow-wave sleep, is the most restorative stage of sleep. During this phase, your body undergoes critical repair and regeneration processes.

##Why Deep Sleep Matters
- Tissue growth and repair occurs during deep sleep
- Energy is restored throughout the body
- Hormones are released, including growth hormone
- Memory consolidation happens in the brain
- The immune system is strengthened

##Benefits of Quality Deep Sleep
Your brain waves slow down significantly during deep sleep, allowing your body to focus on physical restoration. This stage typically makes up 15-25% of total sleep time in adults.

##How to Increase Deep Sleep
- Maintain a consistent sleep schedule
- Exercise regularly, but not close to bedtime
- Avoid caffeine and alcohol before sleep
- Keep your bedroom cool (60-67°F is ideal)
- Use blackout curtains to eliminate light
- Practice relaxation techniques before bed

##What Reduces Deep Sleep
Factors that can decrease deep sleep include stress, irregular sleep patterns, alcohol consumption, and aging. Understanding these factors helps you optimize your sleep routine.`,
    },
    {
      id: 2,
      title: 'Creating the Perfect Sleep Environment',
      subtitle: 'Tips for better sleep quality',
      image: '🛏️',
      readTime: '3 min read',
      content: `##Optimizing Your Sleep Space
Your bedroom environment plays a crucial role in sleep quality. Small changes can make a significant difference in how well you rest.

##Temperature Control
- Keep your bedroom between 60-67°F (15-19°C)
- Use breathable bedding materials
- Consider a fan for air circulation
- Adjust layers based on the season

##Light Management
- Install blackout curtains or blinds
- Remove or cover electronic displays
- Use a sleep mask if needed
- Avoid blue light 1-2 hours before bed

##Sound Optimization
- Use white noise machines to mask disruptions
- Try earplugs if you live in a noisy area
- Keep phones on silent or do not disturb mode
- Consider soundproofing if traffic is an issue

##Bedding Essentials
- Invest in a comfortable, supportive mattress
- Replace pillows every 1-2 years
- Use high-quality, breathable sheets
- Choose the right firmness for your sleep position

##Additional Tips
Remove work materials and electronics from your bedroom to create a dedicated sleep sanctuary. Keep the space clean and clutter-free to promote relaxation.`,
    },
    {
      id: 3,
      title: 'Sleep and Exercise Connection',
      subtitle: 'How workout timing affects sleep',
      image: '💪',
      readTime: '4 min read',
      content: `##Exercise and Sleep Quality
Regular physical activity is one of the most effective ways to improve sleep quality. Understanding when and how to exercise can maximize these benefits.

##Benefits of Exercise for Sleep
- Helps you fall asleep faster
- Increases time spent in deep sleep
- Reduces stress and anxiety
- Regulates your circadian rhythm
- Improves sleep quality in insomnia patients

##Best Times to Exercise
Morning and afternoon workouts can help regulate your sleep-wake cycle. Early exercise exposure to natural light helps reinforce your body's circadian rhythms.

##Evening Exercise Considerations
- Avoid intense workouts 2-3 hours before bed
- Light stretching or yoga can be beneficial
- High-intensity exercise raises body temperature
- Allow time for your body to cool down

##Recommended Activities
- Aerobic exercise: walking, running, cycling
- Strength training: 2-3 times per week
- Yoga and stretching: great for evening
- Swimming: low-impact and effective

##Finding Your Sweet Spot
Everyone's body responds differently to exercise timing. Track your workouts and sleep quality to find what works best for you. Consistency is more important than perfection.

##Recovery and Rest
Remember that quality sleep is essential for exercise recovery. Balance your workout intensity with adequate rest to maximize both fitness and sleep benefits.`,
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
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.card,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerText: {
      flex: 1,
    },
    greeting: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    lastNightSummary: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    sleepQualityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
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
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    noDataSummarySubtext: {
      fontSize: 14,
      color: colors.textSecondary,
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
      marginTop: 20,
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
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 20,
      alignItems: 'center',
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
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
    cardEqual: {
      flex: 1,
      minHeight: 120,
    },
    cardValue: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 8,
    },
    cardValueSmall: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 4,
    },
    cardLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    cardLabelSmall: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    cardSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    section: {
      paddingHorizontal: 20,
      marginTop: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    editButton: {
      padding: 8,
    },
    sleepStagesCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 20,
      marginBottom: 16,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
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
      color: colors.textSecondary,
      marginBottom: 4,
    },
    stageValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    filtersContainer: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    periodButtons: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
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
      color: colors.textSecondary,
      fontWeight: '500',
    },
    periodButtonTextActive: {
      color: '#ffffff',
      fontWeight: '600',
    },
    scheduleCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
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
      color: colors.textSecondary,
    },
    scheduleTime: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginTop: 2,
    },
    consistencyContainer: {
      alignItems: 'center',
    },
    consistencyLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    consistencyBar: {
      width: '100%',
      height: 8,
      backgroundColor: colors.surface,
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
      color: colors.text,
    },
    insightCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    insightItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    insightText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: 12,
      flex: 1,
    },
    articleCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    articleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    articleIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.surface,
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
      color: colors.text,
      marginBottom: 4,
    },
    articleSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    articleReadTime: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    noDataContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    noDataTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 20,
      marginBottom: 8,
    },
    noDataSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    insightContent: {
      flex: 1,
      marginLeft: 12,
    },
    insightTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    chartContainer: {
      marginTop: 20,
      marginBottom: 20,
      minHeight: 200,
      position: 'relative',
      paddingBottom: 10,
    },
    chartTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    chartGrid: {
      position: 'absolute',
      width: '100%',
      height: 120,
      bottom: 0,
      left: 0,
      right: 0,
    },
    gridLine: {
      position: 'absolute',
      width: '100%',
      height: 1,
      backgroundColor: colors.border,
      opacity: 0.3,
    },
    chartBars: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-around',
      height: 120,
      paddingHorizontal: 10,
      position: 'relative',
    },
    barContainer: {
      alignItems: 'center',
      flex: 1,
      position: 'relative',
    },
    chartBar: {
      borderRadius: 4,
    },
    barLabel: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 8,
      textAlign: 'center',
    },
    barValue: {
      fontSize: 10,
      color: colors.text,
      marginTop: 2,
      fontWeight: '600',
      textAlign: 'center',
    },
    chartLabels: {
      position: 'absolute',
      left: -15,
      bottom: 0,
      height: 120,
      justifyContent: 'space-between',
      flexDirection: 'column-reverse',
    },
    chartLabel: {
      fontSize: 10,
      color: colors.textSecondary,
    },
    monthlyTotal: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.success,
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
      color: colors.text,
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
    qualityLabel: {
      fontSize: 10,
      color: colors.textSecondary,
    },
    averageQuality: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
    },
    averageLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    starsContainer: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    averageText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    efficiencyInsight: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.info + '20',
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
      color: colors.text,
      marginBottom: 4,
    },
    efficiencyDescription: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    efficiencyValue: {
      color: colors.info,
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
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    noDataDay: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    noDataDayText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 12,
      marginBottom: 4,
    },
    noDataDaySubtext: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    sleepTimeline: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
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
      color: colors.text,
    },
    totalDuration: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.success,
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
      backgroundColor: colors.surface,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.text,
      marginBottom: 2,
      textAlign: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    markerLabel: {
      fontSize: 9,
      color: colors.textSecondary,
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
      color: colors.textSecondary,
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
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    metricValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    metricLabel: {
      fontSize: 12,
      color: colors.textSecondary,
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
      color: colors.textSecondary,
      marginTop: 12,
      marginBottom: 4,
    },
    noDataSubtext: {
      fontSize: 14,
      color: colors.textSecondary,
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
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 20,
      maxWidth: width - 40,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    tooltipTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
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
      color: colors.textSecondary,
    },
    tooltipValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
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
      elevation: 12,
      zIndex: 1000,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.4,
      shadowRadius: 10,
    },
    // Enhanced Chart Styles
    enhancedChartContainer: {
      backgroundColor: '#1A1A1A',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#2A2A2A',
      padding: 16,
      marginTop: 24,
      marginBottom: 24,
    },
    enhancedChartTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    comparisonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 6,
    },
    comparisonText: {
      fontSize: 13,
      fontWeight: '500',
    },
    chartInnerContainer: {
      position: 'relative',
      paddingLeft: 40,
      paddingRight: 8,
    },
    recommendedLine: {
      position: 'absolute',
      left: 40,
      right: 8,
      height: 1,
      zIndex: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    recommendedLineDash: {
      flex: 1,
      height: 1,
      backgroundColor: '#F59E0B',
      opacity: 0.5,
    },
    recommendedLabel: {
      fontSize: 10,
      color: '#F59E0B',
      marginLeft: 6,
      fontWeight: '500',
    },
    enhancedYAxisLabels: {
      position: 'absolute',
      left: 0,
      bottom: 40,
      height: 180,
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingRight: 8,
    },
    enhancedYAxisLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    enhancedGridContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 40,
    },
    enhancedGridLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: '#FFFFFF26',
    },
    enhancedChartBars: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    enhancedBarColumn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    enhancedBarWrapper: {
      alignItems: 'center',
      justifyContent: 'flex-end',
      width: '100%',
    },
    enhancedBar: {
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
      minHeight: 8,
    },
    barValueLabel: {
      position: 'absolute',
      top: -20,
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    enhancedXAxisLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
      marginTop: 8,
    },
    enhancedXAxisLabel: {
      flex: 1,
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
    },
    sleepInsight: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      borderRadius: 8,
      padding: 12,
      marginTop: 16,
      gap: 8,
    },
    sleepInsightText: {
      flex: 1,
      fontSize: 13,
      color: colors.text,
      fontWeight: '500',
    },
    qualityTrendContainer: {
      marginTop: 24,
      marginBottom: 16,
    },
    qualityTrendTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    qualityDotsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
      paddingHorizontal: 8,
    },
    qualityDotWrapper: {
      alignItems: 'center',
      flex: 1,
    },
    qualityDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginBottom: 8,
    },
    qualityDotLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    qualityConnectingLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: colors.border,
      opacity: 0.3,
      top: 5,
    },
    qualityLegend: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
    },
    qualityLegendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    qualityLegendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    qualityLegendText: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    // Day View Specific Styles
    daySummaryCards: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    daySummaryCard: {
      flex: 1,
      backgroundColor: '#1A1A1A',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: '#2A2A2A',
    },
    daySummaryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    goalIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    daySummaryValue: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    daySummaryLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    daySummarySubtext: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    stageDistributionContainer: {
      marginBottom: 20,
    },
    stageDistributionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    stageStackedBar: {
      flexDirection: 'row',
      height: 40,
      borderRadius: 8,
      overflow: 'hidden',
      marginBottom: 16,
    },
    stageSegment: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    stageSegmentText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    stageDetailsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    stageDetail: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    stageDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    stageDetailLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    stageDetailDuration: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    enhancedTimelineContainer: {
      marginBottom: 20,
    },
    timelineHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    timelineTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    timelineDuration: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    enhancedTimelineBar: {
      height: 60,
      position: 'relative',
      marginBottom: 12,
    },
    timelineGrid: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    timelineGridLine: {
      width: 1,
      height: '100%',
      backgroundColor: '#FFFFFF15',
    },
    midnightLine: {
      width: 2,
      height: '100%',
      backgroundColor: '#FFFFFF30',
    },
    sleepSegmentsContainer: {
      position: 'absolute',
      top: 18,
      left: '10%',
      flexDirection: 'row',
      height: 24,
      borderRadius: 12,
      overflow: 'hidden',
      width: '70%',
    },
    sleepSegment: {
      height: 24,
    },
    timelineMarker: {
      position: 'absolute',
      top: 0,
      alignItems: 'center',
    },
    timelineMarkerCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#2A2A2A',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#FFFFFF30',
    },
    timelineMarkerIcon: {
      fontSize: 20,
    },
    timelineMarkerTime: {
      fontSize: 11,
      color: colors.text,
      marginTop: 4,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    enhancedTimeScale: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
    },
    enhancedTimeScaleLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      letterSpacing: 0.5,
    },
    qualityScoreContainer: {
      marginBottom: 20,
    },
    qualityScoreTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    circularQualityIndicator: {
      alignItems: 'center',
      marginBottom: 20,
    },
    qualityCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 8,
      borderColor: '#10B981',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    qualityScoreNumber: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
    },
    qualityScoreMax: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    efficiencyBarContainer: {
      marginTop: 16,
    },
    efficiencyBarRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    efficiencyBarLabel: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    efficiencyBarValue: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    efficiencyBarTrack: {
      height: 8,
      backgroundColor: colors.surface,
      borderRadius: 4,
      position: 'relative',
      marginBottom: 8,
    },
    efficiencyBarFill: {
      height: 8,
      borderRadius: 4,
    },
    efficiencyBenchmark: {
      position: 'absolute',
      top: -4,
      width: 2,
      height: 16,
    },
    efficiencyBenchmarkLine: {
      width: 2,
      height: 16,
      backgroundColor: '#F59E0B',
    },
    efficiencyLabelsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    efficiencyLabelSmall: {
      fontSize: 10,
      color: colors.textSecondary,
    },
    efficiencyComparison: {
      fontSize: 12,
      color: '#10B981',
      textAlign: 'center',
    },
    sleepMetricsContainer: {
      marginBottom: 20,
    },
    sleepMetricsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: 12,
    },
    metricItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: '#1A1A1A',
      borderRadius: 8,
      padding: 12,
      gap: 12,
      width: '48%',
      minHeight: 70,
      borderWidth: 1,
      borderColor: '#2A2A2A',
    },
    metricContent: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 4,
    },
    dayMetricLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    dayMetricValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    metricDetailArrow: {
      marginTop: 4,
    },
    editSleepButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: 'transparent',
    },
    editSleepButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
  });

  // Modified: Don't return early - always show the interface
  const hasData = lastNightData && recentSleep.length > 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerText}>
          <Text style={styles.greeting}>
            {hasData ? `${getGreeting()}!` : 'Welcome to Sleep Tracking!'}
          </Text>
          <Text style={styles.lastNightSummary}>
            {hasData
              ? `You slept ${formatSleepTime(lastNightData.duration)} last night`
              : 'Start tracking your sleep for better insights'
            }
          </Text>
        </View>
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
              {lastNightData.sleepEfficiency || 80}%
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.startTrackingButton}
            onPress={() => setShowSleepLogModal(true)}
          >
            <MaterialIcons name="add" size={16} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderSummaryCards = () => {
    // Only render when we have data (checked in main return)
    return (
      <View style={styles.summaryCards}>
        <View style={styles.cardRow}>
          <View style={[styles.summaryCard, styles.cardEqual]}>
            <MaterialIcons name="bedtime" size={20} color={colors.success} />
            <Text style={styles.cardValue}>{formatSleepTime(lastNightData.duration)}</Text>
            <Text style={styles.cardLabel}>Time Asleep</Text>
            <Text style={styles.cardSubtitle}>
              Goal: {formatSleepTimeFromHours(sleepGoals.targetSleepHours)}
            </Text>
          </View>

          <View style={[styles.summaryCard, styles.cardEqual]}>
            <MaterialIcons name="trending-up" size={20} color={colors.secondary} />
            <Text style={styles.cardValue}>{lastNightData.sleepEfficiency || 80}%</Text>
            <Text style={styles.cardLabel}>Efficiency</Text>
            <Text style={styles.cardSubtitle}>Sleep quality score</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSleepStages = () => {
    // Only render when we have data (checked in main return)
    return (
      <View style={styles.summaryCards}>
        <View style={styles.sleepStagesCard}>
          <View style={styles.sleepStagesContainer}>
            <View style={styles.sleepStage}>
              <View style={[styles.stageIndicator, { backgroundColor: colors.success }]} />
              <Text style={styles.stageLabel}>Deep</Text>
              <Text style={styles.stageValue}>
                {lastNightData.deepSleep ? `${lastNightData.deepSleep}%` : 'N/A'}
              </Text>
            </View>
            <View style={styles.sleepStage}>
              <View style={[styles.stageIndicator, { backgroundColor: colors.info }]} />
              <Text style={styles.stageLabel}>Light</Text>
              <Text style={styles.stageValue}>
                {lastNightData.lightSleep ? `${lastNightData.lightSleep}%` : 'N/A'}
              </Text>
            </View>
            <View style={styles.sleepStage}>
              <View style={[styles.stageIndicator, { backgroundColor: colors.warning }]} />
              <Text style={styles.stageLabel}>REM</Text>
              <Text style={styles.stageValue}>
                {lastNightData.remSleep ? `${lastNightData.remSleep}%` : 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      </View>
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
    let chartData = generateChartData();
    const hasRealData = chartData.some(item => item.hasData);

    if (!hasRealData) {
      chartData = generateSampleData('Week');
    }

    const todayData = chartData[0];

    if (!todayData) {
      return (
        <View style={styles.enhancedChartContainer}>
          <Text style={styles.enhancedChartTitle}>Today's Sleep</Text>
          <View style={styles.noDataDay}>
            <MaterialIcons name="bedtime" size={48} color="#404040" />
            <Text style={styles.noDataDayText}>No sleep data for today</Text>
            <Text style={styles.noDataDaySubtext}>Tap + to log your sleep</Text>
          </View>
        </View>
      );
    }

    // Mock data for demonstration
    const sleepDuration = todayData.value || 7.0;
    const sleepEfficiency = todayData.efficiency || 94;
    const sleepQuality = todayData.quality || 5;
    const bedtime = "11:31 PM";
    const wakeTime = "6:31 AM";
    const sleepGoal = 8.0;

    // Sleep stages (percentages)
    const deepSleep = 28;
    const lightSleep = 48;
    const remSleep = 24;

    // Additional metrics
    const fellAsleepIn = 12;
    const wokeUpTimes = 2;
    const restlessness = "Low";
    const heartRateMin = 52;
    const heartRateMax = 68;
    const sleepDebt = -1.0;

    const goalMet = sleepDuration >= sleepGoal;

    const getEfficiencyColor = (efficiency: number) => {
      if (efficiency >= 85) return '#10B981';
      if (efficiency >= 70) return '#F59E0B';
      return '#EF4444';
    };

    const getQualityLabel = (quality: number) => {
      if (quality >= 4.5) return 'Excellent';
      if (quality >= 3.5) return 'Good';
      if (quality >= 2.5) return 'Fair';
      return 'Poor';
    };

    return (
      <View style={styles.enhancedChartContainer}>
        <Text style={styles.enhancedChartTitle}>
          {todayData.date.toLocaleDateString('en', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </Text>

        {/* Summary Cards */}
        <View style={styles.daySummaryCards}>
          {/* Time Asleep Card */}
          <View style={styles.daySummaryCard}>
            <View style={styles.daySummaryHeader}>
              <MaterialIcons name="bedtime" size={20} color="#60A5FA" />
              <View style={[styles.goalIndicator, {
                backgroundColor: goalMet ? '#10B981' : '#EF4444'
              }]} />
            </View>
            <Text style={styles.daySummaryValue}>
              {Math.floor(sleepDuration)}h {Math.round((sleepDuration % 1) * 60)}m
            </Text>
            <Text style={styles.daySummaryLabel}>Time Asleep</Text>
            <Text style={styles.daySummarySubtext}>
              Goal: {Math.floor(sleepGoal)}h {Math.round((sleepGoal % 1) * 60)}m
            </Text>
          </View>

          {/* Efficiency Card */}
          <View style={styles.daySummaryCard}>
            <View style={styles.daySummaryHeader}>
              <MaterialIcons name="trending-up" size={20} color={getEfficiencyColor(sleepEfficiency)} />
              <MaterialIcons
                name={sleepEfficiency >= 85 ? 'arrow-upward' : 'arrow-downward'}
                size={16}
                color={getEfficiencyColor(sleepEfficiency)}
              />
            </View>
            <Text style={styles.daySummaryValue}>{sleepEfficiency}%</Text>
            <Text style={styles.daySummaryLabel}>Efficiency</Text>
            <Text style={styles.daySummarySubtext}>Sleep quality score</Text>
          </View>
        </View>

        {/* Sleep Stage Distribution */}
        <View style={styles.stageDistributionContainer}>
          <Text style={styles.stageDistributionTitle}>Sleep Stages</Text>

          {/* Stacked Bar */}
          <View style={styles.stageStackedBar}>
            <View style={[styles.stageSegment, {
              flex: deepSleep,
              backgroundColor: '#2563EB'
            }]}>
              <Text style={styles.stageSegmentText}>{deepSleep}%</Text>
            </View>
            <View style={[styles.stageSegment, {
              flex: lightSleep,
              backgroundColor: '#60A5FA'
            }]}>
              <Text style={styles.stageSegmentText}>{lightSleep}%</Text>
            </View>
            <View style={[styles.stageSegment, {
              flex: remSleep,
              backgroundColor: '#8B5CF6'
            }]}>
              <Text style={styles.stageSegmentText}>{remSleep}%</Text>
            </View>
          </View>

          {/* Stage Details */}
          <View style={styles.stageDetailsRow}>
            <View style={styles.stageDetail}>
              <View style={[styles.stageDot, { backgroundColor: '#2563EB' }]} />
              <View>
                <Text style={styles.stageDetailLabel}>Deep</Text>
                <Text style={styles.stageDetailDuration}>
                  {Math.floor(sleepDuration * deepSleep / 100)}h {Math.round((sleepDuration * deepSleep / 100 % 1) * 60)}m
                </Text>
              </View>
            </View>
            <View style={styles.stageDetail}>
              <View style={[styles.stageDot, { backgroundColor: '#60A5FA' }]} />
              <View>
                <Text style={styles.stageDetailLabel}>Light</Text>
                <Text style={styles.stageDetailDuration}>
                  {Math.floor(sleepDuration * lightSleep / 100)}h {Math.round((sleepDuration * lightSleep / 100 % 1) * 60)}m
                </Text>
              </View>
            </View>
            <View style={styles.stageDetail}>
              <View style={[styles.stageDot, { backgroundColor: '#8B5CF6' }]} />
              <View>
                <Text style={styles.stageDetailLabel}>REM</Text>
                <Text style={styles.stageDetailDuration}>
                  {Math.floor(sleepDuration * remSleep / 100)}h {Math.round((sleepDuration * remSleep / 100 % 1) * 60)}m
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Enhanced Timeline */}
        <View style={styles.enhancedTimelineContainer}>
          <View style={styles.timelineHeaderRow}>
            <Text style={styles.timelineTitle}>Sleep Timeline</Text>
            <Text style={styles.timelineDuration}>{bedtime} - {wakeTime}</Text>
          </View>

          {/* Timeline Bar with Stages */}
          <View style={styles.enhancedTimelineBar}>
            {/* Background grid */}
            <View style={styles.timelineGrid}>
              {[0, 1, 2, 3, 4].map(i => (
                <View key={i} style={[styles.timelineGridLine, { left: `${i * 25}%` }]}>
                  {i === 2 && <View style={styles.midnightLine} />}
                </View>
              ))}
            </View>

            {/* Sleep segments with stages */}
            <View style={styles.sleepSegmentsContainer}>
              {/* Deep sleep segment */}
              <View style={[styles.sleepSegment, {
                width: `${deepSleep}%`,
                backgroundColor: '#2563EB'
              }]} />
              {/* Light sleep segment */}
              <View style={[styles.sleepSegment, {
                width: `${lightSleep}%`,
                backgroundColor: '#60A5FA'
              }]} />
              {/* REM segment */}
              <View style={[styles.sleepSegment, {
                width: `${remSleep}%`,
                backgroundColor: '#8B5CF6'
              }]} />
            </View>

            {/* Bedtime marker */}
            <View style={[styles.timelineMarker, { left: '10%' }]}>
              <View style={styles.timelineMarkerCircle}>
                <Text style={styles.timelineMarkerIcon}>🌙</Text>
              </View>
              <Text style={styles.timelineMarkerTime}>{bedtime}</Text>
            </View>

            {/* Wake time marker */}
            <View style={[styles.timelineMarker, { left: '80%' }]}>
              <View style={styles.timelineMarkerCircle}>
                <Text style={styles.timelineMarkerIcon}>☀️</Text>
              </View>
              <Text style={styles.timelineMarkerTime}>{wakeTime}</Text>
            </View>
          </View>

          {/* Time scale */}
          <View style={styles.enhancedTimeScale}>
            {['6 PM', '9 PM', '12 AM', '3 AM', '6 AM'].map((time, idx) => (
              <Text key={idx} style={[styles.enhancedTimeScaleLabel, {
                fontWeight: idx === 2 ? '600' : '400'
              }]}>{time}</Text>
            ))}
          </View>
        </View>

        {/* Quality Score with Circular Indicator */}
        <View style={styles.qualityScoreContainer}>
          <Text style={styles.qualityScoreTitle}>Sleep Quality</Text>

          <View style={styles.circularQualityIndicator}>
            {/* Circular progress ring */}
            <View style={styles.qualityCircle}>
              <Text style={styles.qualityScoreNumber}>{sleepQuality.toFixed(1)}</Text>
              <Text style={styles.qualityScoreMax}>/5</Text>
            </View>
            <Text style={styles.qualityLabel}>{getQualityLabel(sleepQuality)}</Text>
          </View>

          {/* Efficiency Bar with Benchmark */}
          <View style={styles.efficiencyBarContainer}>
            <View style={styles.efficiencyBarRow}>
              <Text style={styles.efficiencyBarLabel}>Efficiency</Text>
              <Text style={styles.efficiencyBarValue}>{sleepEfficiency}%</Text>
            </View>

            <View style={styles.efficiencyBarTrack}>
              <LinearGradient
                colors={['#EF4444', '#F59E0B', '#10B981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.efficiencyBarFill, {
                  width: `${sleepEfficiency}%`
                }]}
              />
              {/* Benchmark line at 85% */}
              <View style={[styles.efficiencyBenchmark, { left: '85%' }]}>
                <View style={styles.efficiencyBenchmarkLine} />
              </View>
            </View>

            <View style={styles.efficiencyLabelsRow}>
              <Text style={styles.efficiencyLabelSmall}>0%</Text>
              <Text style={styles.efficiencyLabelSmall}>50%</Text>
              <Text style={styles.efficiencyLabelSmall}>100%</Text>
            </View>

            <Text style={styles.efficiencyComparison}>
              ↑ 3% vs. your average
            </Text>
          </View>
        </View>

        {/* Additional Sleep Metrics */}
        <View style={styles.sleepMetricsContainer}>
          <Text style={styles.sleepMetricsTitle}>Sleep Metrics</Text>

          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <MaterialIcons name="schedule" size={20} color="#60A5FA" />
              <View style={styles.metricContent}>
                <Text style={styles.dayMetricLabel}>Fell asleep in</Text>
                <Text style={styles.dayMetricValue}>{fellAsleepIn} minutes</Text>
              </View>
            </View>

            <View style={styles.metricItem}>
              <MaterialIcons name="notifications" size={20} color="#F59E0B" />
              <View style={styles.metricContent}>
                <Text style={styles.dayMetricLabel}>Woke up</Text>
                <Text style={styles.dayMetricValue}>{wokeUpTimes} times</Text>
              </View>
            </View>

            <View style={styles.metricItem}>
              <MaterialIcons name="waves" size={20} color="#8B5CF6" />
              <View style={styles.metricContent}>
                <Text style={styles.dayMetricLabel}>Restlessness</Text>
                <Text style={styles.dayMetricValue}>{restlessness}</Text>
              </View>
            </View>

            <View style={styles.metricItem}>
              <MaterialIcons name="favorite" size={20} color="#EF4444" />
              <View style={styles.metricContent}>
                <Text style={styles.dayMetricLabel}>Heart rate</Text>
                <Text style={styles.dayMetricValue}>{heartRateMin}-{heartRateMax} bpm</Text>
              </View>
            </View>

            <View style={styles.metricItem}>
              <MaterialIcons name="battery-alert" size={20} color={sleepDebt < 0 ? '#10B981' : '#EF4444'} />
              <View style={styles.metricContent}>
                <Text style={styles.dayMetricLabel}>Sleep debt</Text>
                <Text style={[styles.dayMetricValue, {
                  color: sleepDebt < 0 ? '#10B981' : '#EF4444'
                }]}>
                  {sleepDebt >= 0 ? '+' : ''}{Math.abs(sleepDebt).toFixed(1)}h
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.metricItem}>
              <MaterialIcons name="info-outline" size={20} color="#60A5FA" />
              <View style={styles.metricContent}>
                <Text style={styles.dayMetricLabel}>View details</Text>
                <View style={styles.metricDetailArrow}>
                  <MaterialIcons name="arrow-forward" size={16} color={colors.textSecondary} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Edit Button */}
        <TouchableOpacity style={styles.editSleepButton}>
          <MaterialIcons name="edit" size={18} color={colors.primary} />
          <Text style={styles.editSleepButtonText}>Edit Sleep Data</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderWeekView = () => {
    // Use sample data if no real data exists
    let chartData = generateChartData();
    const hasRealData = chartData.some(item => item.hasData);

    if (!hasRealData) {
      chartData = generateSampleData('Week');
    }

    const dataValues = chartData.map(d => d.value);
    const maxValue = Math.max(...dataValues, 10);
    const avgValue = dataValues.reduce((a, b) => a + b, 0) / dataValues.length;
    const lastWeekAvg = avgValue - 0.5 + Math.random(); // Mock comparison
    const percentChangeNum = ((avgValue - lastWeekAvg) / lastWeekAvg * 100);
    const percentChange = percentChangeNum.toFixed(0);

    const chartHeight = 180;
    const chartWidth = width - 80;
    const barWidth = Math.floor((chartWidth / 7) * 0.65); // 65% of available width
    const chartBackgroundColor = '#1A1A1A';
    const gridLineColor = '#FFFFFF26';

    return (
      <View style={styles.enhancedChartContainer}>
        <Text style={styles.enhancedChartTitle}>Weekly Sleep Duration</Text>

        {/* Comparison Metric */}
        <View style={styles.comparisonRow}>
          <MaterialIcons
            name={percentChangeNum >= 0 ? 'trending-up' : 'trending-down'}
            size={16}
            color={percentChangeNum >= 0 ? '#10B981' : '#EF4444'}
          />
          <Text style={[styles.comparisonText, {
            color: percentChangeNum >= 0 ? '#10B981' : '#EF4444'
          }]}>
            {Math.abs(parseFloat(percentChange))}% {percentChangeNum >= 0 ? 'more' : 'less'} than last week
          </Text>
        </View>

        <View style={styles.chartInnerContainer}>
          {/* Recommended Sleep Line */}
          <View style={[styles.recommendedLine, {
            bottom: (7.5 / maxValue) * chartHeight + 40
          }]}>
            <View style={styles.recommendedLineDash} />
            <Text style={styles.recommendedLabel}>Recommended</Text>
          </View>

          {/* Y-axis Labels */}
          <View style={styles.enhancedYAxisLabels}>
            {[maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, 0].map((val, idx) => (
              <Text key={idx} style={styles.enhancedYAxisLabel}>
                {val.toFixed(1)}h
              </Text>
            ))}
          </View>

          {/* Grid Lines */}
          <View style={[styles.enhancedGridContainer, { height: chartHeight }]}>
            {[0, 1, 2, 3, 4].map(i => (
              <View
                key={i}
                style={[styles.enhancedGridLine, {
                  bottom: Math.round((i * chartHeight) / 4),
                  backgroundColor: gridLineColor,
                }]}
              />
            ))}
          </View>

          {/* Chart Bars */}
          <View style={[styles.enhancedChartBars, { height: chartHeight }]}>
            {chartData.map((dayData, index) => {
              const barHeight = Math.max(((dayData.value / maxValue) * chartHeight), 8);
              const isToday = dayData.date.toDateString() === new Date().toDateString();

              return (
                <TouchableOpacity
                  key={index}
                  style={styles.enhancedBarColumn}
                  onPress={() => handleDayPress(dayData)}
                  activeOpacity={0.7}
                >
                  <View style={styles.enhancedBarWrapper}>
                    <LinearGradient
                      colors={isToday ? ['#10B981', '#059669'] : ['#3B82F6', '#2563EB']}
                      style={[styles.enhancedBar, {
                        height: barHeight,
                        width: barWidth,
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                      }]}
                    />
                    {/* Value Label on Bar */}
                    <Text style={styles.barValueLabel}>
                      {dayData.value.toFixed(1)}h
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* X-axis Labels */}
          <View style={styles.enhancedXAxisLabels}>
            {chartData.map((dayData, index) => (
              <Text key={index} style={styles.enhancedXAxisLabel}>
                {dayData.date.toLocaleDateString('en', { weekday: 'short' })}
              </Text>
            ))}
          </View>
        </View>

        {/* Sleep Insight */}
        <View style={styles.sleepInsight}>
          <MaterialIcons name="lightbulb-outline" size={16} color="#F59E0B" />
          <Text style={styles.sleepInsightText}>
            Your sleep is most consistent on weekdays
          </Text>
        </View>
      </View>
    );
  };

  const renderMonthView = () => {
    let chartData = generateChartData();
    const hasRealData = chartData.some(item => item.hasData);

    if (!hasRealData) {
      chartData = generateSampleData('Month');
    }

    const dataValues = chartData.filter(d => d.hasData).map(d => d.value);
    const monthlyTotal = dataValues.reduce((a, b) => a + b, 0);
    const avgValue = monthlyTotal / dataValues.length;
    const currentMonth = new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' });
    const maxValue = Math.max(...dataValues, 10);
    const chartHeight = 180;
    const barWidth = 8;

    return (
      <View style={styles.enhancedChartContainer}>
        <Text style={styles.enhancedChartTitle}>Monthly Sleep - {currentMonth}</Text>

        {/* Summary Stats */}
        <View style={styles.comparisonRow}>
          <Text style={styles.comparisonText}>
            Total: {monthlyTotal.toFixed(0)}h • Avg: {avgValue.toFixed(1)}h/night
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={[styles.chartInnerContainer, { width: Math.max(width - 40, chartData.length * (barWidth + 2)) }]}>
            {/* Recommended Sleep Line */}
            <View style={[styles.recommendedLine, {
              bottom: (7.5 / maxValue) * chartHeight + 40,
            }]}>
              <View style={styles.recommendedLineDash} />
            </View>

            {/* Y-axis Labels */}
            <View style={styles.enhancedYAxisLabels}>
              {[maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, 0].map((val, idx) => (
                <Text key={idx} style={styles.enhancedYAxisLabel}>
                  {val.toFixed(0)}h
                </Text>
              ))}
            </View>

            {/* Grid Lines */}
            <View style={[styles.enhancedGridContainer, { height: chartHeight, left: 40 }]}>
              {[0, 1, 2, 3, 4].map(i => (
                <View
                  key={i}
                  style={[styles.enhancedGridLine, {
                    bottom: Math.round((i * chartHeight) / 4),
                  }]}
                />
              ))}
            </View>

            {/* Chart Bars */}
            <View style={[styles.enhancedChartBars, { height: chartHeight, paddingLeft: 40, width: chartData.length * (barWidth + 2) }]}>
              {chartData.map((dayData, index) => {
                const barHeight = dayData.hasData
                  ? Math.max(((dayData.value / maxValue) * chartHeight), 4)
                  : 4;
                const isToday = dayData.date.toDateString() === new Date().toDateString();

                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.enhancedBarColumn, { width: barWidth + 2 }]}
                    onPress={() => dayData.hasData && handleDayPress(dayData)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={isToday ? ['#10B981', '#059669'] :
                              dayData.hasData ? ['#3B82F6', '#2563EB'] :
                              ['#2A2A2A', '#2A2A2A']}
                      style={[styles.enhancedBar, {
                        height: barHeight,
                        width: barWidth,
                        borderTopLeftRadius: 3,
                        borderTopRightRadius: 3,
                      }]}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* X-axis Day Labels (every 5 days) */}
            <View style={[styles.enhancedXAxisLabels, { width: chartData.length * (barWidth + 2), paddingLeft: 40 }]}>
              {chartData.map((dayData, index) => (
                index % 5 === 0 && (
                  <Text key={index} style={[styles.enhancedXAxisLabel, {
                    position: 'absolute',
                    left: 40 + index * (barWidth + 2),
                    width: barWidth * 5,
                  }]}>
                    {dayData.day}
                  </Text>
                )
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Insight */}
        <View style={styles.sleepInsight}>
          <MaterialIcons name="info-outline" size={16} color="#3B82F6" />
          <Text style={styles.sleepInsightText}>
            {dataValues.filter(v => v >= 7).length} days met your sleep goal this month
          </Text>
        </View>
      </View>
    );
  };

  const render6MonthView = () => {
    let chartData = generateChartData();
    const hasRealData = chartData.some(item => item.hasData);

    if (!hasRealData) {
      chartData = generateSampleData('6M');
    }

    const dataValues = chartData.filter(d => d.hasData).map(d => d.value);
    const maxValue = Math.max(...dataValues, 200);
    const chartHeight = 180;
    const barWidth = Math.floor((width - 100) / 6 * 0.7);

    return (
      <View style={styles.enhancedChartContainer}>
        <Text style={styles.enhancedChartTitle}>6 Month Sleep Trends</Text>

        <View style={styles.comparisonRow}>
          <Text style={styles.comparisonText}>
            Weekly averages over the past 6 months
          </Text>
        </View>

        <View style={styles.chartInnerContainer}>
          {/* Y-axis Labels */}
          <View style={styles.enhancedYAxisLabels}>
            {[maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, 0].map((val, idx) => (
              <Text key={idx} style={styles.enhancedYAxisLabel}>
                {val.toFixed(0)}h
              </Text>
            ))}
          </View>

          {/* Grid Lines */}
          <View style={[styles.enhancedGridContainer, { height: chartHeight }]}>
            {[0, 1, 2, 3, 4].map(i => (
              <View
                key={i}
                style={[styles.enhancedGridLine, {
                  bottom: Math.round((i * chartHeight) / 4),
                }]}
              />
            ))}
          </View>

          {/* Chart Bars */}
          <View style={[styles.enhancedChartBars, { height: chartHeight }]}>
            {chartData.map((monthData, index) => {
              const barHeight = monthData.hasData
                ? Math.max(((monthData.value / maxValue) * chartHeight), 8)
                : 8;

              return (
                <TouchableOpacity
                  key={index}
                  style={styles.enhancedBarColumn}
                  onPress={() => monthData.hasData && handleDayPress(monthData)}
                  activeOpacity={0.7}
                >
                  <View style={styles.enhancedBarWrapper}>
                    <LinearGradient
                      colors={monthData.hasData ? ['#8B5CF6', '#7C3AED'] : ['#2A2A2A', '#2A2A2A']}
                      style={[styles.enhancedBar, {
                        height: barHeight,
                        width: barWidth,
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                      }]}
                    />
                    {monthData.hasData && (
                      <Text style={styles.barValueLabel}>
                        {monthData.value.toFixed(0)}h
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* X-axis Labels */}
          <View style={styles.enhancedXAxisLabels}>
            {chartData.map((monthData, index) => (
              <Text key={index} style={styles.enhancedXAxisLabel}>
                {monthData.date.toLocaleDateString('en', { month: 'short' })}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.sleepInsight}>
          <MaterialIcons name="insights" size={16} color="#8B5CF6" />
          <Text style={styles.sleepInsightText}>
            Tracking {chartData.filter(m => m.hasData).length} months of sleep data
          </Text>
        </View>
      </View>
    );
  };

  const renderYearView = () => {
    let chartData = generateChartData();
    const hasRealData = chartData.some(item => item.hasData);

    if (!hasRealData) {
      chartData = generateSampleData('Year');
    }

    const dataValues = chartData.filter(d => d.hasData).map(d => d.value);
    const yearlyTotal = dataValues.reduce((a, b) => a + b, 0);
    const currentYear = new Date().getFullYear();
    const maxValue = Math.max(...dataValues, 200);
    const chartHeight = 180;
    const barWidth = Math.floor((width - 100) / 12 * 0.7);

    return (
      <View style={styles.enhancedChartContainer}>
        <Text style={styles.enhancedChartTitle}>{currentYear} Sleep Overview</Text>

        <View style={styles.comparisonRow}>
          <Text style={styles.comparisonText}>
            Total: {yearlyTotal.toFixed(0)}h this year
          </Text>
        </View>

        <View style={styles.chartInnerContainer}>
          {/* Y-axis Labels */}
          <View style={styles.enhancedYAxisLabels}>
            {[maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, 0].map((val, idx) => (
              <Text key={idx} style={styles.enhancedYAxisLabel}>
                {val.toFixed(0)}h
              </Text>
            ))}
          </View>

          {/* Grid Lines */}
          <View style={[styles.enhancedGridContainer, { height: chartHeight }]}>
            {[0, 1, 2, 3, 4].map(i => (
              <View
                key={i}
                style={[styles.enhancedGridLine, {
                  bottom: Math.round((i * chartHeight) / 4),
                }]}
              />
            ))}
          </View>

          {/* Chart Bars */}
          <View style={[styles.enhancedChartBars, { height: chartHeight }]}>
            {chartData.map((monthData, index) => {
              const barHeight = monthData.hasData
                ? Math.max(((monthData.value / maxValue) * chartHeight), 8)
                : 8;

              return (
                <TouchableOpacity
                  key={index}
                  style={styles.enhancedBarColumn}
                  onPress={() => monthData.hasData && handleDayPress(monthData)}
                  activeOpacity={0.7}
                >
                  <View style={styles.enhancedBarWrapper}>
                    <LinearGradient
                      colors={monthData.hasData ? ['#8B5CF6', '#7C3AED'] : ['#2A2A2A', '#2A2A2A']}
                      style={[styles.enhancedBar, {
                        height: barHeight,
                        width: barWidth,
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                      }]}
                    />
                    {monthData.hasData && (
                      <Text style={styles.barValueLabel}>
                        {monthData.value.toFixed(0)}h
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* X-axis Labels */}
          <View style={styles.enhancedXAxisLabels}>
            {chartData.map((monthData, index) => (
              <Text key={index} style={styles.enhancedXAxisLabel}>
                {monthData.monthName}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.sleepInsight}>
          <MaterialIcons name="trending-up" size={16} color="#8B5CF6" />
          <Text style={styles.sleepInsightText}>
            Best month: {chartData.reduce((a, b) => (b.value > a.value ? b : a), chartData[0]).date.toLocaleDateString('en', { month: 'long' })}
          </Text>
        </View>
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
    let chartData = generateChartData();
    const hasRealData = chartData.some(item => item.hasData);

    if (!hasRealData) {
      chartData = generateSampleData('Week');
    }

    const weekData = chartData.slice(-7);
    const avgQuality = weekData.reduce((sum, item) => sum + (item.quality || 0), 0) / weekData.length;

    const getQualityColor = (efficiency: number) => {
      if (efficiency >= 80) return '#10B981'; // Green
      if (efficiency >= 60) return '#F59E0B'; // Yellow
      return '#EF4444'; // Red
    };

    return (
      <View style={styles.enhancedChartContainer}>
        <View style={styles.qualityTrendContainer}>
          <Text style={styles.qualityTrendTitle}>Sleep Quality Trend</Text>

          {/* Quality Dots with Connecting Line */}
          <View style={{ position: 'relative' }}>
            <View style={styles.qualityConnectingLine} />
            <View style={styles.qualityDotsRow}>
              {weekData.map((item, index) => (
                <View key={index} style={styles.qualityDotWrapper}>
                  <View style={[
                    styles.qualityDot,
                    {
                      backgroundColor: getQualityColor(item.efficiency || 0),
                    }
                  ]} />
                  <Text style={styles.qualityDotLabel}>
                    {item.date.toLocaleDateString('en', { weekday: 'short' })}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Weekly Average */}
          <View style={styles.averageQuality}>
            <Text style={styles.averageLabel}>Weekly Average Quality</Text>
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

          {/* Legend */}
          <View style={styles.qualityLegend}>
            <View style={styles.qualityLegendItem}>
              <View style={[styles.qualityLegendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.qualityLegendText}>Good (&gt;80%)</Text>
            </View>
            <View style={styles.qualityLegendItem}>
              <View style={[styles.qualityLegendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.qualityLegendText}>Fair (60-80%)</Text>
            </View>
            <View style={styles.qualityLegendItem}>
              <View style={[styles.qualityLegendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.qualityLegendText}>Poor (&lt;60%)</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderChartFilters = () => (
    <View style={styles.section}>
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
        <MaterialIcons name="insights" size={24} color={colors.info} />
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
    </View>
  );

  const renderSleepSchedule = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sleep Schedule</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setShowSleepScheduleModal(true)}
        >
          <MaterialIcons name="edit" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.scheduleCard}>
        <View style={styles.scheduleContainer}>
          <View style={styles.scheduleItem}>
            <MaterialIcons name="bedtime" size={24} color={colors.warning} />
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleLabel}>Bedtime Goal</Text>
              <Text style={styles.scheduleTime}>{sleepGoals.bedtime}</Text>
            </View>
          </View>

          <View style={styles.scheduleItem}>
            <MaterialIcons name="alarm" size={24} color={colors.success} />
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleLabel}>Wake Up Goal</Text>
              <Text style={styles.scheduleTime}>{sleepGoals.wakeTime}</Text>
            </View>
          </View>
        </View>

        <View style={styles.consistencyContainer}>
          <Text style={styles.consistencyLabel}>Weekly Consistency</Text>
          <View style={styles.consistencyBar}>
            <View
              style={[
                styles.consistencyFill,
                {
                  width: `${stats?.consistency || 0}%`,
                  backgroundColor: colors.success,
                }
              ]}
            />
          </View>
          <Text style={styles.consistencyValue}>{Math.round(stats?.consistency || 0)}%</Text>
        </View>
      </View>
    </View>
  );

  const renderInsights = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Insights & Trends</Text>

      <View style={styles.insightCard}>
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
            <MaterialIcons name="lightbulb" size={20} color={colors.warning} />
            <Text style={styles.insightText}>
              Track more sleep data to get personalized insights
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const handleArticlePress = (article: any) => {
    setSelectedArticle(article);
    setShowArticleModal(true);
  };

  const renderArticles = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Sleep Articles & Tips</Text>
      {articles.map((article) => (
        <TouchableOpacity
          key={article.id}
          style={styles.articleCard}
          onPress={() => handleArticlePress(article)}
          activeOpacity={0.7}
        >
          <View style={styles.articleContainer}>
            <View style={styles.articleIcon}>
              <Text style={styles.articleEmoji}>{article.image}</Text>
            </View>
            <View style={styles.articleContent}>
              <Text style={styles.articleTitle}>{article.title}</Text>
              <Text style={styles.articleSubtitle}>{article.subtitle}</Text>
              <Text style={styles.articleReadTime}>{article.readTime}</Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={16} color={colors.textSecondary} />
          </View>
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
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header with sleep summary */}
        {renderHeader()}

        {/* 2. Summary cards (Time Asleep + Efficiency) - only if has data */}
        {hasData && renderSummaryCards()}

        {/* 3. Sleep stage distribution bar - only if has data */}
        {hasData && renderSleepStages()}

        {/* 4. Tab selector & Charts */}
        {hasData ? renderChartFilters() : (
          <View style={styles.summaryCards}>
            <View style={styles.noDataSummary}>
              <MaterialIcons name="bedtime" size={48} color={colors.textSecondary} />
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
        )}

        {/* Sleep Schedule - keep below charts */}
        {renderSleepSchedule()}

        {/* Insights - only if has data */}
        {hasData ? renderInsights() : null}

        {/* Articles */}
        {renderArticles()}

        {/* Bottom padding for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button - positioned with proper z-index */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, zIndex: 1000 }]}
        onPress={() => setShowSleepLogModal(true)}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={28} color="#ffffff" />
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

      {/* Sleep Article Modal */}
      <SleepArticleModal
        visible={showArticleModal}
        onClose={() => setShowArticleModal(false)}
        article={selectedArticle}
      />

      {/* Tooltip */}
      {renderTooltip()}
    </SafeAreaView>
  );
};

export default SleepScreen;
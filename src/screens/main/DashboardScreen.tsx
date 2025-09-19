import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { RootState } from '../../store/store';
import { useTheme } from '../../hooks/useTheme';
import { useHealthData } from '../../hooks/useHealthData';
import ManualDataEntry from '../../components/ManualDataEntry';
import GoalsSettingsModal from '../../components/GoalsSettingsModal';

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const { waterIntake } = useSelector((state: RootState) => state.nutrition);

  // Use real-time health data
  const {
    todayMetrics,
    dailyGoals,
    weeklyData,
    isLoading,
    progress,
    refreshData,
    addWaterIntake,
    removeWaterIntake
  } = useHealthData();

  // Modal states
  const [showDataEntry, setShowDataEntry] = useState(false);
  const [dataEntryType, setDataEntryType] = useState<'steps' | 'calories' | 'activeMinutes' | 'water'>('steps');
  const [showGoalsModal, setShowGoalsModal] = useState(false);

  const openDataEntry = (type: 'steps' | 'calories' | 'activeMinutes' | 'water') => {
    setDataEntryType(type);
    setShowDataEntry(true);
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      paddingBottom: 20,
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
    subgreeting: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    settingsButton: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: colors.surface,
    },
    section: {
      paddingHorizontal: 20,
      marginTop: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
    },
    metricCard: {
      width: (width - 52) / 2,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      shadowColor: colors.text,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    metricHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    metricIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    metricIconSteps: {
      backgroundColor: colors.primary + '20',
    },
    metricIconCalories: {
      backgroundColor: colors.warning + '20',
    },
    metricIconHeart: {
      backgroundColor: colors.error + '20',
    },
    metricIconWater: {
      backgroundColor: colors.info + '20',
    },
    metricValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    metricLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    progressBar: {
      height: 6,
      backgroundColor: colors.surface,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
    progressSteps: {
      backgroundColor: colors.primary,
    },
    progressCalories: {
      backgroundColor: colors.warning,
    },
    progressHeart: {
      backgroundColor: colors.error,
    },
    progressWater: {
      backgroundColor: colors.info,
    },
    progressText: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 6,
    },
    quickActionsCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginTop: 12,
      shadowColor: colors.text,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    quickActionsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 12,
    },
    quickActionItem: {
      alignItems: 'center',
      padding: 8,
    },
    quickActionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    quickActionWorkout: {
      backgroundColor: colors.accent + '20',
    },
    quickActionMeal: {
      backgroundColor: colors.success + '20',
    },
    quickActionSleep: {
      backgroundColor: colors.secondary + '20',
    },
    quickActionAnalytics: {
      backgroundColor: colors.primary + '20',
    },
    quickActionText: {
      fontSize: 12,
      color: colors.text,
      fontWeight: '500',
      textAlign: 'center',
    },
    summaryCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginTop: 12,
      shadowColor: colors.text,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    summaryRowLast: {
      borderBottomWidth: 0,
    },
    summaryLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    summaryValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>{getGreeting()}, {user?.name || 'User'}!</Text>
            <Text style={styles.subgreeting}>Let's check your health progress today</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowGoalsModal(true)}
          >
            <MaterialIcons name="tune" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshData}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, styles.metricIconSteps]}>
                  <MaterialIcons name="directions-walk" size={20} color={colors.primary} />
                </View>
              </View>
              <Text style={styles.metricValue}>{formatNumber(todayMetrics.steps)}</Text>
              <Text style={styles.metricLabel}>Steps</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    styles.progressSteps,
                    { width: `${progress.steps}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                Goal: {formatNumber(dailyGoals.steps)}
              </Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, styles.metricIconCalories]}>
                  <MaterialIcons name="local-fire-department" size={20} color={colors.warning} />
                </View>
              </View>
              <Text style={styles.metricValue}>{formatNumber(todayMetrics.calories)}</Text>
              <Text style={styles.metricLabel}>Calories</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    styles.progressCalories,
                    { width: `${progress.calories}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                Goal: {formatNumber(dailyGoals.calories)}
              </Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, styles.metricIconHeart]}>
                  <MaterialIcons name="favorite" size={20} color={colors.error} />
                </View>
              </View>
              <Text style={styles.metricValue}>{todayMetrics.heartRate}</Text>
              <Text style={styles.metricLabel}>Heart Rate</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    styles.progressHeart,
                    { width: '65%' },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>Resting BPM</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, styles.metricIconWater]}>
                  <MaterialIcons name="water-drop" size={20} color={colors.info} />
                </View>
              </View>
              <Text style={styles.metricValue}>{todayMetrics.waterIntake}</Text>
              <Text style={styles.metricLabel}>Glasses</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    styles.progressWater,
                    { width: `${progress.water}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                Goal: {dailyGoals.waterIntake} glasses
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manual Data Entry</Text>
          <View style={styles.quickActionsCard}>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={styles.quickActionItem}
                onPress={() => openDataEntry('steps')}
              >
                <View style={[styles.quickActionIcon, styles.quickActionWorkout]}>
                  <MaterialIcons name="directions-walk" size={24} color={colors.primary} />
                </View>
                <Text style={styles.quickActionText}>Add Steps</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionItem}
                onPress={() => openDataEntry('calories')}
              >
                <View style={[styles.quickActionIcon, styles.quickActionMeal]}>
                  <MaterialIcons name="local-fire-department" size={24} color={colors.warning} />
                </View>
                <Text style={styles.quickActionText}>Add Calories</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionItem}
                onPress={() => openDataEntry('activeMinutes')}
              >
                <View style={[styles.quickActionIcon, styles.quickActionSleep]}>
                  <MaterialIcons name="timer" size={24} color={colors.success} />
                </View>
                <Text style={styles.quickActionText}>Add Minutes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionItem}
                onPress={() => openDataEntry('water')}
              >
                <View style={[styles.quickActionIcon, styles.quickActionAnalytics]}>
                  <MaterialIcons name="water-drop" size={24} color={colors.info} />
                </View>
                <Text style={styles.quickActionText}>Add Water</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Average Steps</Text>
              <Text style={styles.summaryValue}>
                {weeklyData.length > 0
                  ? `${Math.round(weeklyData.reduce((sum, day) => sum + day.metrics.steps, 0) / weeklyData.length).toLocaleString()} / day`
                  : '0 / day'
                }
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Calories Burned</Text>
              <Text style={styles.summaryValue}>
                {weeklyData.length > 0
                  ? `${Math.round(weeklyData.reduce((sum, day) => sum + day.metrics.calories, 0) / weeklyData.length).toLocaleString()} / day`
                  : '0 / day'
                }
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Active Minutes</Text>
              <Text style={styles.summaryValue}>
                {weeklyData.length > 0
                  ? `${Math.round(weeklyData.reduce((sum, day) => sum + day.metrics.activeMinutes, 0) / weeklyData.length)} / day`
                  : '0 / day'
                }
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Distance Walked</Text>
              <Text style={styles.summaryValue}>
                {weeklyData.length > 0
                  ? `${(weeklyData.reduce((sum, day) => sum + day.metrics.distance, 0) / weeklyData.length / 1000).toFixed(1)} km / day`
                  : '0 km / day'
                }
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryRowLast]}>
              <Text style={styles.summaryLabel}>Water Intake</Text>
              <Text style={styles.summaryValue}>
                {weeklyData.length > 0
                  ? `${(weeklyData.reduce((sum, day) => sum + day.metrics.waterIntake, 0) / weeklyData.length).toFixed(1)} glasses / day`
                  : '0 glasses / day'
                }
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <ManualDataEntry
        visible={showDataEntry}
        onClose={() => setShowDataEntry(false)}
        dataType={dataEntryType}
      />

      <GoalsSettingsModal
        visible={showGoalsModal}
        onClose={() => setShowGoalsModal(false)}
      />
    </SafeAreaView>
  );
};

export default DashboardScreen;
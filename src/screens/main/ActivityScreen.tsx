import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useHealthData } from '../../hooks/useHealthData';

const { width } = Dimensions.get('window');

const ActivityScreen: React.FC = () => {
  const { colors } = useTheme();
  const {
    todayMetrics,
    dailyGoals,
    weeklyData,
    isLoading,
    progress,
    refreshData
  } = useHealthData();

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
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 4,
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
    activityCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: colors.text,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    activityHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    activityIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    activityIconSteps: {
      backgroundColor: colors.primary + '20',
    },
    activityIconDistance: {
      backgroundColor: colors.secondary + '20',
    },
    activityIconCalories: {
      backgroundColor: colors.warning + '20',
    },
    activityIconActive: {
      backgroundColor: colors.accent + '20',
    },
    activityTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    activitySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    activityMetrics: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    activityValue: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
    },
    activityUnit: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 4,
    },
    progressContainer: {
      flex: 1,
      marginLeft: 20,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.surface,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
    progressSteps: {
      backgroundColor: colors.primary,
    },
    progressDistance: {
      backgroundColor: colors.secondary,
    },
    progressCalories: {
      backgroundColor: colors.warning,
    },
    progressActive: {
      backgroundColor: colors.accent,
    },
    progressText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    startButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
    },
    startButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const formatDistance = (meters: number) => {
    const km = meters / 1000;
    return km.toFixed(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.subtitle}>Track your daily movement and exercise</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Activity</Text>

          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <View style={[styles.activityIcon, styles.activityIconSteps]}>
                <MaterialIcons name="directions-walk" size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.activityTitle}>Steps</Text>
                <Text style={styles.activitySubtitle}>Keep moving!</Text>
              </View>
            </View>
            <View style={styles.activityMetrics}>
              <View>
                <Text style={styles.activityValue}>{todayMetrics.steps.toLocaleString()}</Text>
                <Text style={styles.activityUnit}>steps</Text>
              </View>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      styles.progressSteps,
                      { width: `${getProgressPercentage(todayMetrics.steps, dailyGoals.steps)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  Goal: {dailyGoals.steps.toLocaleString()} steps
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <View style={[styles.activityIcon, styles.activityIconDistance]}>
                <MaterialIcons name="place" size={24} color={colors.secondary} />
              </View>
              <View>
                <Text style={styles.activityTitle}>Distance</Text>
                <Text style={styles.activitySubtitle}>Total distance covered</Text>
              </View>
            </View>
            <View style={styles.activityMetrics}>
              <View>
                <Text style={styles.activityValue}>{formatDistance(todayMetrics.distance)}</Text>
                <Text style={styles.activityUnit}>km</Text>
              </View>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      styles.progressDistance,
                      { width: `${getProgressPercentage(todayMetrics.distance, dailyGoals.distance)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  Goal: {formatDistance(dailyGoals.distance)} km
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <View style={[styles.activityIcon, styles.activityIconCalories]}>
                <MaterialIcons name="local-fire-department" size={24} color={colors.warning} />
              </View>
              <View>
                <Text style={styles.activityTitle}>Calories Burned</Text>
                <Text style={styles.activitySubtitle}>Energy expenditure</Text>
              </View>
            </View>
            <View style={styles.activityMetrics}>
              <View>
                <Text style={styles.activityValue}>{todayMetrics.calories}</Text>
                <Text style={styles.activityUnit}>kcal</Text>
              </View>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      styles.progressCalories,
                      { width: `${getProgressPercentage(todayMetrics.calories, dailyGoals.calories)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  Goal: {dailyGoals.calories} kcal
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <View style={[styles.activityIcon, styles.activityIconActive]}>
                <MaterialIcons name="timer" size={24} color={colors.accent} />
              </View>
              <View>
                <Text style={styles.activityTitle}>Active Minutes</Text>
                <Text style={styles.activitySubtitle}>Time spent moving</Text>
              </View>
            </View>
            <View style={styles.activityMetrics}>
              <View>
                <Text style={styles.activityValue}>{todayMetrics.activeMinutes}</Text>
                <Text style={styles.activityUnit}>minutes</Text>
              </View>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      styles.progressActive,
                      { width: `${getProgressPercentage(todayMetrics.activeMinutes, dailyGoals.activeMinutes)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  Goal: {dailyGoals.activeMinutes} minutes
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.startButton}>
            <Text style={styles.startButtonText}>Start Activity Tracking</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ActivityScreen;
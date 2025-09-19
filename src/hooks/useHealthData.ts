import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../store/store';
import { updateTodayMetrics, setDailyGoals, setWeeklyData, setLoading } from '../store/slices/healthSlice';
import HealthDataService, { HealthMetrics, DailyGoals } from '../services/HealthDataService';

export const useHealthData = () => {
  const dispatch = useDispatch();
  const { todayMetrics, dailyGoals, weeklyData, isLoading } = useSelector(
    (state: RootState) => state.health
  );

  // Initialize health data tracking
  useEffect(() => {
    initializeHealthTracking();
    loadStoredGoals();
    loadWeeklyData();

    // Set up real-time data updates
    const updateInterval = setInterval(() => {
      updateCurrentMetrics();
    }, 5000); // Update every 5 seconds

    return () => {
      clearInterval(updateInterval);
    };
  }, []);

  const initializeHealthTracking = async () => {
    try {
      dispatch(setLoading(true));
      // Health service automatically starts tracking when initialized
      await updateCurrentMetrics();
    } catch (error) {
      console.log('Error initializing health tracking:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateCurrentMetrics = useCallback(async () => {
    try {
      const metrics = HealthDataService.getCurrentMetrics();

      // Load persisted water intake for today
      const today = new Date().toDateString();
      let waterIntake = 0;
      try {
        const storedWater = await AsyncStorage.getItem(`water_intake_${today}`);
        waterIntake = storedWater ? parseInt(storedWater, 10) : 0;
      } catch (error) {
        console.log('Error loading water intake:', error);
      }

      // Update Redux store with real-time data
      dispatch(updateTodayMetrics({
        steps: metrics.steps,
        calories: metrics.calories,
        distance: metrics.distance * 1000, // Convert km to meters for consistency
        heartRate: metrics.heartRate,
        activeMinutes: metrics.activeMinutes,
        waterIntake: waterIntake, // Use persisted water intake
      }));
    } catch (error) {
      console.log('Error updating metrics:', error);
    }
  }, [dispatch]);

  const loadStoredGoals = async () => {
    try {
      const goals = await HealthDataService.getStoredGoals();
      dispatch(setDailyGoals({
        steps: goals.steps,
        calories: goals.calories,
        activeMinutes: goals.activeMinutes,
        waterIntake: goals.water,
        distance: 5000, // Default 5km
        heartRate: 70, // Default resting HR
      }));
    } catch (error) {
      console.log('Error loading goals:', error);
    }
  };

  const loadWeeklyData = async () => {
    try {
      const weekData = await HealthDataService.getWeeklyData();
      const formattedData = weekData.map((data, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));

        return {
          date: date.toISOString().split('T')[0],
          metrics: {
            steps: data.steps,
            calories: data.calories,
            distance: data.distance * 1000, // Convert to meters
            heartRate: data.heartRate,
            activeMinutes: data.activeMinutes,
            waterIntake: 0, // Water intake not tracked historically yet
          },
          goal: {
            steps: dailyGoals.steps,
            calories: dailyGoals.calories,
          },
        };
      });

      dispatch(setWeeklyData(formattedData));
    } catch (error) {
      console.log('Error loading weekly data:', error);
    }
  };

  // Manual data entry functions
  const addSteps = useCallback(async (steps: number) => {
    try {
      await HealthDataService.addSteps(steps);
      await updateCurrentMetrics();
    } catch (error) {
      console.log('Error adding steps:', error);
    }
  }, [updateCurrentMetrics]);

  const addCalories = useCallback(async (calories: number) => {
    try {
      await HealthDataService.addCalories(calories);
      await updateCurrentMetrics();
    } catch (error) {
      console.log('Error adding calories:', error);
    }
  }, [updateCurrentMetrics]);

  const addActiveMinutes = useCallback(async (minutes: number) => {
    try {
      await HealthDataService.addActiveMinutes(minutes);
      await updateCurrentMetrics();
    } catch (error) {
      console.log('Error adding active minutes:', error);
    }
  }, [updateCurrentMetrics]);

  const addWaterIntake = useCallback(async () => {
    const newWaterIntake = Math.min(todayMetrics.waterIntake + 1, dailyGoals.waterIntake);

    // Save to AsyncStorage immediately
    try {
      const today = new Date().toDateString();
      await AsyncStorage.setItem(`water_intake_${today}`, newWaterIntake.toString());

      dispatch(updateTodayMetrics({
        waterIntake: newWaterIntake,
      }));
    } catch (error) {
      console.log('Error saving water intake:', error);
    }
  }, [dispatch, todayMetrics.waterIntake, dailyGoals.waterIntake]);

  const removeWaterIntake = useCallback(async () => {
    const newWaterIntake = Math.max(todayMetrics.waterIntake - 1, 0);

    // Save to AsyncStorage immediately
    try {
      const today = new Date().toDateString();
      await AsyncStorage.setItem(`water_intake_${today}`, newWaterIntake.toString());

      dispatch(updateTodayMetrics({
        waterIntake: newWaterIntake,
      }));
    } catch (error) {
      console.log('Error saving water intake:', error);
    }
  }, [dispatch, todayMetrics.waterIntake]);

  const updateGoals = useCallback(async (newGoals: Partial<DailyGoals>) => {
    try {
      const currentGoals = await HealthDataService.getStoredGoals();
      const updatedGoals = { ...currentGoals, ...newGoals };

      await HealthDataService.updateGoals(updatedGoals);

      dispatch(setDailyGoals({
        steps: updatedGoals.steps,
        calories: updatedGoals.calories,
        activeMinutes: updatedGoals.activeMinutes,
        waterIntake: updatedGoals.water,
        distance: 5000, // Keep default
        heartRate: 70, // Keep default
      }));
    } catch (error) {
      console.log('Error updating goals:', error);
    }
  }, [dispatch]);

  // Force refresh data
  const refreshData = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      await updateCurrentMetrics();
      await loadWeeklyData();
    } catch (error) {
      console.log('Error refreshing data:', error);
    } finally {
      dispatch(setLoading(false));
    }
  }, [updateCurrentMetrics, loadWeeklyData, dispatch]);

  // Calculate progress percentages
  const getProgress = useCallback(() => {
    return {
      steps: Math.min((todayMetrics.steps / dailyGoals.steps) * 100, 100),
      calories: Math.min((todayMetrics.calories / dailyGoals.calories) * 100, 100),
      distance: Math.min((todayMetrics.distance / dailyGoals.distance) * 100, 100),
      activeMinutes: Math.min((todayMetrics.activeMinutes / dailyGoals.activeMinutes) * 100, 100),
      water: Math.min((todayMetrics.waterIntake / dailyGoals.waterIntake) * 100, 100),
    };
  }, [todayMetrics, dailyGoals]);

  return {
    // Current data
    todayMetrics,
    dailyGoals,
    weeklyData,
    isLoading,

    // Progress calculations
    progress: getProgress(),

    // Actions
    addSteps,
    addCalories,
    addActiveMinutes,
    addWaterIntake,
    removeWaterIntake,
    updateGoals,
    refreshData,

    // Utility functions
    updateCurrentMetrics,
  };
};
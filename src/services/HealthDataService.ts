import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pedometer } from 'expo-sensors';
import * as Location from 'expo-location';

export interface HealthMetrics {
  steps: number;
  calories: number;
  distance: number;
  activeMinutes: number;
  heartRate: number;
  lastUpdated: Date;
}

export interface DailyGoals {
  steps: number;
  calories: number;
  activeMinutes: number;
  water: number;
}

class HealthDataService {
  private static instance: HealthDataService;
  private stepCount: number = 0;
  private dailySteps: number = 0;
  private calories: number = 0;
  private distance: number = 0;
  private activeMinutes: number = 0;
  private isTracking: boolean = false;
  private pedometerSubscription: any = null;

  private constructor() {
    this.initializeService();
  }

  static getInstance(): HealthDataService {
    if (!HealthDataService.instance) {
      HealthDataService.instance = new HealthDataService();
    }
    return HealthDataService.instance;
  }

  private async initializeService() {
    // Load saved data from previous sessions
    await this.loadStoredData();
    // Start real-time tracking
    await this.startStepTracking();
  }

  private async loadStoredData() {
    try {
      const today = new Date().toDateString();
      const storedData = await AsyncStorage.getItem(`health_data_${today}`);

      if (storedData) {
        const data = JSON.parse(storedData);
        this.dailySteps = data.steps || 0;
        this.calories = data.calories || 0;
        this.distance = data.distance || 0;
        this.activeMinutes = data.activeMinutes || 0;
      }
    } catch (error) {
      console.log('Error loading stored health data:', error);
    }
  }

  private async saveData() {
    try {
      const today = new Date().toDateString();
      const data = {
        steps: this.dailySteps,
        calories: this.calories,
        distance: this.distance,
        activeMinutes: this.activeMinutes,
        lastUpdated: new Date().toISOString(),
      };

      await AsyncStorage.setItem(`health_data_${today}`, JSON.stringify(data));
    } catch (error) {
      console.log('Error saving health data:', error);
    }
  }

  async startStepTracking() {
    if (this.isTracking) return;

    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.log('Pedometer not available on this device');
        return;
      }

      // Get today's steps from device
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();

      // Get steps from start of day
      const result = await Pedometer.getStepCountAsync(start, end);
      if (result) {
        this.dailySteps = result.steps;
        this.updateCaloriesFromSteps();
        this.updateDistanceFromSteps();
      }

      // Subscribe to real-time step updates
      this.pedometerSubscription = Pedometer.watchStepCount((result) => {
        this.stepCount = result.steps;
        this.dailySteps += 1; // Increment daily steps
        this.updateCaloriesFromSteps();
        this.updateDistanceFromSteps();
        this.updateActiveMinutes();
        this.saveData(); // Save updated data
      });

      this.isTracking = true;
      console.log('Step tracking started successfully');
    } catch (error) {
      console.log('Error starting step tracking:', error);
    }
  }

  stopStepTracking() {
    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }
    this.isTracking = false;
  }

  private updateCaloriesFromSteps() {
    // Rough estimation: 1 step = 0.04 calories (varies by weight/height)
    this.calories = Math.round(this.dailySteps * 0.04);
  }

  private updateDistanceFromSteps() {
    // Rough estimation: 1 step = 0.75 meters (varies by stride length)
    this.distance = Math.round((this.dailySteps * 0.75) / 1000 * 100) / 100; // Convert to km
  }

  private updateActiveMinutes() {
    // Estimate active minutes based on step patterns
    // Rough estimation: 100 steps per minute during active periods
    this.activeMinutes = Math.round(this.dailySteps / 100);
  }

  // Get current health metrics
  getCurrentMetrics(): HealthMetrics {
    return {
      steps: this.dailySteps,
      calories: this.calories,
      distance: this.distance,
      activeMinutes: this.activeMinutes,
      heartRate: this.getEstimatedHeartRate(), // Estimated since we don't have HR sensor access
      lastUpdated: new Date(),
    };
  }

  private getEstimatedHeartRate(): number {
    // Since most devices don't have accessible HR sensors, return estimated value
    // In real implementation, integrate with device health APIs
    const baseRate = 72;
    const variation = Math.sin(Date.now() / 60000) * 8; // Slight variation over time
    return Math.round(baseRate + variation);
  }

  // Get default daily goals
  getDefaultGoals(): DailyGoals {
    return {
      steps: 10000,
      calories: 2000,
      activeMinutes: 30,
      water: 8, // 8 glasses
    };
  }

  // Update goals (user can customize)
  async updateGoals(goals: DailyGoals) {
    try {
      await AsyncStorage.setItem('daily_goals', JSON.stringify(goals));
    } catch (error) {
      console.log('Error saving goals:', error);
    }
  }

  async getStoredGoals(): Promise<DailyGoals> {
    try {
      const storedGoals = await AsyncStorage.getItem('daily_goals');
      if (storedGoals) {
        return JSON.parse(storedGoals);
      }
    } catch (error) {
      console.log('Error loading goals:', error);
    }
    return this.getDefaultGoals();
  }

  // Manual data entry methods
  async addSteps(steps: number) {
    this.dailySteps += steps;
    this.updateCaloriesFromSteps();
    this.updateDistanceFromSteps();
    this.updateActiveMinutes();
    await this.saveData();
  }

  async addCalories(calories: number) {
    this.calories += calories;
    await this.saveData();
  }

  async addActiveMinutes(minutes: number) {
    this.activeMinutes += minutes;
    await this.saveData();
  }

  // Get historical data for charts
  async getWeeklyData(): Promise<HealthMetrics[]> {
    const weekData: HealthMetrics[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toDateString();

      try {
        const storedData = await AsyncStorage.getItem(`health_data_${dateKey}`);
        if (storedData) {
          const data = JSON.parse(storedData);
          weekData.push({
            steps: data.steps || 0,
            calories: data.calories || 0,
            distance: data.distance || 0,
            activeMinutes: data.activeMinutes || 0,
            heartRate: data.heartRate || 72,
            lastUpdated: new Date(data.lastUpdated || date),
          });
        } else {
          // No data for this day
          weekData.push({
            steps: 0,
            calories: 0,
            distance: 0,
            activeMinutes: 0,
            heartRate: 72,
            lastUpdated: date,
          });
        }
      } catch (error) {
        console.log(`Error loading data for ${dateKey}:`, error);
        weekData.push({
          steps: 0,
          calories: 0,
          distance: 0,
          activeMinutes: 0,
          heartRate: 72,
          lastUpdated: date,
        });
      }
    }

    return weekData;
  }

  // Reset daily data (called at midnight)
  async resetDailyData() {
    // Save yesterday's data before reset
    await this.saveData();

    // Reset counters for new day
    this.dailySteps = 0;
    this.calories = 0;
    this.distance = 0;
    this.activeMinutes = 0;

    // Restart step tracking for new day
    this.stopStepTracking();
    await this.startStepTracking();
  }
}

export default HealthDataService.getInstance();
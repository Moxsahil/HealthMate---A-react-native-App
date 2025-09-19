import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pedometer, Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';

export interface ActivitySession {
  id: string;
  type: 'walking' | 'running' | 'cycling' | 'workout' | 'other';
  startTime: Date;
  endTime: Date | null;
  duration: number; // in seconds
  steps: number;
  distance: number; // in meters
  calories: number;
  isActive: boolean;
  route?: { latitude: number; longitude: number; timestamp: Date }[];
}

export interface ActivityStats {
  totalSessions: number;
  totalDuration: number;
  totalSteps: number;
  totalDistance: number;
  totalCalories: number;
  averageSessionDuration: number;
  mostActiveDay: string;
}

class ActivityTrackingService {
  private static instance: ActivityTrackingService;
  private currentSession: ActivitySession | null = null;
  private sessionStartSteps: number = 0;
  private sessionStartTime: Date = new Date();
  private pedometerSubscription: any = null;
  private accelerometerSubscription: any = null;
  private locationSubscription: any = null;
  private isTracking: boolean = false;
  private activityThreshold: number = 0.1; // Accelerometer threshold for detecting movement

  private constructor() {}

  static getInstance(): ActivityTrackingService {
    if (!ActivityTrackingService.instance) {
      ActivityTrackingService.instance = new ActivityTrackingService();
    }
    return ActivityTrackingService.instance;
  }

  async startActivitySession(
    activityType: 'walking' | 'running' | 'cycling' | 'workout' | 'other' = 'walking'
  ): Promise<string> {
    if (this.isTracking) {
      throw new Error('Activity session already in progress');
    }

    const sessionId = `session_${Date.now()}`;
    const startTime = new Date();

    // Get current step count to use as baseline
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const stepResult = await Pedometer.getStepCountAsync(todayStart, startTime);
      this.sessionStartSteps = stepResult ? stepResult.steps : 0;
    } catch (error) {
      console.log('Could not get initial step count:', error);
      this.sessionStartSteps = 0;
    }

    this.currentSession = {
      id: sessionId,
      type: activityType,
      startTime,
      endTime: null,
      duration: 0,
      steps: 0,
      distance: 0,
      calories: 0,
      isActive: true,
      route: [],
    };

    this.sessionStartTime = startTime;
    this.isTracking = true;

    // Start sensor monitoring
    await this.startSensorMonitoring();

    return sessionId;
  }

  async stopActivitySession(): Promise<ActivitySession | null> {
    if (!this.isTracking || !this.currentSession) {
      return null;
    }

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - this.sessionStartTime.getTime()) / 1000);

    // Stop all sensor monitoring
    this.stopSensorMonitoring();

    // Finalize session data
    this.currentSession.endTime = endTime;
    this.currentSession.duration = duration;
    this.currentSession.isActive = false;
    this.currentSession.calories = this.calculateCalories(
      this.currentSession.steps,
      this.currentSession.distance,
      this.currentSession.type,
      duration
    );

    // Save session to storage
    await this.saveActivitySession(this.currentSession);

    const completedSession = { ...this.currentSession };
    this.currentSession = null;
    this.isTracking = false;

    return completedSession;
  }

  private async startSensorMonitoring() {
    try {
      // Start pedometer monitoring
      const isPedometerAvailable = await Pedometer.isAvailableAsync();
      if (isPedometerAvailable) {
        this.pedometerSubscription = Pedometer.watchStepCount((result) => {
          if (this.currentSession) {
            this.currentSession.steps = Math.max(0, result.steps - this.sessionStartSteps);
            this.currentSession.distance = this.calculateDistance(this.currentSession.steps);
          }
        });
      }

      // Start accelerometer monitoring for activity detection
      Accelerometer.setUpdateInterval(1000); // Update every second
      this.accelerometerSubscription = Accelerometer.addListener((accelerometerData) => {
        const { x, y, z } = accelerometerData;
        const magnitude = Math.sqrt(x * x + y * y + z * z);

        // Detect if user is actively moving
        if (magnitude > this.activityThreshold && this.currentSession) {
          // User is actively moving - this helps distinguish between different activity types
        }
      });

      // Start location tracking (if permission granted)
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        this.locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000, // Update every 5 seconds
            distanceInterval: 10, // Or every 10 meters
          },
          (location) => {
            if (this.currentSession && this.currentSession.route) {
              this.currentSession.route.push({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                timestamp: new Date(),
              });

              // Calculate distance from GPS route if available
              if (this.currentSession.route.length > 1) {
                const gpsDistance = this.calculateGPSDistance(this.currentSession.route);
                // Use GPS distance if it's reasonable compared to step-based distance
                if (gpsDistance > 0 && gpsDistance < this.currentSession.distance * 2) {
                  this.currentSession.distance = gpsDistance;
                }
              }
            }
          }
        );
      }
    } catch (error) {
      console.log('Error starting sensor monitoring:', error);
    }
  }

  private stopSensorMonitoring() {
    if (this.pedometerSubscription) {
      this.pedometerSubscription.remove();
      this.pedometerSubscription = null;
    }

    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
  }

  private calculateDistance(steps: number): number {
    // Average step length varies by person, but roughly 0.75 meters per step
    return steps * 0.75;
  }

  private calculateGPSDistance(route: { latitude: number; longitude: number }[]): number {
    if (route.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < route.length; i++) {
      const prev = route[i - 1];
      const curr = route[i];
      totalDistance += this.haversineDistance(prev, curr);
    }
    return totalDistance;
  }

  private haversineDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const dLon = ((point2.longitude - point1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1.latitude * Math.PI) / 180) *
        Math.cos((point2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private calculateCalories(
    steps: number,
    distance: number,
    activityType: string,
    duration: number
  ): number {
    // Base calorie calculation
    let caloriesPerMinute = 3; // Base metabolic rate

    // Adjust based on activity type
    switch (activityType) {
      case 'walking':
        caloriesPerMinute = 4;
        break;
      case 'running':
        caloriesPerMinute = 12;
        break;
      case 'cycling':
        caloriesPerMinute = 8;
        break;
      case 'workout':
        caloriesPerMinute = 10;
        break;
      default:
        caloriesPerMinute = 5;
    }

    const durationMinutes = duration / 60;
    return Math.round(caloriesPerMinute * durationMinutes);
  }

  async getCurrentSession(): Promise<ActivitySession | null> {
    if (this.currentSession && this.isTracking) {
      // Update duration in real-time
      const now = new Date();
      this.currentSession.duration = Math.round(
        (now.getTime() - this.sessionStartTime.getTime()) / 1000
      );
      return { ...this.currentSession };
    }
    return null;
  }

  async pauseSession(): Promise<void> {
    if (this.isTracking) {
      this.stopSensorMonitoring();
      // Keep session data but stop tracking
    }
  }

  async resumeSession(): Promise<void> {
    if (this.currentSession && !this.isTracking) {
      this.isTracking = true;
      await this.startSensorMonitoring();
    }
  }

  private async saveActivitySession(session: ActivitySession): Promise<void> {
    try {
      const today = new Date().toDateString();
      const storageKey = `activity_sessions_${today}`;

      const existingData = await AsyncStorage.getItem(storageKey);
      const sessions = existingData ? JSON.parse(existingData) : [];

      sessions.push({
        ...session,
        startTime: session.startTime.toISOString(),
        endTime: session.endTime?.toISOString(),
      });

      await AsyncStorage.setItem(storageKey, JSON.stringify(sessions));
    } catch (error) {
      console.log('Error saving activity session:', error);
    }
  }

  async getTodaySessions(): Promise<ActivitySession[]> {
    try {
      const today = new Date().toDateString();
      const storageKey = `activity_sessions_${today}`;
      const data = await AsyncStorage.getItem(storageKey);

      if (data) {
        const sessions = JSON.parse(data);
        return sessions.map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : null,
        }));
      }
      return [];
    } catch (error) {
      console.log('Error loading today sessions:', error);
      return [];
    }
  }

  async getWeeklyStats(): Promise<ActivityStats> {
    try {
      let totalSessions = 0;
      let totalDuration = 0;
      let totalSteps = 0;
      let totalDistance = 0;
      let totalCalories = 0;
      const dailyStats: { [key: string]: number } = {};

      // Get data for the last 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toDateString();
        const storageKey = `activity_sessions_${dateKey}`;

        const data = await AsyncStorage.getItem(storageKey);
        if (data) {
          const sessions = JSON.parse(data);
          const dayTotal = sessions.reduce((sum: number, session: any) => sum + session.duration, 0);
          dailyStats[dateKey] = dayTotal;

          sessions.forEach((session: any) => {
            totalSessions++;
            totalDuration += session.duration;
            totalSteps += session.steps;
            totalDistance += session.distance;
            totalCalories += session.calories;
          });
        }
      }

      const mostActiveDay = Object.keys(dailyStats).reduce((a, b) =>
        dailyStats[a] > dailyStats[b] ? a : b
      ) || new Date().toDateString();

      return {
        totalSessions,
        totalDuration,
        totalSteps,
        totalDistance,
        totalCalories,
        averageSessionDuration: totalSessions > 0 ? totalDuration / totalSessions : 0,
        mostActiveDay,
      };
    } catch (error) {
      console.log('Error calculating weekly stats:', error);
      return {
        totalSessions: 0,
        totalDuration: 0,
        totalSteps: 0,
        totalDistance: 0,
        totalCalories: 0,
        averageSessionDuration: 0,
        mostActiveDay: new Date().toDateString(),
      };
    }
  }

  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      // Find and remove session from storage
      for (let i = 0; i < 30; i++) { // Check last 30 days
        const date = new Date();
        date.setDate(date.getDate() - i);
        const storageKey = `activity_sessions_${date.toDateString()}`;

        const data = await AsyncStorage.getItem(storageKey);
        if (data) {
          const sessions = JSON.parse(data);
          const filteredSessions = sessions.filter((s: any) => s.id !== sessionId);

          if (sessions.length !== filteredSessions.length) {
            await AsyncStorage.setItem(storageKey, JSON.stringify(filteredSessions));
            break;
          }
        }
      }
    } catch (error) {
      console.log('Error deleting session:', error);
    }
  }
}

export default ActivityTrackingService.getInstance();
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

// AsyncStorage keys
export const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  HEALTH_GOALS: 'health_goals',
  NUTRITION_GOALS: 'nutrition_goals',
  SLEEP_GOALS: 'sleep_goals',
  APP_SETTINGS: 'app_settings',
  THEME_PREFERENCE: 'theme_preference',
} as const;

// AsyncStorage service for simple key-value storage
export class AsyncStorageService {
  static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error storing data for key ${key}:`, error);
      throw error;
    }
  }

  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error retrieving data for key ${key}:`, error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error);
      throw error;
    }
  }

  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
      throw error;
    }
  }
}

// SQLite service for complex data storage
export class DatabaseService {
  private static database: SQLite.SQLiteDatabase | null = null;

  static async initializeDatabase(): Promise<void> {
    try {
      this.database = await SQLite.openDatabaseAsync('healthmate.db');
      await this.createTables();
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private static async createTables(): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      // Health metrics table
      await this.database.execAsync(`
        CREATE TABLE IF NOT EXISTS health_metrics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          steps INTEGER DEFAULT 0,
          calories INTEGER DEFAULT 0,
          distance INTEGER DEFAULT 0,
          heart_rate INTEGER DEFAULT 0,
          water_intake INTEGER DEFAULT 0,
          active_minutes INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Meals table
      await this.database.execAsync(`
        CREATE TABLE IF NOT EXISTS meals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          date TEXT NOT NULL,
          total_calories INTEGER NOT NULL,
          total_protein INTEGER NOT NULL,
          total_carbs INTEGER NOT NULL,
          total_fat INTEGER NOT NULL,
          foods TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Sleep sessions table
      await this.database.execAsync(`
        CREATE TABLE IF NOT EXISTS sleep_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          bedtime TEXT NOT NULL,
          wake_time TEXT NOT NULL,
          duration INTEGER NOT NULL,
          quality INTEGER NOT NULL,
          deep_sleep INTEGER DEFAULT 0,
          rem_sleep INTEGER DEFAULT 0,
          light_sleep INTEGER DEFAULT 0,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Workouts table
      await this.database.execAsync(`
        CREATE TABLE IF NOT EXISTS workouts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          duration INTEGER NOT NULL,
          calories_burned INTEGER NOT NULL,
          exercises TEXT NOT NULL,
          date TEXT NOT NULL,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('Database tables created successfully');
    } catch (error) {
      console.error('Error creating database tables:', error);
      throw error;
    }
  }

  // Health metrics operations
  static async saveHealthMetrics(date: string, metrics: any): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      await this.database.runAsync(`
        INSERT OR REPLACE INTO health_metrics
        (date, steps, calories, distance, heart_rate, water_intake, active_minutes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        date,
        metrics.steps,
        metrics.calories,
        metrics.distance,
        metrics.heartRate,
        metrics.waterIntake,
        metrics.activeMinutes
      ]);
    } catch (error) {
      console.error('Error saving health metrics:', error);
      throw error;
    }
  }

  static async getHealthMetrics(startDate: string, endDate: string): Promise<any[]> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      const result = await this.database.getAllAsync(`
        SELECT * FROM health_metrics
        WHERE date BETWEEN ? AND ?
        ORDER BY date DESC
      `, [startDate, endDate]);

      return result;
    } catch (error) {
      console.error('Error retrieving health metrics:', error);
      throw error;
    }
  }

  // Meal operations
  static async saveMeal(meal: any): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      await this.database.runAsync(`
        INSERT INTO meals
        (type, date, total_calories, total_protein, total_carbs, total_fat, foods, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        meal.type,
        meal.date,
        meal.totalCalories,
        meal.totalProtein,
        meal.totalCarbs,
        meal.totalFat,
        JSON.stringify(meal.foods),
        meal.timestamp
      ]);
    } catch (error) {
      console.error('Error saving meal:', error);
      throw error;
    }
  }

  static async getMeals(date: string): Promise<any[]> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      const result = await this.database.getAllAsync(`
        SELECT * FROM meals
        WHERE date = ?
        ORDER BY timestamp ASC
      `, [date]);

      return result.map((meal: any) => ({
        ...meal,
        foods: JSON.parse(meal.foods as string)
      }));
    } catch (error) {
      console.error('Error retrieving meals:', error);
      throw error;
    }
  }

  // Sleep operations
  static async saveSleepSession(session: any): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      await this.database.runAsync(`
        INSERT INTO sleep_sessions
        (bedtime, wake_time, duration, quality, deep_sleep, rem_sleep, light_sleep, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        session.bedtime,
        session.wakeTime,
        session.duration,
        session.quality,
        session.deepSleep || 0,
        session.remSleep || 0,
        session.lightSleep || 0,
        session.notes || ''
      ]);
    } catch (error) {
      console.error('Error saving sleep session:', error);
      throw error;
    }
  }

  static async getSleepSessions(limit: number = 30): Promise<any[]> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      const result = await this.database.getAllAsync(`
        SELECT * FROM sleep_sessions
        ORDER BY bedtime DESC
        LIMIT ?
      `, [limit]);

      return result;
    } catch (error) {
      console.error('Error retrieving sleep sessions:', error);
      throw error;
    }
  }

  // Workout operations
  static async saveWorkout(workout: any): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      await this.database.runAsync(`
        INSERT INTO workouts
        (name, duration, calories_burned, exercises, date, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        workout.name,
        workout.duration,
        workout.caloriesBurned,
        JSON.stringify(workout.exercises),
        workout.date,
        workout.notes || ''
      ]);
    } catch (error) {
      console.error('Error saving workout:', error);
      throw error;
    }
  }

  static async getWorkouts(limit: number = 50): Promise<any[]> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      const result = await this.database.getAllAsync(`
        SELECT * FROM workouts
        ORDER BY date DESC
        LIMIT ?
      `, [limit]);

      return result.map((workout: any) => ({
        ...workout,
        exercises: JSON.parse(workout.exercises as string)
      }));
    } catch (error) {
      console.error('Error retrieving workouts:', error);
      throw error;
    }
  }

  // Utility methods
  static async clearAllData(): Promise<void> {
    if (!this.database) throw new Error('Database not initialized');

    try {
      await this.database.execAsync(`
        DELETE FROM health_metrics;
        DELETE FROM meals;
        DELETE FROM sleep_sessions;
        DELETE FROM workouts;
      `);
      console.log('All database data cleared');
    } catch (error) {
      console.error('Error clearing database:', error);
      throw error;
    }
  }

  static async closeDatabase(): Promise<void> {
    if (this.database) {
      await this.database.closeAsync();
      this.database = null;
    }
  }
}
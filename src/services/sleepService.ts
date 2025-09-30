import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SleepSession {
  id: string;
  date: string; // YYYY-MM-DD format
  bedtime: string;
  wakeTime: string;
  duration: number; // in minutes
  quality: 1 | 2 | 3 | 4 | 5; // 1-5 scale
  notes?: string;
  deepSleep?: number; // percentage
  remSleep?: number; // percentage
  lightSleep?: number; // percentage
  sleepEfficiency?: number; // percentage
  createdAt: string;
  updatedAt: string;
}

export interface SleepGoals {
  bedtime: string; // HH:MM format
  wakeTime: string; // HH:MM format
  duration: number; // in minutes
  quality: number; // target quality score
  targetSleepHours: number; // decimal hours
}

export interface SleepStats {
  weeklyAverage: {
    duration: number;
    quality: number;
    bedtime: string;
    wakeTime: string;
    sleepEfficiency: number;
  };
  monthlyAverage: {
    duration: number;
    quality: number;
    bedtime: string;
    wakeTime: string;
    sleepEfficiency: number;
  };
  consistency: number;
  trends: {
    sleepDurationTrend: 'improving' | 'declining' | 'stable';
    bedtimeTrend: 'earlier' | 'later' | 'consistent';
    efficiencyTrend: 'improving' | 'declining' | 'stable';
  };
}

const STORAGE_KEYS = {
  SLEEP_SESSIONS: '@HealthMate:sleepSessions',
  SLEEP_GOALS: '@HealthMate:sleepGoals',
  SLEEP_PREFERENCES: '@HealthMate:sleepPreferences',
} as const;

class SleepService {
  // Save sleep sessions to local storage
  async saveSleepSessions(sessions: SleepSession[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(sessions);
      await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_SESSIONS, jsonValue);
    } catch (error) {
      console.error('Error saving sleep sessions:', error);
      throw new Error('Failed to save sleep sessions');
    }
  }

  // Load sleep sessions from local storage
  async loadSleepSessions(): Promise<SleepSession[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.SLEEP_SESSIONS);
      if (jsonValue) {
        const sessions = JSON.parse(jsonValue) as SleepSession[];
        // Sort by date descending (most recent first)
        return sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
      return [];
    } catch (error) {
      console.error('Error loading sleep sessions:', error);
      return [];
    }
  }

  // Save sleep goals to local storage
  async saveSleepGoals(goals: SleepGoals): Promise<void> {
    try {
      const jsonValue = JSON.stringify(goals);
      await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_GOALS, jsonValue);
    } catch (error) {
      console.error('Error saving sleep goals:', error);
      throw new Error('Failed to save sleep goals');
    }
  }

  // Load sleep goals from local storage
  async loadSleepGoals(): Promise<SleepGoals | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.SLEEP_GOALS);
      return jsonValue ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error loading sleep goals:', error);
      return null;
    }
  }

  // Add a new sleep session
  async addSleepSession(session: SleepSession): Promise<void> {
    try {
      const existingSessions = await this.loadSleepSessions();

      // Remove any existing session for the same date
      const filteredSessions = existingSessions.filter(s => s.date !== session.date);

      // Add the new session
      const updatedSessions = [session, ...filteredSessions];

      // Keep only the last 365 days (1 year)
      const oneYearAgo = new Date();
      oneYearAgo.setDate(oneYearAgo.getDate() - 365);

      const recentSessions = updatedSessions.filter(s =>
        new Date(s.date) >= oneYearAgo
      );

      await this.saveSleepSessions(recentSessions);
    } catch (error) {
      console.error('Error adding sleep session:', error);
      throw new Error('Failed to add sleep session');
    }
  }

  // Update an existing sleep session
  async updateSleepSession(updatedSession: SleepSession): Promise<void> {
    try {
      const sessions = await this.loadSleepSessions();
      const sessionIndex = sessions.findIndex(s => s.id === updatedSession.id);

      if (sessionIndex === -1) {
        throw new Error('Sleep session not found');
      }

      sessions[sessionIndex] = {
        ...updatedSession,
        updatedAt: new Date().toISOString(),
      };

      await this.saveSleepSessions(sessions);
    } catch (error) {
      console.error('Error updating sleep session:', error);
      throw new Error('Failed to update sleep session');
    }
  }

  // Delete a sleep session
  async deleteSleepSession(sessionId: string): Promise<void> {
    try {
      const sessions = await this.loadSleepSessions();
      const filteredSessions = sessions.filter(s => s.id !== sessionId);
      await this.saveSleepSessions(filteredSessions);
    } catch (error) {
      console.error('Error deleting sleep session:', error);
      throw new Error('Failed to delete sleep session');
    }
  }

  // Get sleep sessions for a specific date range
  async getSleepSessionsInRange(startDate: Date, endDate: Date): Promise<SleepSession[]> {
    try {
      const sessions = await this.loadSleepSessions();
      return sessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= startDate && sessionDate <= endDate;
      });
    } catch (error) {
      console.error('Error getting sleep sessions in range:', error);
      return [];
    }
  }

  // Calculate sleep statistics
  calculateSleepStats(sessions: SleepSession[]): SleepStats {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weeklyRecords = sessions.filter(
      record => new Date(record.date) >= oneWeekAgo
    );
    const monthlyRecords = sessions.filter(
      record => new Date(record.date) >= oneMonthAgo
    );

    const calculateAverage = (records: SleepSession[]) => {
      if (records.length === 0) {
        return {
          duration: 0,
          quality: 0,
          bedtime: '22:00',
          wakeTime: '07:00',
          sleepEfficiency: 0,
        };
      }

      const duration = records.reduce((sum, record) => sum + record.duration, 0) / records.length;
      const quality = records.reduce((sum, record) => sum + record.quality, 0) / records.length;
      const sleepEfficiency = records.reduce((sum, record) => sum + (record.sleepEfficiency || 80), 0) / records.length;

      // Calculate average bedtime and wake time
      const bedtimes = records.map(record => {
        const [hours, minutes] = record.bedtime.split(':').map(Number);
        return hours * 60 + minutes;
      });
      const wakeTimes = records.map(record => {
        const [hours, minutes] = record.wakeTime.split(':').map(Number);
        return hours * 60 + minutes;
      });

      const avgBedtime = bedtimes.reduce((sum, time) => sum + time, 0) / bedtimes.length;
      const avgWakeTime = wakeTimes.reduce((sum, time) => sum + time, 0) / wakeTimes.length;

      const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      };

      return {
        duration,
        quality,
        bedtime: formatTime(avgBedtime),
        wakeTime: formatTime(avgWakeTime),
        sleepEfficiency,
      };
    };

    // Calculate consistency (percentage of days with good sleep efficiency)
    const targetEfficiency = 80;
    const consistency = sessions.length > 0
      ? (sessions.filter(record => (record.sleepEfficiency || 80) >= targetEfficiency).length / sessions.length) * 100
      : 0;

    // Calculate trends (comparing recent vs older data)
    const recentRecords = sessions.slice(0, 14); // Last 2 weeks
    const olderRecords = sessions.slice(14, 28); // Previous 2 weeks

    let sleepDurationTrend: 'improving' | 'declining' | 'stable' = 'stable';
    let bedtimeTrend: 'earlier' | 'later' | 'consistent' = 'consistent';
    let efficiencyTrend: 'improving' | 'declining' | 'stable' = 'stable';

    if (recentRecords.length > 0 && olderRecords.length > 0) {
      // Duration trend
      const recentAvgDuration = recentRecords.reduce((sum, r) => sum + r.duration, 0) / recentRecords.length;
      const olderAvgDuration = olderRecords.reduce((sum, r) => sum + r.duration, 0) / olderRecords.length;

      if (recentAvgDuration > olderAvgDuration + 15) {
        sleepDurationTrend = 'improving';
      } else if (recentAvgDuration < olderAvgDuration - 15) {
        sleepDurationTrend = 'declining';
      }

      // Bedtime trend
      const recentAvgBedtime = recentRecords.reduce((sum, record) => {
        const [hours, minutes] = record.bedtime.split(':').map(Number);
        return sum + (hours * 60 + minutes);
      }, 0) / recentRecords.length;

      const olderAvgBedtime = olderRecords.reduce((sum, record) => {
        const [hours, minutes] = record.bedtime.split(':').map(Number);
        return sum + (hours * 60 + minutes);
      }, 0) / olderRecords.length;

      if (recentAvgBedtime < olderAvgBedtime - 15) {
        bedtimeTrend = 'earlier';
      } else if (recentAvgBedtime > olderAvgBedtime + 15) {
        bedtimeTrend = 'later';
      }

      // Efficiency trend
      const recentAvgEfficiency = recentRecords.reduce((sum, r) => sum + (r.sleepEfficiency || 80), 0) / recentRecords.length;
      const olderAvgEfficiency = olderRecords.reduce((sum, r) => sum + (r.sleepEfficiency || 80), 0) / olderRecords.length;

      if (recentAvgEfficiency > olderAvgEfficiency + 5) {
        efficiencyTrend = 'improving';
      } else if (recentAvgEfficiency < olderAvgEfficiency - 5) {
        efficiencyTrend = 'declining';
      }
    }

    return {
      weeklyAverage: calculateAverage(weeklyRecords),
      monthlyAverage: calculateAverage(monthlyRecords),
      consistency,
      trends: {
        sleepDurationTrend,
        bedtimeTrend,
        efficiencyTrend,
      },
    };
  }

  // Generate sleep insights based on data patterns
  generateSleepInsights(sessions: SleepSession[], goals: SleepGoals): Array<{
    id: string;
    type: 'positive' | 'neutral' | 'warning';
    title: string;
    description: string;
    icon: string;
    color: string;
    createdAt: string;
  }> {
    const recentRecords = sessions.slice(0, 7); // Last 7 days
    const insights: Array<{
      id: string;
      type: 'positive' | 'neutral' | 'warning';
      title: string;
      description: string;
      icon: string;
      color: string;
      createdAt: string;
    }> = [];

    if (recentRecords.length === 0) {
      return insights;
    }

    const avgDuration = recentRecords.reduce((sum, r) => sum + r.duration, 0) / recentRecords.length;
    const avgEfficiency = recentRecords.reduce((sum, r) => sum + (r.sleepEfficiency || 80), 0) / recentRecords.length;
    const avgQuality = recentRecords.reduce((sum, r) => sum + r.quality, 0) / recentRecords.length;

    // Sleep duration insight
    const targetMinutes = goals.targetSleepHours * 60;
    if (avgDuration >= targetMinutes) {
      insights.push({
        id: 'sleep-duration-good',
        type: 'positive',
        title: 'Great Sleep Duration!',
        description: `You're averaging ${(avgDuration / 60).toFixed(1)} hours of sleep, meeting your ${goals.targetSleepHours}h goal.`,
        icon: 'trending-up',
        color: '#4CAF50',
        createdAt: new Date().toISOString(),
      });
    } else {
      const deficit = (targetMinutes - avgDuration) / 60;
      insights.push({
        id: 'sleep-duration-low',
        type: 'warning',
        title: 'Sleep Duration Below Goal',
        description: `You're averaging ${(avgDuration / 60).toFixed(1)} hours, ${deficit.toFixed(1)}h below your goal.`,
        icon: 'schedule',
        color: '#FF9800',
        createdAt: new Date().toISOString(),
      });
    }

    // Sleep efficiency insight
    if (avgEfficiency >= 85) {
      insights.push({
        id: 'efficiency-excellent',
        type: 'positive',
        title: 'Excellent Sleep Efficiency',
        description: `Your ${avgEfficiency.toFixed(0)}% sleep efficiency is excellent! You fall asleep quickly and stay asleep.`,
        icon: 'psychology',
        color: '#2196F3',
        createdAt: new Date().toISOString(),
      });
    } else if (avgEfficiency < 70) {
      insights.push({
        id: 'efficiency-poor',
        type: 'warning',
        title: 'Sleep Efficiency Needs Improvement',
        description: `Your ${avgEfficiency.toFixed(0)}% sleep efficiency suggests difficulty falling or staying asleep.`,
        icon: 'psychology',
        color: '#F44336',
        createdAt: new Date().toISOString(),
      });
    }

    // Sleep quality insight
    if (avgQuality >= 4) {
      insights.push({
        id: 'quality-good',
        type: 'positive',
        title: 'High Sleep Quality',
        description: `Your average sleep quality rating is ${avgQuality.toFixed(1)}/5 - you're sleeping well!`,
        icon: 'bedtime',
        color: '#4CAF50',
        createdAt: new Date().toISOString(),
      });
    }

    // Consistency insight
    const consistency = this.calculateSleepStats(sessions).consistency;
    if (consistency >= 80) {
      insights.push({
        id: 'consistency-good',
        type: 'positive',
        title: 'Great Sleep Consistency',
        description: `You maintain good sleep efficiency ${consistency.toFixed(0)}% of the time. Keep it up!`,
        icon: 'schedule',
        color: '#4CAF50',
        createdAt: new Date().toISOString(),
      });
    } else if (consistency < 50) {
      insights.push({
        id: 'consistency-poor',
        type: 'warning',
        title: 'Inconsistent Sleep Pattern',
        description: `Your sleep consistency is ${consistency.toFixed(0)}%. Try to maintain regular sleep and wake times.`,
        icon: 'schedule',
        color: '#FF9800',
        createdAt: new Date().toISOString(),
      });
    }

    return insights;
  }

  // Backup data to JSON
  async exportSleepData(): Promise<string> {
    try {
      const sessions = await this.loadSleepSessions();
      const goals = await this.loadSleepGoals();

      const exportData = {
        sessions,
        goals,
        exportDate: new Date().toISOString(),
        version: '1.0',
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting sleep data:', error);
      throw new Error('Failed to export sleep data');
    }
  }

  // Import data from JSON
  async importSleepData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);

      if (data.sessions && Array.isArray(data.sessions)) {
        await this.saveSleepSessions(data.sessions);
      }

      if (data.goals) {
        await this.saveSleepGoals(data.goals);
      }
    } catch (error) {
      console.error('Error importing sleep data:', error);
      throw new Error('Failed to import sleep data');
    }
  }

  // Clear all sleep data
  async clearAllSleepData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.SLEEP_SESSIONS,
        STORAGE_KEYS.SLEEP_GOALS,
        STORAGE_KEYS.SLEEP_PREFERENCES,
      ]);
    } catch (error) {
      console.error('Error clearing sleep data:', error);
      throw new Error('Failed to clear sleep data');
    }
  }
}

// Export singleton instance
export const sleepService = new SleepService();
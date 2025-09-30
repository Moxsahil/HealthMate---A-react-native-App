import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { sleepService, SleepSession, SleepGoals } from '../../services/sleepService';

// Async thunks for data persistence
export const loadSleepData = createAsyncThunk(
  'sleep/loadSleepData',
  async () => {
    const [sessions, goals] = await Promise.all([
      sleepService.loadSleepSessions(),
      sleepService.loadSleepGoals(),
    ]);
    return { sessions, goals };
  }
);

export const addSleepSessionAsync = createAsyncThunk(
  'sleep/addSleepSessionAsync',
  async (session: SleepSession) => {
    await sleepService.addSleepSession(session);
    return session;
  }
);

export const updateSleepSessionAsync = createAsyncThunk(
  'sleep/updateSleepSessionAsync',
  async (session: SleepSession) => {
    await sleepService.updateSleepSession(session);
    return session;
  }
);

export const deleteSleepSessionAsync = createAsyncThunk(
  'sleep/deleteSleepSessionAsync',
  async (sessionId: string) => {
    await sleepService.deleteSleepSession(sessionId);
    return sessionId;
  }
);

export const updateSleepGoalsAsync = createAsyncThunk(
  'sleep/updateSleepGoalsAsync',
  async (goals: SleepGoals) => {
    await sleepService.saveSleepGoals(goals);
    return goals;
  }
);

interface SleepInsight {
  id: string;
  type: 'positive' | 'neutral' | 'warning';
  title: string;
  description: string;
  icon: string;
  color: string;
  createdAt: string;
}

interface SleepStats {
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

interface SleepState {
  recentSleep: SleepSession[];
  sleepGoals: SleepGoals;
  currentSleep: SleepSession | null;
  isSleeping: boolean;
  sleepStartTime: string | null;
  weeklyAverage: {
    duration: number;
    quality: number;
    bedtime: string;
    wakeTime: string;
  } | null;
  stats: SleepStats | null;
  insights: SleepInsight[];
  selectedPeriod: 'Day' | 'Week' | 'Month' | '6M' | 'Year';
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: SleepState = {
  recentSleep: [], // Start with empty array - only real user data
  sleepGoals: {
    bedtime: '22:30',
    wakeTime: '06:30',
    duration: 480, // 8 hours
    quality: 4,
    targetSleepHours: 8,
  },
  currentSleep: null,
  isSleeping: false,
  sleepStartTime: null,
  weeklyAverage: null, // Will be calculated from real data
  stats: null,
  insights: [],
  selectedPeriod: 'Week',
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const sleepSlice = createSlice({
  name: 'sleep',
  initialState,
  reducers: {
    startSleep: (state, action: PayloadAction<string>) => {
      const now = new Date().toISOString();
      state.currentSleep = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        bedtime: action.payload,
        wakeTime: '',
        duration: 0,
        quality: 3,
        createdAt: now,
        updatedAt: now,
      };
      state.isSleeping = true;
      state.sleepStartTime = action.payload;
    },
    endSleep: (state, action: PayloadAction<{ wakeTime: string; quality: 1 | 2 | 3 | 4 | 5; notes?: string }>) => {
      if (state.currentSleep && state.sleepStartTime) {
        const bedtime = new Date(state.sleepStartTime);
        const wakeTime = new Date(action.payload.wakeTime);
        const duration = Math.floor((wakeTime.getTime() - bedtime.getTime()) / (1000 * 60));

        state.currentSleep = {
          ...state.currentSleep,
          wakeTime: action.payload.wakeTime,
          duration,
          quality: action.payload.quality,
          notes: action.payload.notes,
        };

        state.recentSleep.push(state.currentSleep);

        // Keep only last 30 days
        if (state.recentSleep.length > 30) {
          state.recentSleep = state.recentSleep.slice(-30);
        }

        state.currentSleep = null;
        state.isSleeping = false;
        state.sleepStartTime = null;
      }
    },
    addSleepSession: (state, action: PayloadAction<SleepSession>) => {
      state.recentSleep.push(action.payload);
      if (state.recentSleep.length > 30) {
        state.recentSleep = state.recentSleep.slice(-30);
      }
    },
    updateSleepSession: (state, action: PayloadAction<SleepSession>) => {
      const index = state.recentSleep.findIndex(session => session.id === action.payload.id);
      if (index >= 0) {
        state.recentSleep[index] = action.payload;
      }
    },
    deleteSleepSession: (state, action: PayloadAction<string>) => {
      state.recentSleep = state.recentSleep.filter(session => session.id !== action.payload);
    },
    updateSleepGoals: (state, action: PayloadAction<Partial<SleepGoals>>) => {
      state.sleepGoals = { ...state.sleepGoals, ...action.payload };
    },
    setWeeklyAverage: (state, action: PayloadAction<typeof initialState.weeklyAverage>) => {
      state.weeklyAverage = action.payload;
    },
    setRecentSleep: (state, action: PayloadAction<SleepSession[]>) => {
      state.recentSleep = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSelectedPeriod: (state, action: PayloadAction<SleepState['selectedPeriod']>) => {
      state.selectedPeriod = action.payload;
    },
    generateInsights: (state) => {
      const recentRecords = state.recentSleep.slice(0, 7); // Last 7 days
      const insights: SleepInsight[] = [];

      if (recentRecords.length > 0) {
        const avgDuration = recentRecords.reduce((sum, r) => sum + r.duration, 0) / recentRecords.length;
        const avgEfficiency = recentRecords.reduce((sum, r) => sum + (r.sleepEfficiency || 80), 0) / recentRecords.length;
        const avgQuality = recentRecords.reduce((sum, r) => sum + r.quality, 0) / recentRecords.length;

        // Sleep duration insight
        const targetMinutes = state.sleepGoals.targetSleepHours * 60;
        if (avgDuration >= targetMinutes) {
          insights.push({
            id: 'sleep-duration-good',
            type: 'positive',
            title: 'Great Sleep Duration!',
            description: `You're averaging ${(avgDuration / 60).toFixed(1)} hours of sleep, meeting your ${state.sleepGoals.targetSleepHours}h goal.`,
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

        // Weekend pattern insight
        const weekendRecords = recentRecords.filter(record => {
          const dayOfWeek = new Date(record.date).getDay();
          return dayOfWeek === 0 || dayOfWeek === 6;
        });

        if (weekendRecords.length >= 2) {
          const weekendAvgBedtime = weekendRecords.reduce((sum, record) => {
            const [hours, minutes] = record.bedtime.split(':').map(Number);
            return sum + (hours * 60 + minutes);
          }, 0) / weekendRecords.length;

          const weekdayRecords = recentRecords.filter(record => {
            const dayOfWeek = new Date(record.date).getDay();
            return dayOfWeek >= 1 && dayOfWeek <= 5;
          });

          if (weekdayRecords.length >= 2) {
            const weekdayAvgBedtime = weekdayRecords.reduce((sum, record) => {
              const [hours, minutes] = record.bedtime.split(':').map(Number);
              return sum + (hours * 60 + minutes);
            }, 0) / weekdayRecords.length;

            const difference = weekendAvgBedtime - weekdayAvgBedtime;
            if (Math.abs(difference) > 30) {
              insights.push({
                id: 'weekend-pattern',
                type: 'neutral',
                title: 'Weekend Sleep Pattern',
                description: `You sleep ${difference > 0 ? 'later' : 'earlier'} on weekends by about ${Math.round(Math.abs(difference))} minutes.`,
                icon: 'schedule',
                color: '#FF9800',
                createdAt: new Date().toISOString(),
              });
            }
          }
        }
      }

      state.insights = insights;
    },
    calculateStats: (state) => {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const weeklyRecords = state.recentSleep.filter(
        record => new Date(record.date) >= oneWeekAgo
      );
      const monthlyRecords = state.recentSleep.filter(
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

      // Calculate consistency
      const targetEfficiency = 80;
      const consistency = state.recentSleep.length > 0
        ? (state.recentSleep.filter(record => (record.sleepEfficiency || 80) >= targetEfficiency).length / state.recentSleep.length) * 100
        : 0;

      // Calculate trends
      const recentRecords = state.recentSleep.slice(0, 14); // Last 2 weeks
      const olderRecords = state.recentSleep.slice(14, 28); // Previous 2 weeks

      let sleepDurationTrend: 'improving' | 'declining' | 'stable' = 'stable';
      if (recentRecords.length > 0 && olderRecords.length > 0) {
        const recentAvgDuration = recentRecords.reduce((sum, r) => sum + r.duration, 0) / recentRecords.length;
        const olderAvgDuration = olderRecords.reduce((sum, r) => sum + r.duration, 0) / olderRecords.length;

        if (recentAvgDuration > olderAvgDuration + 15) { // 15 minutes improvement
          sleepDurationTrend = 'improving';
        } else if (recentAvgDuration < olderAvgDuration - 15) {
          sleepDurationTrend = 'declining';
        }
      }

      state.stats = {
        weeklyAverage: calculateAverage(weeklyRecords),
        monthlyAverage: calculateAverage(monthlyRecords),
        consistency,
        trends: {
          sleepDurationTrend,
          bedtimeTrend: 'consistent',
          efficiencyTrend: 'stable',
        },
      };
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load sleep data
      .addCase(loadSleepData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadSleepData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recentSleep = action.payload.sessions;
        if (action.payload.goals) {
          state.sleepGoals = action.payload.goals;
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(loadSleepData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load sleep data';
      })
      // Add sleep session
      .addCase(addSleepSessionAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addSleepSessionAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove any existing session for the same date
        state.recentSleep = state.recentSleep.filter(s => s.date !== action.payload.date);
        // Add the new session at the beginning
        state.recentSleep.unshift(action.payload);
        // Keep only last 365 days
        if (state.recentSleep.length > 365) {
          state.recentSleep = state.recentSleep.slice(0, 365);
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(addSleepSessionAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to add sleep session';
      })
      // Update sleep session
      .addCase(updateSleepSessionAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSleepSessionAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.recentSleep.findIndex(s => s.id === action.payload.id);
        if (index >= 0) {
          state.recentSleep[index] = action.payload;
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateSleepSessionAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update sleep session';
      })
      // Delete sleep session
      .addCase(deleteSleepSessionAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSleepSessionAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recentSleep = state.recentSleep.filter(s => s.id !== action.payload);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(deleteSleepSessionAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete sleep session';
      })
      // Update sleep goals
      .addCase(updateSleepGoalsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSleepGoalsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sleepGoals = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateSleepGoalsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update sleep goals';
      });
  },
});

export const {
  startSleep,
  endSleep,
  addSleepSession,
  updateSleepSession,
  deleteSleepSession,
  updateSleepGoals,
  setWeeklyAverage,
  setRecentSleep,
  setLoading,
  setSelectedPeriod,
  generateInsights,
  calculateStats,
  setError,
  clearError,
} = sleepSlice.actions;

// Async thunks are already exported above

export default sleepSlice.reducer;
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface HealthMetrics {
  steps: number;
  calories: number;
  distance: number;
  heartRate: number;
  waterIntake: number;
  activeMinutes: number;
}

interface DailyHealth {
  date: string;
  metrics: HealthMetrics;
  goal: Partial<HealthMetrics>;
}

interface HealthState {
  todayMetrics: HealthMetrics;
  dailyGoals: HealthMetrics;
  weeklyData: DailyHealth[];
  monthlyData: DailyHealth[];
  isLoading: boolean;
  lastUpdated: string | null;
}

const initialState: HealthState = {
  todayMetrics: {
    steps: 0,
    calories: 0,
    distance: 0,
    heartRate: 0,
    waterIntake: 0,
    activeMinutes: 0,
  },
  dailyGoals: {
    steps: 10000,
    calories: 2000,
    distance: 5000, // in meters
    heartRate: 70,
    waterIntake: 8, // glasses
    activeMinutes: 30,
  },
  weeklyData: [],
  monthlyData: [],
  isLoading: false,
  lastUpdated: null,
};

const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    updateTodayMetrics: (state, action: PayloadAction<Partial<HealthMetrics>>) => {
      state.todayMetrics = { ...state.todayMetrics, ...action.payload };
      state.lastUpdated = new Date().toISOString();
    },
    setDailyGoals: (state, action: PayloadAction<Partial<HealthMetrics>>) => {
      state.dailyGoals = { ...state.dailyGoals, ...action.payload };
    },
    addDailyData: (state, action: PayloadAction<DailyHealth>) => {
      const existingIndex = state.weeklyData.findIndex(
        (data) => data.date === action.payload.date
      );
      if (existingIndex >= 0) {
        state.weeklyData[existingIndex] = action.payload;
      } else {
        state.weeklyData.push(action.payload);
      }

      // Keep only last 7 days for weekly data
      if (state.weeklyData.length > 7) {
        state.weeklyData = state.weeklyData.slice(-7);
      }
    },
    setWeeklyData: (state, action: PayloadAction<DailyHealth[]>) => {
      state.weeklyData = action.payload;
    },
    setMonthlyData: (state, action: PayloadAction<DailyHealth[]>) => {
      state.monthlyData = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    resetTodayMetrics: (state) => {
      state.todayMetrics = initialState.todayMetrics;
    },
  },
});

export const {
  updateTodayMetrics,
  setDailyGoals,
  addDailyData,
  setWeeklyData,
  setMonthlyData,
  setLoading,
  resetTodayMetrics,
} = healthSlice.actions;

export default healthSlice.reducer;
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SleepSession {
  id: string;
  bedtime: string;
  wakeTime: string;
  duration: number; // in minutes
  quality: 1 | 2 | 3 | 4 | 5; // 1-5 scale
  notes?: string;
  deepSleep?: number; // percentage
  remSleep?: number; // percentage
  lightSleep?: number; // percentage
}

interface SleepGoals {
  bedtime: string; // HH:MM format
  wakeTime: string; // HH:MM format
  duration: number; // in minutes
  quality: number; // target quality score
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
  isLoading: boolean;
}

const initialState: SleepState = {
  recentSleep: [],
  sleepGoals: {
    bedtime: '22:00',
    wakeTime: '07:00',
    duration: 480, // 8 hours
    quality: 4,
  },
  currentSleep: null,
  isSleeping: false,
  sleepStartTime: null,
  weeklyAverage: null,
  isLoading: false,
};

const sleepSlice = createSlice({
  name: 'sleep',
  initialState,
  reducers: {
    startSleep: (state, action: PayloadAction<string>) => {
      state.currentSleep = {
        id: Date.now().toString(),
        bedtime: action.payload,
        wakeTime: '',
        duration: 0,
        quality: 3,
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
} = sleepSlice.actions;

export default sleepSlice.reducer;
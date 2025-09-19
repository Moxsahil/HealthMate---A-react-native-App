import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import healthSlice from './slices/healthSlice';
import nutritionSlice from './slices/nutritionSlice';
import workoutSlice from './slices/workoutSlice';
import sleepSlice from './slices/sleepSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    health: healthSlice,
    nutrition: nutritionSlice,
    workout: workoutSlice,
    sleep: sleepSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
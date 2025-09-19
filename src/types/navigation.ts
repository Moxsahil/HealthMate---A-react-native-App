import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Modal: {
    screen: string;
    params?: any;
  };
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Activity: undefined;
  Nutrition: undefined;
  Sleep: undefined;
  Workouts: undefined;
  Profile: undefined;
};

export type ActivityStackParamList = {
  ActivityOverview: undefined;
  StepsTracker: undefined;
  HeartRate: undefined;
  CalorieTracker: undefined;
};

export type NutritionStackParamList = {
  NutritionOverview: undefined;
  MealLogger: undefined;
  WaterTracker: undefined;
  FoodSearch: undefined;
  NutritionGoals: undefined;
};

export type SleepStackParamList = {
  SleepOverview: undefined;
  SleepLogger: undefined;
  SleepAnalytics: undefined;
};

export type WorkoutStackParamList = {
  WorkoutOverview: undefined;
  ActiveWorkout: undefined;
  ExerciseLibrary: undefined;
  WorkoutHistory: undefined;
  CreateWorkout: undefined;
};

export type ProfileStackParamList = {
  ProfileOverview: undefined;
  Settings: undefined;
  Goals: undefined;
  Achievements: undefined;
  DataExport: undefined;
};
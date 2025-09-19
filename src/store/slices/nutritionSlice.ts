import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: (Food & { quantity: number })[];
  timestamp: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

interface NutritionState {
  todayMeals: Meal[];
  nutritionGoals: NutritionGoals;
  waterIntake: number;
  isLoading: boolean;
  foodDatabase: Food[];
}

const initialState: NutritionState = {
  todayMeals: [],
  nutritionGoals: {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 67,
    water: 8,
  },
  waterIntake: 0,
  isLoading: false,
  foodDatabase: [],
};

const nutritionSlice = createSlice({
  name: 'nutrition',
  initialState,
  reducers: {
    addMeal: (state, action: PayloadAction<Meal>) => {
      state.todayMeals.push(action.payload);
    },
    updateMeal: (state, action: PayloadAction<Meal>) => {
      const index = state.todayMeals.findIndex(meal => meal.id === action.payload.id);
      if (index >= 0) {
        state.todayMeals[index] = action.payload;
      }
    },
    deleteMeal: (state, action: PayloadAction<string>) => {
      state.todayMeals = state.todayMeals.filter(meal => meal.id !== action.payload);
    },
    addWaterIntake: (state, action: PayloadAction<number>) => {
      state.waterIntake += action.payload;
    },
    setWaterIntake: (state, action: PayloadAction<number>) => {
      state.waterIntake = action.payload;
    },
    updateNutritionGoals: (state, action: PayloadAction<Partial<NutritionGoals>>) => {
      state.nutritionGoals = { ...state.nutritionGoals, ...action.payload };
    },
    setFoodDatabase: (state, action: PayloadAction<Food[]>) => {
      state.foodDatabase = action.payload;
    },
    addFoodToDatabase: (state, action: PayloadAction<Food>) => {
      state.foodDatabase.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    resetTodayNutrition: (state) => {
      state.todayMeals = [];
      state.waterIntake = 0;
    },
  },
});

export const {
  addMeal,
  updateMeal,
  deleteMeal,
  addWaterIntake,
  setWaterIntake,
  updateNutritionGoals,
  setFoodDatabase,
  addFoodToDatabase,
  setLoading,
  resetTodayNutrition,
} = nutritionSlice.actions;

export default nutritionSlice.reducer;
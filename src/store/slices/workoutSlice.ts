import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  equipment: string[];
  instructions: string[];
  caloriesPerMinute: number;
}

interface WorkoutSet {
  reps: number;
  weight?: number;
  duration?: number; // in seconds
  distance?: number; // in meters
}

interface WorkoutExercise {
  exercise: Exercise;
  sets: WorkoutSet[];
  restTime: number; // in seconds
  notes?: string;
}

interface Workout {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
  duration: number; // in minutes
  caloriesBurned: number;
  date: string;
  notes?: string;
}

interface WorkoutState {
  currentWorkout: Workout | null;
  workoutHistory: Workout[];
  exerciseDatabase: Exercise[];
  isWorkoutActive: boolean;
  workoutStartTime: string | null;
  isLoading: boolean;
}

const initialState: WorkoutState = {
  currentWorkout: null,
  workoutHistory: [],
  exerciseDatabase: [],
  isWorkoutActive: false,
  workoutStartTime: null,
  isLoading: false,
};

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    startWorkout: (state, action: PayloadAction<{ name: string; exercises: WorkoutExercise[] }>) => {
      state.currentWorkout = {
        id: Date.now().toString(),
        name: action.payload.name,
        exercises: action.payload.exercises,
        duration: 0,
        caloriesBurned: 0,
        date: new Date().toISOString(),
      };
      state.isWorkoutActive = true;
      state.workoutStartTime = new Date().toISOString();
    },
    endWorkout: (state, action: PayloadAction<{ duration: number; caloriesBurned: number }>) => {
      if (state.currentWorkout) {
        state.currentWorkout.duration = action.payload.duration;
        state.currentWorkout.caloriesBurned = action.payload.caloriesBurned;
        state.workoutHistory.push(state.currentWorkout);
        state.currentWorkout = null;
        state.isWorkoutActive = false;
        state.workoutStartTime = null;
      }
    },
    pauseWorkout: (state) => {
      state.isWorkoutActive = false;
    },
    resumeWorkout: (state) => {
      state.isWorkoutActive = true;
    },
    updateCurrentWorkout: (state, action: PayloadAction<Partial<Workout>>) => {
      if (state.currentWorkout) {
        state.currentWorkout = { ...state.currentWorkout, ...action.payload };
      }
    },
    addExerciseToWorkout: (state, action: PayloadAction<WorkoutExercise>) => {
      if (state.currentWorkout) {
        state.currentWorkout.exercises.push(action.payload);
      }
    },
    updateWorkoutExercise: (state, action: PayloadAction<{ index: number; exercise: WorkoutExercise }>) => {
      if (state.currentWorkout) {
        state.currentWorkout.exercises[action.payload.index] = action.payload.exercise;
      }
    },
    addSetToExercise: (state, action: PayloadAction<{ exerciseIndex: number; set: WorkoutSet }>) => {
      if (state.currentWorkout) {
        state.currentWorkout.exercises[action.payload.exerciseIndex].sets.push(action.payload.set);
      }
    },
    setExerciseDatabase: (state, action: PayloadAction<Exercise[]>) => {
      state.exerciseDatabase = action.payload;
    },
    addExerciseToDatabase: (state, action: PayloadAction<Exercise>) => {
      state.exerciseDatabase.push(action.payload);
    },
    setWorkoutHistory: (state, action: PayloadAction<Workout[]>) => {
      state.workoutHistory = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  startWorkout,
  endWorkout,
  pauseWorkout,
  resumeWorkout,
  updateCurrentWorkout,
  addExerciseToWorkout,
  updateWorkoutExercise,
  addSetToExercise,
  setExerciseDatabase,
  addExerciseToDatabase,
  setWorkoutHistory,
  setLoading,
} = workoutSlice.actions;

export default workoutSlice.reducer;
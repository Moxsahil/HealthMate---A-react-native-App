import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Exercise {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  muscleGroups: string[];
  equipment: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  instructions: string[];
  tips: string[];
  caloriesPerMinute: number;
  videoUrl?: string;
  imageUrl?: string;
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  reps?: number;
  weight?: number;
  duration?: number; // in seconds
  distance?: number; // in meters
  restTime?: number; // in seconds
  completed: boolean;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime?: string;
  exercises: {
    exerciseId: string;
    sets: WorkoutSet[];
  }[];
  totalDuration?: number; // in minutes
  caloriesBurned?: number;
  notes?: string;
  isActive: boolean;
  category: string;
  difficulty: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDuration: number; // in minutes
  exercises: {
    exerciseId: string;
    sets: number;
    reps?: number;
    duration?: number;
    weight?: number;
    restTime?: number;
  }[];
  isCustom: boolean;
  createdBy?: string;
  rating?: number;
  timesUsed: number;
}

export interface WorkoutGoals {
  weeklyWorkouts: number;
  weeklyDuration: number; // in minutes
  caloriesBurnGoal: number; // weekly
  strengthGoals: {
    benchPress?: number;
    squat?: number;
    deadlift?: number;
  };
  cardioGoals: {
    runningDistance?: number; // weekly km
    runningPace?: number; // min per km
  };
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalDuration: number; // in minutes
  totalCaloriesBurned: number;
  currentStreak: number;
  longestStreak: number;
  favoriteCategory: string;
  averageWorkoutDuration: number;
  weeklyStats: {
    workouts: number;
    duration: number;
    caloriesBurned: number;
  };
  monthlyStats: {
    workouts: number;
    duration: number;
    caloriesBurned: number;
  };
}

export interface SocialFeatures {
  challenges: {
    id: string;
    name: string;
    description: string;
    type: 'duration' | 'frequency' | 'calories' | 'streak';
    target: number;
    progress: number;
    startDate: string;
    endDate: string;
    participants: string[];
    isActive: boolean;
  }[];
  achievements: {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    unlockedAt?: string;
    isUnlocked: boolean;
  }[];
  friends: {
    id: string;
    name: string;
    avatar?: string;
    currentStreak: number;
    totalWorkouts: number;
  }[];
}

interface WorkoutState {
  // Core workout data
  exercises: Exercise[];
  workoutSessions: WorkoutSession[];
  workoutTemplates: WorkoutTemplate[];
  activeSession: WorkoutSession | null;

  // Legacy support
  currentWorkout: WorkoutSession | null;
  workoutHistory: WorkoutSession[];
  exerciseDatabase: Exercise[];
  isWorkoutActive: boolean;
  workoutStartTime: string | null;

  // User preferences and goals
  goals: WorkoutGoals;
  stats: WorkoutStats;
  personalizedRecommendations: WorkoutTemplate[];

  // Social features
  social: SocialFeatures;

  // UI state
  selectedCategory: string | null;
  selectedDifficulty: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: {
    category: string[];
    difficulty: string[];
    equipment: string[];
    duration: { min: number; max: number };
    muscleGroups: string[];
  };
}

// Generate sample workout history
const generateSampleWorkoutHistory = (): WorkoutSession[] => {
  const sessions: WorkoutSession[] = [];
  const now = new Date();

  for (let i = 0; i < 15; i++) {
    const sessionDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000 - Math.random() * 24 * 60 * 60 * 1000);
    const categories = ['Strength', 'Cardio', 'Flexibility'];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

    sessions.push({
      id: `session-${i}`,
      name: `${category} Workout ${i + 1}`,
      date: sessionDate.toISOString(),
      startTime: sessionDate.toISOString(),
      endTime: new Date(sessionDate.getTime() + (20 + Math.random() * 40) * 60 * 1000).toISOString(),
      exercises: [
        {
          exerciseId: '1',
          sets: Array.from({ length: 3 }, (_, j) => ({
            id: `set-${i}-${j}`,
            exerciseId: '1',
            reps: 8 + Math.floor(Math.random() * 8),
            weight: 50 + Math.random() * 30,
            completed: true,
          })),
        },
        {
          exerciseId: '2',
          sets: Array.from({ length: 3 }, (_, j) => ({
            id: `set-${i}-2-${j}`,
            exerciseId: '2',
            reps: 10 + Math.floor(Math.random() * 10),
            completed: true,
          })),
        },
      ],
      totalDuration: 20 + Math.floor(Math.random() * 40),
      caloriesBurned: 150 + Math.floor(Math.random() * 300),
      isActive: false,
      category,
      difficulty,
      notes: i % 3 === 0 ? `Great ${category.toLowerCase()} session!` : undefined,
    });
  }

  return sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const sampleWorkoutHistory = generateSampleWorkoutHistory();

// Helper function to recalculate stats - move it before initialState
const calculateStatsFromHistory = (sessions: WorkoutSession[]) => {
  const now = new Date();
  const weekStart = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const weekSessions = sessions.filter(s => new Date(s.date) >= weekStart);
  const monthSessions = sessions.filter(s => new Date(s.date) >= monthStart);

  const totalDuration = sessions.reduce((sum, s) => sum + (s.totalDuration || 0), 0);
  const totalCalories = sessions.reduce((sum, s) => sum + (s.caloriesBurned || 0), 0);

  const weekDuration = weekSessions.reduce((sum, s) => sum + (s.totalDuration || 0), 0);
  const weekCalories = weekSessions.reduce((sum, s) => sum + (s.caloriesBurned || 0), 0);

  const monthDuration = monthSessions.reduce((sum, s) => sum + (s.totalDuration || 0), 0);
  const monthCalories = monthSessions.reduce((sum, s) => sum + (s.caloriesBurned || 0), 0);

  // Calculate streak
  let currentStreak = 0;
  const sortedSessions = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const session of sortedSessions) {
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0);

    const dayDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (24 * 60 * 60 * 1000));

    if (dayDiff === currentStreak || (dayDiff === currentStreak + 1)) {
      currentStreak = dayDiff + 1;
    } else {
      break;
    }
  }

  const categoryCount = sessions.reduce((acc, session) => {
    acc[session.category] = (acc[session.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const favoriteCategory = Object.entries(categoryCount).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Strength';

  return {
    totalWorkouts: sessions.length,
    totalDuration,
    totalCaloriesBurned: totalCalories,
    currentStreak,
    longestStreak: Math.max(currentStreak, 8),
    favoriteCategory,
    averageWorkoutDuration: sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0,
    weeklyStats: {
      workouts: weekSessions.length,
      duration: weekDuration,
      caloriesBurned: weekCalories,
    },
    monthlyStats: {
      workouts: monthSessions.length,
      duration: monthDuration,
      caloriesBurned: monthCalories,
    },
  };
};


const initialState: WorkoutState = {
  // Core workout data with sample data
  exercises: [],
  workoutSessions: sampleWorkoutHistory,
  workoutTemplates: [],
  activeSession: null,

  // Legacy support
  currentWorkout: null,
  workoutHistory: sampleWorkoutHistory,
  exerciseDatabase: [],
  isWorkoutActive: false,
  workoutStartTime: null,

  // User preferences and goals
  goals: {
    weeklyWorkouts: 3,
    weeklyDuration: 150, // WHO recommendation
    caloriesBurnGoal: 2000,
    strengthGoals: {
      benchPress: 80,
      squat: 100,
      deadlift: 120,
    },
    cardioGoals: {
      runningDistance: 20,
      runningPace: 6,
    },
  },
  stats: calculateStatsFromHistory(sampleWorkoutHistory),
  personalizedRecommendations: [],

  // Social features with real progress
  social: {
    challenges: [
      {
        id: '1',
        name: '30-Day Fitness Challenge',
        description: 'Complete 20 workouts in 30 days',
        type: 'frequency',
        target: 20,
        progress: Math.min(sampleWorkoutHistory.length, 20),
        startDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
        participants: ['user1', 'user2', 'user3'],
        isActive: true,
      },
      {
        id: '2',
        name: 'Calorie Crusher',
        description: 'Burn 3000 calories this month',
        type: 'calories',
        target: 3000,
        progress: calculateStatsFromHistory(sampleWorkoutHistory).monthlyStats.caloriesBurned,
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
        participants: ['user1', 'user4', 'user5'],
        isActive: true,
      },
    ],
    achievements: [
      {
        id: '1',
        name: 'First Workout',
        description: 'Complete your first workout',
        iconUrl: 'trophy',
        unlockedAt: sampleWorkoutHistory[0]?.date,
        isUnlocked: sampleWorkoutHistory.length > 0,
      },
      {
        id: '2',
        name: 'Week Warrior',
        description: 'Complete 7 workouts in a week',
        iconUrl: 'medal',
        unlockedAt: sampleWorkoutHistory.length >= 7 ? new Date().toISOString() : undefined,
        isUnlocked: sampleWorkoutHistory.length >= 7,
      },
      {
        id: '3',
        name: 'Consistency Champion',
        description: 'Maintain a 5-day workout streak',
        iconUrl: 'flame',
        unlockedAt: calculateStatsFromHistory(sampleWorkoutHistory).currentStreak >= 5 ? new Date().toISOString() : undefined,
        isUnlocked: calculateStatsFromHistory(sampleWorkoutHistory).currentStreak >= 5,
      },
    ],
    friends: [
      {
        id: 'friend1',
        name: 'Alex Johnson',
        avatar: 'A',
        currentStreak: 8,
        totalWorkouts: 24,
      },
      {
        id: 'friend2',
        name: 'Maria Garcia',
        avatar: 'M',
        currentStreak: 3,
        totalWorkouts: 18,
      },
    ],
  },

  // UI state
  selectedCategory: null,
  selectedDifficulty: null,
  searchQuery: '',
  isLoading: false,
  error: null,

  // Filters
  filters: {
    category: [],
    difficulty: [],
    equipment: [],
    duration: { min: 0, max: 180 },
    muscleGroups: [],
  },
};

// Async thunks
export const loadWorkoutDataAsync = createAsyncThunk(
  'workout/loadWorkoutData',
  async () => {
    try {
      // Load exercises from WorkoutService
      const exercises = await import('../../services/workoutService').then(
        module => module.WorkoutService.loadExercises()
      );

      // Load templates from WorkoutService
      const templates = await import('../../services/workoutService').then(
        module => module.WorkoutService.loadTemplates()
      );

      // Load persisted workout data
      const persistedData = await AsyncStorage.getItem('workoutData');
      const workoutData = persistedData ? JSON.parse(persistedData) : {};

      return {
        exercises,
        workoutTemplates: templates,
        ...workoutData,
      };
    } catch (error) {
      console.error('Failed to load workout data:', error);
      return null;
    }
  }
);

export const saveWorkoutDataAsync = createAsyncThunk(
  'workout/saveWorkoutData',
  async (workoutData: Partial<WorkoutState>) => {
    await AsyncStorage.setItem('workoutData', JSON.stringify(workoutData));
    return workoutData;
  }
);

export const startWorkoutSessionAsync = createAsyncThunk(
  'workout/startWorkoutSession',
  async (templateId: string, { getState }) => {
    const state = getState() as { workout: WorkoutState };
    const template = state.workout.workoutTemplates.find(t => t.id === templateId);

    if (!template) throw new Error('Template not found');

    const session: WorkoutSession = {
      id: Date.now().toString(),
      name: template.name,
      date: new Date().toISOString(),
      startTime: new Date().toISOString(),
      exercises: template.exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        sets: Array.from({ length: ex.sets }, (_, i) => ({
          id: `${Date.now()}-${i}`,
          exerciseId: ex.exerciseId,
          reps: ex.reps,
          weight: ex.weight,
          duration: ex.duration,
          restTime: ex.restTime,
          completed: false,
        })),
      })),
      isActive: true,
      category: template.category,
      difficulty: template.difficulty,
    };

    return session;
  }
);

export const completeWorkoutSessionAsync = createAsyncThunk(
  'workout/completeWorkoutSession',
  async (sessionData: { caloriesBurned?: number; notes?: string }, { getState }) => {
    const state = getState() as { workout: WorkoutState };
    const activeSession = state.workout.activeSession;

    if (!activeSession) throw new Error('No active session');

    const completedSession: WorkoutSession = {
      ...activeSession,
      endTime: new Date().toISOString(),
      totalDuration: Math.round((Date.now() - new Date(activeSession.startTime).getTime()) / 60000),
      caloriesBurned: sessionData.caloriesBurned,
      notes: sessionData.notes,
      isActive: false,
    };

    return completedSession;
  }
);

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    // Legacy reducers (keeping for backward compatibility)
    startWorkout: (state, action: PayloadAction<{ name: string; exercises: any[] }>) => {
      const session: WorkoutSession = {
        id: Date.now().toString(),
        name: action.payload.name,
        date: new Date().toISOString(),
        startTime: new Date().toISOString(),
        exercises: action.payload.exercises,
        isActive: true,
        category: 'General',
        difficulty: 'Intermediate',
      };
      state.currentWorkout = session;
      state.activeSession = session;
      state.isWorkoutActive = true;
      state.workoutStartTime = new Date().toISOString();
    },
    endWorkout: (state, action: PayloadAction<{ duration: number; caloriesBurned: number }>) => {
      if (state.currentWorkout && state.activeSession) {
        const completedSession = {
          ...state.activeSession,
          endTime: new Date().toISOString(),
          totalDuration: action.payload.duration,
          caloriesBurned: action.payload.caloriesBurned,
          isActive: false,
        };
        state.workoutSessions.push(completedSession);
        state.workoutHistory.push(completedSession);
        state.currentWorkout = null;
        state.activeSession = null;
        state.isWorkoutActive = false;
        state.workoutStartTime = null;

        // Update stats
        state.stats.totalWorkouts += 1;
        state.stats.totalDuration += action.payload.duration;
        state.stats.totalCaloriesBurned += action.payload.caloriesBurned;
        state.stats.averageWorkoutDuration = state.stats.totalDuration / state.stats.totalWorkouts;
      }
    },
    pauseWorkout: (state) => {
      state.isWorkoutActive = false;
      if (state.activeSession) state.activeSession.isActive = false;
    },
    resumeWorkout: (state) => {
      state.isWorkoutActive = true;
      if (state.activeSession) state.activeSession.isActive = true;
    },

    // New comprehensive reducers
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    setSelectedDifficulty: (state, action: PayloadAction<string | null>) => {
      state.selectedDifficulty = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<WorkoutState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateWorkoutSet: (state, action: PayloadAction<{ setId: string; updates: Partial<WorkoutSet> }>) => {
      if (state.activeSession) {
        state.activeSession.exercises.forEach(exercise => {
          const set = exercise.sets.find(s => s.id === action.payload.setId);
          if (set) {
            Object.assign(set, action.payload.updates);
          }
        });
      }
    },
    addCustomWorkoutTemplate: (state, action: PayloadAction<Omit<WorkoutTemplate, 'id' | 'timesUsed'>>) => {
      const template: WorkoutTemplate = {
        ...action.payload,
        id: Date.now().toString(),
        timesUsed: 0,
        isCustom: true,
      };
      state.workoutTemplates.push(template);
    },
    updateWorkoutGoals: (state, action: PayloadAction<Partial<WorkoutGoals>>) => {
      state.goals = { ...state.goals, ...action.payload };
    },
    addAchievement: (state, action: PayloadAction<{ achievementId: string }>) => {
      const achievement = state.social.achievements.find(a => a.id === action.payload.achievementId);
      if (achievement && !achievement.isUnlocked) {
        achievement.isUnlocked = true;
        achievement.unlockedAt = new Date().toISOString();
      }
    },
    joinChallenge: (state, action: PayloadAction<{ challengeId: string; userId: string }>) => {
      const challenge = state.social.challenges.find(c => c.id === action.payload.challengeId);
      if (challenge && !challenge.participants.includes(action.payload.userId)) {
        challenge.participants.push(action.payload.userId);
      }
    },
    updateChallengeProgress: (state, action: PayloadAction<{ challengeId: string; progress: number }>) => {
      const challenge = state.social.challenges.find(c => c.id === action.payload.challengeId);
      if (challenge) {
        challenge.progress = action.payload.progress;
      }
    },

    // Legacy support
    updateCurrentWorkout: (state, action: PayloadAction<Partial<WorkoutSession>>) => {
      if (state.currentWorkout) {
        state.currentWorkout = { ...state.currentWorkout, ...action.payload };
      }
      if (state.activeSession) {
        state.activeSession = { ...state.activeSession, ...action.payload };
      }
    },
    addExerciseToWorkout: (state, action: PayloadAction<any>) => {
      if (state.activeSession) {
        state.activeSession.exercises.push(action.payload);
      }
    },
    updateWorkoutExercise: (state, action: PayloadAction<{ index: number; exercise: any }>) => {
      if (state.activeSession) {
        state.activeSession.exercises[action.payload.index] = action.payload.exercise;
      }
    },
    addSetToExercise: (state, action: PayloadAction<{ exerciseIndex: number; set: WorkoutSet }>) => {
      if (state.activeSession) {
        state.activeSession.exercises[action.payload.exerciseIndex].sets.push(action.payload.set);
      }
    },
    setExerciseDatabase: (state, action: PayloadAction<Exercise[]>) => {
      state.exerciseDatabase = action.payload;
      state.exercises = action.payload;
    },
    addExerciseToDatabase: (state, action: PayloadAction<Exercise>) => {
      state.exerciseDatabase.push(action.payload);
      state.exercises.push(action.payload);
    },
    setWorkoutHistory: (state, action: PayloadAction<WorkoutSession[]>) => {
      state.workoutHistory = action.payload;
      state.workoutSessions = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadWorkoutDataAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadWorkoutDataAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          // Update exercises and templates from service
          if (action.payload.exercises) {
            state.exercises = action.payload.exercises;
            state.exerciseDatabase = action.payload.exercises;
          }
          if (action.payload.workoutTemplates) {
            state.workoutTemplates = action.payload.workoutTemplates;
          }

          // Update other persisted data
          if (action.payload.workoutSessions) {
            state.workoutSessions = action.payload.workoutSessions;
            state.workoutHistory = action.payload.workoutSessions;
            // Recalculate stats based on real data
            state.stats = {
              ...state.stats,
              ...calculateStatsFromHistory(action.payload.workoutSessions),
            };
          }

          // Update personalized recommendations based on loaded data
          const recommendations = require('../../services/workoutService').WorkoutService.generatePersonalizedRecommendations(
            state.stats,
            state.workoutSessions,
            {
              preferredCategories: state.selectedCategory ? [state.selectedCategory] : undefined,
              availableTime: 30,
              fitnessLevel: 'Intermediate',
              goals: ['strength', 'endurance'],
            }
          );
          state.personalizedRecommendations = recommendations;
        }
      })
      .addCase(loadWorkoutDataAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load workout data';
      })
      .addCase(saveWorkoutDataAsync.fulfilled, (state) => {
        // Data saved successfully
      })
      .addCase(startWorkoutSessionAsync.fulfilled, (state, action) => {
        state.activeSession = action.payload;
        state.currentWorkout = action.payload;
        state.isWorkoutActive = true;
        state.workoutStartTime = action.payload.startTime;
      })
      .addCase(startWorkoutSessionAsync.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to start workout session';
      })
      .addCase(completeWorkoutSessionAsync.fulfilled, (state, action) => {
        // Add to completed sessions
        state.workoutSessions.unshift(action.payload); // Add to beginning for recent-first order
        state.workoutHistory.unshift(action.payload);
        state.activeSession = null;
        state.currentWorkout = null;
        state.isWorkoutActive = false;
        state.workoutStartTime = null;

        // Recalculate stats from all sessions
        const newStats = calculateStatsFromHistory(state.workoutSessions);
        state.stats = newStats;

        // Update challenge progress
        state.social.challenges.forEach(challenge => {
          if (challenge.isActive) {
            switch (challenge.type) {
              case 'frequency':
                challenge.progress = Math.min(challenge.progress + 1, challenge.target);
                break;
              case 'calories':
                challenge.progress = Math.min(
                  challenge.progress + (action.payload.caloriesBurned || 0),
                  challenge.target
                );
                break;
              case 'duration':
                challenge.progress = Math.min(
                  challenge.progress + (action.payload.totalDuration || 0),
                  challenge.target
                );
                break;
            }
          }
        });

        // Check for new achievements
        const WorkoutService = require('../../services/workoutService').WorkoutService;
        const newAchievements = WorkoutService.checkForNewAchievements(newStats, action.payload);
        newAchievements.forEach(achievement => {
          const existingAchievement = state.social.achievements.find(a => a.id === achievement.id);
          if (existingAchievement && !existingAchievement.isUnlocked) {
            existingAchievement.isUnlocked = true;
            existingAchievement.unlockedAt = new Date().toISOString();
          }
        });

        // Auto-save workout data
        const dataToSave = {
          workoutSessions: state.workoutSessions,
          stats: state.stats,
          social: state.social,
        };

        // Dispatch save action (fire and forget)
        require('@react-native-async-storage/async-storage').default.setItem(
          'workoutData',
          JSON.stringify(dataToSave)
        ).catch(console.error);
      });
  },
});

export const {
  // Legacy actions
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

  // New comprehensive actions
  setSelectedCategory,
  setSelectedDifficulty,
  setSearchQuery,
  updateFilters,
  updateWorkoutSet,
  addCustomWorkoutTemplate,
  updateWorkoutGoals,
  addAchievement,
  joinChallenge,
  updateChallengeProgress,
  clearError,
} = workoutSlice.actions;

export default workoutSlice.reducer;
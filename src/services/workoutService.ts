import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise, WorkoutTemplate, WorkoutSession, WorkoutStats } from '../store/slices/workoutSlice';

export class WorkoutService {
  private static readonly STORAGE_KEYS = {
    EXERCISES: 'workout_exercises',
    TEMPLATES: 'workout_templates',
    SESSIONS: 'workout_sessions',
    PREFERENCES: 'workout_preferences',
  };

  // Sample exercise database
  static defaultExercises: Exercise[] = [
    {
      id: '1',
      name: 'Push-ups',
      category: 'Strength',
      subcategory: 'Upper Body',
      muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
      equipment: ['Bodyweight'],
      difficulty: 'Beginner',
      instructions: [
        'Start in a plank position with hands shoulder-width apart',
        'Lower your body until chest nearly touches the floor',
        'Push back up to starting position',
        'Keep your core tight throughout the movement'
      ],
      tips: [
        'Keep your body in a straight line',
        'Don\'t let your hips sag',
        'Control the movement, don\'t rush'
      ],
      caloriesPerMinute: 8,
      videoUrl: 'https://example.com/pushups.mp4',
    },
    {
      id: '2',
      name: 'Squats',
      category: 'Strength',
      subcategory: 'Lower Body',
      muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
      equipment: ['Bodyweight'],
      difficulty: 'Beginner',
      instructions: [
        'Stand with feet hip-width apart',
        'Lower down as if sitting in a chair',
        'Keep chest up and knees tracking over toes',
        'Return to standing position'
      ],
      tips: [
        'Go as low as comfortable',
        'Keep weight in your heels',
        'Don\'t let knees cave inward'
      ],
      caloriesPerMinute: 10,
    },
    {
      id: '3',
      name: 'Plank',
      category: 'Strength',
      subcategory: 'Core',
      muscleGroups: ['Core', 'Shoulders', 'Glutes'],
      equipment: ['Bodyweight'],
      difficulty: 'Beginner',
      instructions: [
        'Start in push-up position',
        'Hold position with straight line from head to heels',
        'Engage core and breathe normally',
        'Hold for specified duration'
      ],
      tips: [
        'Don\'t let hips sag or pike up',
        'Keep shoulders over wrists',
        'Engage glutes for stability'
      ],
      caloriesPerMinute: 6,
    },
    {
      id: '4',
      name: 'Jumping Jacks',
      category: 'Cardio',
      subcategory: 'HIIT',
      muscleGroups: ['Full Body'],
      equipment: ['Bodyweight'],
      difficulty: 'Beginner',
      instructions: [
        'Stand with feet together, arms at sides',
        'Jump feet apart while raising arms overhead',
        'Jump back to starting position',
        'Repeat at a steady pace'
      ],
      tips: [
        'Land softly on balls of feet',
        'Keep core engaged',
        'Maintain steady rhythm'
      ],
      caloriesPerMinute: 12,
    },
    {
      id: '5',
      name: 'Burpees',
      category: 'Cardio',
      subcategory: 'HIIT',
      muscleGroups: ['Full Body'],
      equipment: ['Bodyweight'],
      difficulty: 'Advanced',
      instructions: [
        'Start standing, then squat down',
        'Place hands on floor, jump feet back to plank',
        'Do a push-up, then jump feet back to squat',
        'Jump up with arms overhead'
      ],
      tips: [
        'Move at your own pace',
        'Modify by stepping instead of jumping',
        'Keep core tight throughout'
      ],
      caloriesPerMinute: 15,
    },
    {
      id: '6',
      name: 'Forward Fold',
      category: 'Flexibility',
      subcategory: 'Stretching',
      muscleGroups: ['Hamstrings', 'Calves', 'Lower Back'],
      equipment: ['Bodyweight'],
      difficulty: 'Beginner',
      instructions: [
        'Stand with feet hip-width apart',
        'Slowly hinge at hips, reaching toward floor',
        'Let arms hang heavy',
        'Hold and breathe deeply'
      ],
      tips: [
        'Bend knees slightly if needed',
        'Don\'t force the stretch',
        'Focus on lengthening spine'
      ],
      caloriesPerMinute: 3,
    },
    {
      id: '7',
      name: 'Child\'s Pose',
      category: 'Flexibility',
      subcategory: 'Yoga',
      muscleGroups: ['Hips', 'Lower Back', 'Shoulders'],
      equipment: ['Bodyweight'],
      difficulty: 'Beginner',
      instructions: [
        'Start on hands and knees',
        'Sit back on heels, extend arms forward',
        'Rest forehead on floor',
        'Hold and breathe deeply'
      ],
      tips: [
        'Widen knees if more comfortable',
        'Use pillow under forehead if needed',
        'Focus on relaxing'
      ],
      caloriesPerMinute: 2,
    },
  ];

  // Sample workout templates
  static defaultTemplates: WorkoutTemplate[] = [
    {
      id: 'beginner-strength',
      name: 'Beginner Strength Builder',
      description: 'Perfect introduction to strength training with bodyweight exercises',
      category: 'Strength',
      difficulty: 'Beginner',
      estimatedDuration: 25,
      exercises: [
        { exerciseId: '1', sets: 3, reps: 8, restTime: 60 },
        { exerciseId: '2', sets: 3, reps: 12, restTime: 60 },
        { exerciseId: '3', sets: 3, duration: 30, restTime: 60 },
      ],
      isCustom: false,
      rating: 4.5,
      timesUsed: 0,
    },
    {
      id: 'cardio-blast',
      name: 'Cardio Blast',
      description: 'High-energy cardio workout to get your heart pumping',
      category: 'Cardio',
      difficulty: 'Intermediate',
      estimatedDuration: 20,
      exercises: [
        { exerciseId: '4', sets: 4, duration: 45, restTime: 15 },
        { exerciseId: '5', sets: 3, reps: 8, restTime: 30 },
        { exerciseId: '4', sets: 4, duration: 30, restTime: 15 },
      ],
      isCustom: false,
      rating: 4.8,
      timesUsed: 0,
    },
    {
      id: 'flexibility-flow',
      name: 'Morning Flexibility Flow',
      description: 'Gentle stretching routine to start your day',
      category: 'Flexibility',
      difficulty: 'Beginner',
      estimatedDuration: 15,
      exercises: [
        { exerciseId: '6', sets: 1, duration: 60, restTime: 10 },
        { exerciseId: '7', sets: 1, duration: 45, restTime: 10 },
        { exerciseId: '6', sets: 1, duration: 30, restTime: 10 },
      ],
      isCustom: false,
      rating: 4.3,
      timesUsed: 0,
    },
    {
      id: 'full-body-strength',
      name: 'Full Body Strength',
      description: 'Complete strength workout targeting all major muscle groups',
      category: 'Strength',
      difficulty: 'Intermediate',
      estimatedDuration: 35,
      exercises: [
        { exerciseId: '1', sets: 4, reps: 12, restTime: 90 },
        { exerciseId: '2', sets: 4, reps: 15, restTime: 90 },
        { exerciseId: '3', sets: 3, duration: 45, restTime: 60 },
        { exerciseId: '5', sets: 3, reps: 6, restTime: 90 },
      ],
      isCustom: false,
      rating: 4.7,
      timesUsed: 0,
    },
  ];

  // AI-powered workout recommendations
  static generatePersonalizedRecommendations(
    stats: WorkoutStats,
    sessions: WorkoutSession[],
    preferences?: {
      preferredCategories?: string[];
      availableTime?: number;
      fitnessLevel?: string;
      goals?: string[];
    }
  ): WorkoutTemplate[] {
    const recommendations: WorkoutTemplate[] = [];

    // Analyze user's workout history
    const recentSessions = sessions.slice(-10);
    const categoryFrequency = recentSessions.reduce((acc, session) => {
      acc[session.category] = (acc[session.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageWorkoutDuration = stats.averageWorkoutDuration || 25;
    const favoriteCategory = stats.favoriteCategory || 'Strength';

    // Recommendation 1: Based on favorite category
    const favoriteTemplate = this.defaultTemplates.find(
      t => t.category === favoriteCategory && t.estimatedDuration <= averageWorkoutDuration + 10
    );
    if (favoriteTemplate) {
      recommendations.push({
        ...favoriteTemplate,
        id: `rec-favorite-${Date.now()}`,
        name: `Recommended ${favoriteTemplate.name}`,
        description: `Based on your preference for ${favoriteCategory} workouts`,
      });
    }

    // Recommendation 2: Challenge progression
    if (stats.currentStreak >= 7) {
      const challengeTemplate = this.defaultTemplates.find(
        t => t.difficulty === 'Advanced' || (t.difficulty === 'Intermediate' && stats.totalWorkouts < 20)
      );
      if (challengeTemplate) {
        recommendations.push({
          ...challengeTemplate,
          id: `rec-challenge-${Date.now()}`,
          name: `${challengeTemplate.name} Challenge`,
          description: 'Ready for the next level? Try this challenging workout!',
        });
      }
    }

    // Recommendation 3: Balance recommendation
    const leastUsedCategory = Object.keys(categoryFrequency).length > 0
      ? Object.entries(categoryFrequency).sort(([,a], [,b]) => a - b)[0][0]
      : 'Flexibility';

    const balanceTemplate = this.defaultTemplates.find(t => t.category === leastUsedCategory);
    if (balanceTemplate && leastUsedCategory !== favoriteCategory) {
      recommendations.push({
        ...balanceTemplate,
        id: `rec-balance-${Date.now()}`,
        name: `Balance with ${balanceTemplate.name}`,
        description: `Add some ${leastUsedCategory.toLowerCase()} to your routine`,
      });
    }

    // Recommendation 4: Time-based
    const quickTemplate = this.defaultTemplates.find(t => t.estimatedDuration <= 15);
    if (quickTemplate && averageWorkoutDuration > 20) {
      recommendations.push({
        ...quickTemplate,
        id: `rec-quick-${Date.now()}`,
        name: `Quick ${quickTemplate.name}`,
        description: 'Short on time? Try this efficient workout',
      });
    }

    return recommendations.slice(0, 4);
  }

  // Calculate personalized workout difficulty
  static calculateRecommendedDifficulty(stats: WorkoutStats): 'Beginner' | 'Intermediate' | 'Advanced' {
    if (stats.totalWorkouts < 10 || stats.currentStreak < 3) {
      return 'Beginner';
    }
    if (stats.totalWorkouts < 50 || stats.averageWorkoutDuration < 20) {
      return 'Intermediate';
    }
    return 'Advanced';
  }

  // Generate custom workout based on time and preferences
  static generateCustomWorkout(
    availableTime: number,
    category: string,
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
    exercises: Exercise[]
  ): WorkoutTemplate {
    const categoryExercises = exercises.filter(e => e.category === category && e.difficulty === difficulty);
    const selectedExercises = categoryExercises.slice(0, Math.min(4, Math.floor(availableTime / 5)));

    const template: WorkoutTemplate = {
      id: `custom-${Date.now()}`,
      name: `Custom ${category} Workout`,
      description: `Tailored ${difficulty.toLowerCase()} ${category.toLowerCase()} workout for ${availableTime} minutes`,
      category,
      difficulty,
      estimatedDuration: availableTime,
      exercises: selectedExercises.map(exercise => ({
        exerciseId: exercise.id,
        sets: difficulty === 'Beginner' ? 2 : difficulty === 'Intermediate' ? 3 : 4,
        reps: exercise.category === 'Cardio' ? undefined : (difficulty === 'Beginner' ? 8 : 12),
        duration: exercise.category === 'Cardio' ? 30 : undefined,
        restTime: difficulty === 'Beginner' ? 45 : difficulty === 'Intermediate' ? 60 : 90,
      })),
      isCustom: true,
      timesUsed: 0,
    };

    return template;
  }

  // Health data integration helpers
  static async syncWithHealthData(): Promise<{
    heartRate?: number;
    steps?: number;
    caloriesBurned?: number;
  }> {
    // Mock implementation - in real app, integrate with HealthKit/Google Fit
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          heartRate: Math.floor(Math.random() * 40) + 120, // 120-160 bpm
          steps: Math.floor(Math.random() * 5000) + 3000, // 3000-8000 steps
          caloriesBurned: Math.floor(Math.random() * 200) + 100, // 100-300 calories
        });
      }, 1000);
    });
  }

  // Achievement system
  static checkForNewAchievements(stats: WorkoutStats, newSession: WorkoutSession) {
    const achievements = [];

    // First workout achievement
    if (stats.totalWorkouts === 1) {
      achievements.push({
        id: 'first-workout',
        name: 'First Step',
        description: 'Completed your first workout',
        iconUrl: 'trophy'
      });
    }

    // Streak achievements
    if (stats.currentStreak === 7) {
      achievements.push({
        id: 'week-warrior',
        name: 'Week Warrior',
        description: 'Worked out 7 days in a row',
        iconUrl: 'flame'
      });
    }

    if (stats.currentStreak === 30) {
      achievements.push({
        id: 'month-master',
        name: 'Month Master',
        description: 'Maintained a 30-day workout streak',
        iconUrl: 'star'
      });
    }

    // Milestone achievements
    if (stats.totalWorkouts === 50) {
      achievements.push({
        id: 'half-century',
        name: 'Half Century',
        description: 'Completed 50 workouts',
        iconUrl: 'medal'
      });
    }

    // Category-specific achievements
    if (newSession.category === 'Strength' && stats.totalWorkouts % 20 === 0) {
      achievements.push({
        id: 'strength-specialist',
        name: 'Strength Specialist',
        description: 'Master of strength training',
        iconUrl: 'barbell'
      });
    }

    return achievements;
  }

  // Data persistence
  static async saveExercises(exercises: Exercise[]): Promise<void> {
    await AsyncStorage.setItem(this.STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
  }

  static async loadExercises(): Promise<Exercise[]> {
    const data = await AsyncStorage.getItem(this.STORAGE_KEYS.EXERCISES);
    return data ? JSON.parse(data) : this.defaultExercises;
  }

  static async saveTemplates(templates: WorkoutTemplate[]): Promise<void> {
    await AsyncStorage.setItem(this.STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  }

  static async loadTemplates(): Promise<WorkoutTemplate[]> {
    const data = await AsyncStorage.getItem(this.STORAGE_KEYS.TEMPLATES);
    return data ? JSON.parse(data) : this.defaultTemplates;
  }
}

export default WorkoutService;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import WorkoutSessionModal from '../../components/WorkoutSessionModal';
import WorkoutLibraryModal from '../../components/WorkoutLibraryModal';
import HealthDataSync from '../../components/HealthDataSync';
import {
  setSelectedCategory,
  startWorkout,
  loadWorkoutDataAsync,
  WorkoutTemplate,
} from '../../store/slices/workoutSlice';
import WorkoutService from '../../services/workoutService';

const { width } = Dimensions.get('window');

interface WorkoutCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategories: string[];
}

const workoutCategories: WorkoutCategory[] = [
  {
    id: '1',
    name: 'Strength',
    icon: 'barbell',
    color: '#FF6B6B',
    subcategories: ['Upper Body', 'Lower Body', 'Full Body', 'Core'],
  },
  {
    id: '2',
    name: 'Cardio',
    icon: 'heart',
    color: '#4ECDC4',
    subcategories: ['Running', 'Cycling', 'Swimming', 'HIIT'],
  },
  {
    id: '3',
    name: 'Flexibility',
    icon: 'body',
    color: '#45B7D1',
    subcategories: ['Yoga', 'Stretching', 'Pilates', 'Mobility'],
  },
  {
    id: '4',
    name: 'Sports',
    icon: 'basketball',
    color: '#96CEB4',
    subcategories: ['Basketball', 'Tennis', 'Football', 'Baseball'],
  },
];

const quickWorkoutTemplates: WorkoutTemplate[] = [
  {
    id: 'quick-15',
    name: 'Quick 15min',
    description: 'Fast and effective 15-minute full body workout',
    category: 'Strength',
    difficulty: 'Beginner',
    estimatedDuration: 15,
    exercises: [
      { exerciseId: '1', sets: 3, reps: 15, restTime: 30 },
      { exerciseId: '2', sets: 3, reps: 10, restTime: 30 },
      { exerciseId: '3', sets: 2, duration: 60, restTime: 30 },
    ],
    isCustom: false,
    timesUsed: 0,
  },
  {
    id: 'hiit',
    name: 'HIIT Cardio',
    description: 'High-intensity interval training',
    category: 'Cardio',
    difficulty: 'Intermediate',
    estimatedDuration: 20,
    exercises: [
      { exerciseId: '4', sets: 4, duration: 45, restTime: 15 },
      { exerciseId: '5', sets: 4, duration: 30, restTime: 30 },
    ],
    isCustom: false,
    timesUsed: 0,
  },
  {
    id: 'stretch',
    name: 'Stretch & Mobility',
    description: 'Relaxing stretching routine',
    category: 'Flexibility',
    difficulty: 'Beginner',
    estimatedDuration: 10,
    exercises: [
      { exerciseId: '6', sets: 1, duration: 30, restTime: 10 },
      { exerciseId: '7', sets: 1, duration: 45, restTime: 10 },
    ],
    isCustom: false,
    timesUsed: 0,
  },
];

const WorkoutScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();
  const {
    selectedCategory,
    stats,
    activeSession,
    isWorkoutActive,
    social,
  } = useSelector((state: RootState) => state.workout);

  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<WorkoutTemplate[]>([]);

  useEffect(() => {
    dispatch(loadWorkoutDataAsync());
  }, [dispatch]);

  useEffect(() => {
    if (activeSession && !showSessionModal) {
      setShowSessionModal(true);
    }
  }, [activeSession]);

  useEffect(() => {
    // Generate personalized recommendations
    const recommendations = WorkoutService.generatePersonalizedRecommendations(
      stats,
      [], // workoutSessions - would come from Redux in real implementation
      {
        preferredCategories: selectedCategory ? [selectedCategory] : undefined,
        availableTime: 30,
        fitnessLevel: 'Intermediate',
        goals: ['strength', 'endurance'],
      }
    );
    setPersonalizedRecommendations(recommendations);
  }, [stats, selectedCategory]);

  const handleStartQuickWorkout = (templateId: string) => {
    const template = quickWorkoutTemplates.find(t => t.id === templateId);
    if (template) {
      dispatch(startWorkout({
        name: template.name,
        exercises: template.exercises,
      }));
    }
  };

  const handleStartCustomWorkout = () => {
    Alert.alert(
      'Start Workout',
      'Choose a workout type',
      [
        { text: 'Quick Start', onPress: () => handleStartQuickWorkout('quick-15') },
        { text: 'Browse Library', onPress: () => setShowLibraryModal(true) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderQuickStart = () => (
    <View style={[styles.quickStartContainer, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Start</Text>

      {/* Active workout indicator */}
      {isWorkoutActive && activeSession && (
        <TouchableOpacity
          style={[styles.activeWorkoutBanner, { backgroundColor: colors.primary + '20' }]}
          onPress={() => setShowSessionModal(true)}
        >
          <View style={styles.activeWorkoutInfo}>
            <Ionicons name="fitness" size={20} color={colors.primary} />
            <Text style={[styles.activeWorkoutText, { color: colors.primary }]}>
              {activeSession.name} in progress
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.quickStartButton} onPress={handleStartCustomWorkout}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.quickStartGradient}
        >
          <Ionicons name="play" size={24} color="white" />
          <Text style={styles.quickStartText}>
            {isWorkoutActive ? 'Resume Workout' : 'Start Workout'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: colors.card }]}
          onPress={() => handleStartQuickWorkout('quick-15')}
        >
          <Ionicons name="time" size={20} color={colors.primary} />
          <Text style={[styles.quickActionText, { color: colors.text }]}>Quick 15min</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: colors.card }]}
          onPress={() => handleStartQuickWorkout('hiit')}
        >
          <Ionicons name="flash" size={20} color={colors.primary} />
          <Text style={[styles.quickActionText, { color: colors.text }]}>HIIT</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: colors.card }]}
          onPress={() => handleStartQuickWorkout('stretch')}
        >
          <Ionicons name="body" size={20} color={colors.primary} />
          <Text style={[styles.quickActionText, { color: colors.text }]}>Stretch</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderWorkoutCategories = () => (
    <View style={styles.categoriesContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Workout Categories</Text>
      <View style={styles.categoriesGrid}>
        {workoutCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              { backgroundColor: colors.surface },
              selectedCategory === category.id && { borderColor: colors.primary, borderWidth: 2 }
            ]}
            onPress={() => dispatch(setSelectedCategory(selectedCategory === category.id ? null : category.id))}
          >
            <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
              <Ionicons name={category.icon as any} size={24} color={category.color} />
            </View>
            <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
            {selectedCategory === category.id && (
              <View style={styles.subcategoriesContainer}>
                {category.subcategories.map((sub, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.subcategoryChip, { backgroundColor: colors.card }]}
                  >
                    <Text style={[styles.subcategoryText, { color: colors.text }]}>{sub}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderProgressTracking = () => (
    <View style={[styles.progressContainer, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Progress Tracking</Text>
      <View style={styles.progressStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {stats.weeklyStats.workouts}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Workouts</Text>
          <Text style={[styles.statPeriod, { color: colors.textSecondary }]}>This Week</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {Math.round(stats.weeklyStats.duration / 60 * 10) / 10}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Hours</Text>
          <Text style={[styles.statPeriod, { color: colors.textSecondary }]}>Total Time</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {stats.weeklyStats.caloriesBurned}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Calories</Text>
          <Text style={[styles.statPeriod, { color: colors.textSecondary }]}>Burned</Text>
        </View>
      </View>

      {/* Streak indicator */}
      <View style={[styles.streakContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="flame" size={20} color="#FF6B35" />
        <Text style={[styles.streakText, { color: colors.text }]}>
          {stats.currentStreak} day streak!
        </Text>
      </View>

      {/* Active challenges */}
      {social.challenges.length > 0 && (
        <View style={styles.challengesSection}>
          <Text style={[styles.challengeTitle, { color: colors.text }]}>Active Challenge</Text>
          {social.challenges.slice(0, 1).map(challenge => (
            <View key={challenge.id} style={[styles.challengeCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.challengeName, { color: colors.text }]}>
                {challenge.name}
              </Text>
              <Text style={[styles.challengeDescription, { color: colors.textSecondary }]}>
                {challenge.description}
              </Text>
              <View style={styles.challengeProgress}>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${(challenge.progress / challenge.target) * 100}%`
                      }
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: colors.text }]}>
                  {challenge.progress}/{challenge.target}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={[styles.viewDetailsButton, { backgroundColor: colors.card }]}>
        <Text style={[styles.viewDetailsText, { color: colors.primary }]}>View Detailed Progress</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderPersonalizedRecommendations = () => (
    <View style={styles.recommendationsContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended for You</Text>
      <Text style={[styles.recommendationsSubtitle, { color: colors.textSecondary }]}>
        AI-powered recommendations based on your workout history
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendationsScroll}>
        {personalizedRecommendations.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={[styles.recommendationCard, { backgroundColor: colors.surface }]}
            onPress={() => handleStartWorkout(template)}
          >
            <View style={styles.recommendationHeader}>
              <Ionicons name="sparkles" size={16} color="#FFD700" />
              <Text style={[styles.aiLabel, { color: colors.primary }]}>AI Recommended</Text>
            </View>

            <Text style={[styles.recommendationTitle, { color: colors.text }]}>
              {template.name}
            </Text>
            <Text style={[styles.recommendationDescription, { color: colors.textSecondary }]}>
              {template.description}
            </Text>

            <View style={styles.recommendationMeta}>
              <View style={[styles.metaTag, { backgroundColor: colors.card }]}>
                <Ionicons name="time" size={12} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.text }]}>{template.estimatedDuration}min</Text>
              </View>
              <View style={[styles.metaTag, { backgroundColor: colors.card }]}>
                <Text style={[styles.metaText, { color: colors.text }]}>{template.difficulty}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {personalizedRecommendations.length === 0 && (
          <View style={[styles.noRecommendationsCard, { backgroundColor: colors.surface }]}>
            <Ionicons name="lightbulb-outline" size={32} color={colors.textSecondary} />
            <Text style={[styles.noRecommendationsText, { color: colors.textSecondary }]}>
              Complete a few workouts to get personalized recommendations
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderWorkoutLibrary = () => (
    <View style={styles.libraryContainer}>
      <View style={styles.libraryHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Workout Library</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowLibraryModal(true)}>
          <Ionicons name="library" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.libraryScroll}>
        {WorkoutService.defaultTemplates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={[styles.libraryCard, { backgroundColor: colors.surface }]}
            onPress={() => handleStartWorkout(template)}
          >
            <View style={[styles.libraryImagePlaceholder, { backgroundColor: colors.card }]}>
              <Ionicons name="fitness" size={32} color={colors.textSecondary} />
            </View>
            <Text style={[styles.libraryTitle, { color: colors.text }]}>{template.name}</Text>
            <Text style={[styles.libraryDuration, { color: colors.textSecondary }]}>
              {template.estimatedDuration}min • {template.difficulty}
            </Text>
            <View style={styles.libraryTags}>
              <View style={[styles.libraryTag, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.libraryTagText, { color: colors.primary }]}>{template.category}</Text>
              </View>
              {template.rating && (
                <View style={[styles.libraryTag, { backgroundColor: colors.card }]}>
                  <Ionicons name="star" size={10} color="#FFD700" />
                  <Text style={[styles.libraryTagText, { color: colors.text }]}>{template.rating}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.browseAllButton, { backgroundColor: colors.card }]}
        onPress={() => setShowLibraryModal(true)}
      >
        <Text style={[styles.browseAllText, { color: colors.primary }]}>Browse All Workouts</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const handleStartWorkout = (template: WorkoutTemplate) => {
    dispatch(startWorkout({
      name: template.name,
      exercises: template.exercises,
    }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Workouts</Text>
          <TouchableOpacity>
            <Ionicons name="person-circle" size={32} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {renderQuickStart()}
        {renderWorkoutCategories()}
        {renderProgressTracking()}
        {renderPersonalizedRecommendations()}
        {renderWorkoutLibrary()}

        <HealthDataSync />
      </ScrollView>

      <WorkoutSessionModal
        visible={showSessionModal}
        onClose={() => setShowSessionModal(false)}
      />

      <WorkoutLibraryModal
        visible={showLibraryModal}
        onClose={() => setShowLibraryModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  quickStartContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickStartButton: {
    marginBottom: 16,
  },
  quickStartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickStartText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeWorkoutBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  activeWorkoutInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeWorkoutText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 64) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  subcategoriesContainer: {
    width: '100%',
    gap: 4,
  },
  subcategoryChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  subcategoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  statPeriod: {
    fontSize: 12,
    marginTop: 2,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 12,
    gap: 8,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
  },
  challengesSection: {
    marginTop: 16,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  challengeCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  challengeName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 12,
    marginBottom: 8,
  },
  challengeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 40,
  },
  recommendationsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  recommendationsSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  recommendationsScroll: {
    marginLeft: -20,
    paddingLeft: 20,
  },
  recommendationCard: {
    width: 180,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  aiLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  recommendationDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  recommendationMeta: {
    flexDirection: 'row',
    gap: 6,
  },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  metaText: {
    fontSize: 10,
    fontWeight: '500',
  },
  noRecommendationsCard: {
    width: 180,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  noRecommendationsText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
  libraryContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  libraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterButton: {
    padding: 8,
  },
  libraryScroll: {
    marginLeft: -20,
    paddingLeft: 20,
  },
  libraryCard: {
    width: 160,
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
  },
  libraryImagePlaceholder: {
    height: 100,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  libraryTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  libraryDuration: {
    fontSize: 12,
    marginBottom: 8,
  },
  libraryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  libraryTag: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  libraryTagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  browseAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    gap: 4,
  },
  browseAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default WorkoutScreen;
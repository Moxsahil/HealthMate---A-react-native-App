import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import {
  WorkoutTemplate,
  updateFilters,
  setSearchQuery,
  startWorkout,
} from '../store/slices/workoutSlice';
import WorkoutService from '../services/workoutService';

const { width } = Dimensions.get('window');

interface WorkoutLibraryModalProps {
  visible: boolean;
  onClose: () => void;
}

const WorkoutLibraryModal: React.FC<WorkoutLibraryModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();
  const { filters, searchQuery, exercises, workoutTemplates } = useSelector(
    (state: RootState) => state.workout
  );

  const [filteredTemplates, setFilteredTemplates] = useState<WorkoutTemplate[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    applyFilters();
  }, [workoutTemplates, filters, searchQuery]);

  const applyFilters = () => {
    let filtered = [...workoutTemplates];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(template => filters.category.includes(template.category));
    }

    // Difficulty filter
    if (filters.difficulty.length > 0) {
      filtered = filtered.filter(template => filters.difficulty.includes(template.difficulty));
    }

    // Duration filter
    filtered = filtered.filter(template =>
      template.estimatedDuration >= filters.duration.min &&
      template.estimatedDuration <= filters.duration.max
    );

    // Sort by rating and usage
    filtered.sort((a, b) => {
      if (a.rating && b.rating) {
        return b.rating - a.rating;
      }
      return b.timesUsed - a.timesUsed;
    });

    setFilteredTemplates(filtered);
  };

  const handleStartWorkout = (template: WorkoutTemplate) => {
    dispatch(startWorkout({
      name: template.name,
      exercises: template.exercises,
    }));
    onClose();
  };

  const handleCreateCustomWorkout = () => {
    // Show alert to let user choose how to create custom workout
    Alert.alert(
      'Create Custom Workout',
      'Choose how you want to create your workout',
      [
        {
          text: 'Quick Generate',
          onPress: () => {
            const customTemplate = WorkoutService.generateCustomWorkout(
              30, // 30 minutes default
              'Strength', // Default category
              'Intermediate', // Default difficulty
              exercises
            );
            handleStartWorkout(customTemplate);
          },
        },
        {
          text: 'Build From Scratch',
          onPress: () => {
            Alert.alert(
              'Coming Soon',
              'Custom workout builder is coming soon! For now, you can use Quick Generate to create a workout based on your preferences.',
              [{ text: 'OK' }]
            );
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderFilterChip = (
    label: string,
    value: string,
    filterType: keyof typeof filters,
    isArray: boolean = true
  ) => {
    const isActive = isArray
      ? (filters[filterType] as string[]).includes(value)
      : filters[filterType] === value;

    return (
      <TouchableOpacity
        key={value}
        style={[
          styles.filterChip,
          {
            backgroundColor: isActive ? colors.primary : colors.card,
            borderColor: colors.border,
          },
        ]}
        onPress={() => {
          if (isArray) {
            const currentValues = filters[filterType] as string[];
            const newValues = isActive
              ? currentValues.filter(v => v !== value)
              : [...currentValues, value];
            dispatch(updateFilters({ [filterType]: newValues }));
          } else {
            dispatch(updateFilters({ [filterType]: isActive ? null : value }));
          }
        }}
      >
        <Text
          style={[
            styles.filterChipText,
            { color: isActive ? 'white' : colors.text },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFiltersSection = () => (
    <View style={[styles.filtersContainer, { backgroundColor: colors.surface }]}>
      <View style={styles.filtersHeader}>
        <Text style={[styles.filtersTitle, { color: colors.text }]}>Filters</Text>
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <Ionicons
            name={showFilters ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContent}>
          {/* Category filters */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Category</Text>
            <View style={styles.filterChips}>
              {['Strength', 'Cardio', 'Flexibility', 'Sports'].map(category =>
                renderFilterChip(category, category, 'category')
              )}
            </View>
          </View>

          {/* Difficulty filters */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Difficulty</Text>
            <View style={styles.filterChips}>
              {['Beginner', 'Intermediate', 'Advanced'].map(difficulty =>
                renderFilterChip(difficulty, difficulty, 'difficulty')
              )}
            </View>
          </View>

          {/* Duration filter */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: colors.text }]}>Duration</Text>
            <View style={styles.durationFilter}>
              <Text style={[styles.durationText, { color: colors.textSecondary }]}>
                {filters.duration.min} - {filters.duration.max} minutes
              </Text>
            </View>
          </View>

          {/* Clear filters */}
          <TouchableOpacity
            style={[styles.clearFiltersButton, { backgroundColor: colors.card }]}
            onPress={() => {
              dispatch(updateFilters({
                category: [],
                difficulty: [],
                equipment: [],
                duration: { min: 0, max: 180 },
                muscleGroups: [],
              }));
              dispatch(setSearchQuery(''));
            }}
          >
            <Text style={[styles.clearFiltersText, { color: colors.text }]}>Clear All Filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderWorkoutTemplate = ({ item }: { item: WorkoutTemplate }) => (
    <TouchableOpacity
      style={[styles.templateCard, { backgroundColor: colors.surface }]}
      onPress={() => handleStartWorkout(item)}
    >
      <View style={styles.templateHeader}>
        <Text style={[styles.templateName, { color: colors.text }]}>{item.name}</Text>
        <View style={styles.templateMeta}>
          {item.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                {item.rating.toFixed(1)}
              </Text>
            </View>
          )}
          <Text style={[styles.usageText, { color: colors.textSecondary }]}>
            {item.timesUsed} uses
          </Text>
        </View>
      </View>

      <Text style={[styles.templateDescription, { color: colors.textSecondary }]}>
        {item.description}
      </Text>

      <View style={styles.templateTags}>
        <View style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.tagText, { color: colors.primary }]}>{item.category}</Text>
        </View>
        <View style={[styles.tag, { backgroundColor: colors.card }]}>
          <Text style={[styles.tagText, { color: colors.text }]}>{item.difficulty}</Text>
        </View>
        <View style={[styles.tag, { backgroundColor: colors.card }]}>
          <Ionicons name="time" size={12} color={colors.textSecondary} />
          <Text style={[styles.tagText, { color: colors.text }]}>{item.estimatedDuration}min</Text>
        </View>
      </View>

      <View style={styles.exercisePreview}>
        <Text style={[styles.exercisePreviewTitle, { color: colors.text }]}>
          {item.exercises.length} exercises
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Workout Library</Text>
            <TouchableOpacity onPress={handleCreateCustomWorkout} style={styles.createButton}>
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search workouts..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={(text) => dispatch(setSearchQuery(text))}
            />
          </View>
        </View>

        {/* Filters */}
        {renderFiltersSection()}

        {/* Results */}
        <View style={styles.resultsContainer}>
          <Text style={[styles.resultsTitle, { color: colors.text }]}>
            {filteredTemplates.length} workouts found
          </Text>

          <FlatList
            data={filteredTemplates}
            renderItem={renderWorkoutTemplate}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.templatesList}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  createButton: {
    padding: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  filtersContainer: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    padding: 16,
  },
  filtersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  filtersContent: {
    marginTop: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  durationFilter: {
    paddingVertical: 8,
  },
  durationText: {
    fontSize: 14,
  },
  clearFiltersButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  templatesList: {
    paddingBottom: 100,
  },
  templateCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  templateMeta: {
    alignItems: 'flex-end',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  usageText: {
    fontSize: 12,
  },
  templateDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  templateTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  exercisePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  exercisePreviewTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default WorkoutLibraryModal;
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { WorkoutSession } from '../store/slices/workoutSlice';

const { width } = Dimensions.get('window');

interface WorkoutHistoryModalProps {
  visible: boolean;
  onClose: () => void;
}

type FilterOption = 'All' | 'Strength' | 'Cardio' | 'Flexibility' | 'Sports';
type SortOption = 'Recent' | 'Duration' | 'Calories' | 'Name';

const WorkoutHistoryModal: React.FC<WorkoutHistoryModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors, isDark } = useTheme();
  const { workoutSessions, exercises } = useSelector(
    (state: RootState) => state.workout
  );

  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('All');
  const [selectedSort, setSelectedSort] = useState<SortOption>('Recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);

  const filteredAndSortedSessions = useMemo(() => {
    let filtered = [...workoutSessions];

    // Apply category filter
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(session => session.category === selectedFilter);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(session =>
        session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    switch (selectedSort) {
      case 'Recent':
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'Duration':
        filtered.sort((a, b) => (b.totalDuration || 0) - (a.totalDuration || 0));
        break;
      case 'Calories':
        filtered.sort((a, b) => (b.caloriesBurned || 0) - (a.caloriesBurned || 0));
        break;
      case 'Name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [workoutSessions, selectedFilter, selectedSort, searchQuery]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));

    if (daysDiff === 0) return 'Today';
    if (daysDiff === 1) return 'Yesterday';
    if (daysDiff < 7) return `${daysDiff} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Strength': return 'barbell';
      case 'Cardio': return 'heart';
      case 'Flexibility': return 'body';
      case 'Sports': return 'basketball';
      default: return 'fitness';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Strength': return '#FF6B6B';
      case 'Cardio': return '#4ECDC4';
      case 'Flexibility': return '#45B7D1';
      case 'Sports': return '#96CEB4';
      default: return colors.primary;
    }
  };

  const renderFilterChip = (filter: FilterOption) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterChip,
        {
          backgroundColor: selectedFilter === filter ? colors.primary : colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        style={[
          styles.filterChipText,
          { color: selectedFilter === filter ? 'white' : colors.text },
        ]}
      >
        {filter}
      </Text>
    </TouchableOpacity>
  );

  const renderSortOption = (sort: SortOption) => (
    <TouchableOpacity
      key={sort}
      style={[
        styles.sortOption,
        {
          backgroundColor: selectedSort === sort ? colors.primary + '20' : 'transparent',
        },
      ]}
      onPress={() => setSelectedSort(sort)}
    >
      <Text
        style={[
          styles.sortOptionText,
          { color: selectedSort === sort ? colors.primary : colors.text },
        ]}
      >
        {sort}
      </Text>
      {selectedSort === sort && (
        <Ionicons name="checkmark" size={16} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  const renderWorkoutSession = ({ item }: { item: WorkoutSession }) => (
    <TouchableOpacity
      style={[styles.sessionCard, { backgroundColor: colors.surface }]}
      onPress={() => setSelectedSession(item)}
    >
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <View style={styles.sessionTitleRow}>
            <View
              style={[
                styles.categoryIndicator,
                { backgroundColor: getCategoryColor(item.category) + '20' },
              ]}
            >
              <Ionicons
                name={getCategoryIcon(item.category) as any}
                size={16}
                color={getCategoryColor(item.category)}
              />
            </View>
            <Text style={[styles.sessionName, { color: colors.text }]}>
              {item.name}
            </Text>
          </View>
          <Text style={[styles.sessionDate, { color: colors.textSecondary }]}>
            {formatDate(item.date)} • {formatTime(item.startTime)}
          </Text>
        </View>

        <View style={styles.sessionMetrics}>
          <View style={styles.metric}>
            <Ionicons name="time" size={12} color={colors.textSecondary} />
            <Text style={[styles.metricText, { color: colors.text }]}>
              {item.totalDuration}min
            </Text>
          </View>
          {item.caloriesBurned && (
            <View style={styles.metric}>
              <Ionicons name="flame" size={12} color="#FF6B35" />
              <Text style={[styles.metricText, { color: colors.text }]}>
                {item.caloriesBurned}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.sessionFooter}>
        <View style={[styles.difficultyBadge, { backgroundColor: colors.card }]}>
          <Text style={[styles.difficultyText, { color: colors.text }]}>
            {item.difficulty}
          </Text>
        </View>
        <Text style={[styles.exerciseCount, { color: colors.textSecondary }]}>
          {item.exercises.length} exercises
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  const renderSessionDetail = () => {
    if (!selectedSession) return null;

    return (
      <Modal
        visible={!!selectedSession}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.detailContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.detailHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setSelectedSession(null)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.detailTitle, { color: colors.text }]}>
              Workout Details
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.detailContent}>
            <View style={[styles.detailCard, { backgroundColor: colors.surface }]}>
              <View style={styles.detailMainInfo}>
                <View
                  style={[
                    styles.detailCategoryIcon,
                    { backgroundColor: getCategoryColor(selectedSession.category) + '20' },
                  ]}
                >
                  <Ionicons
                    name={getCategoryIcon(selectedSession.category) as any}
                    size={32}
                    color={getCategoryColor(selectedSession.category)}
                  />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={[styles.detailName, { color: colors.text }]}>
                    {selectedSession.name}
                  </Text>
                  <Text style={[styles.detailDate, { color: colors.textSecondary }]}>
                    {formatDate(selectedSession.date)} • {formatTime(selectedSession.startTime)}
                  </Text>
                  <View style={styles.detailTags}>
                    <View style={[styles.detailTag, { backgroundColor: colors.card }]}>
                      <Text style={[styles.detailTagText, { color: colors.text }]}>
                        {selectedSession.category}
                      </Text>
                    </View>
                    <View style={[styles.detailTag, { backgroundColor: colors.card }]}>
                      <Text style={[styles.detailTagText, { color: colors.text }]}>
                        {selectedSession.difficulty}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.detailMetrics}>
                <View style={styles.detailMetric}>
                  <Ionicons name="time" size={20} color={colors.primary} />
                  <Text style={[styles.detailMetricValue, { color: colors.text }]}>
                    {selectedSession.totalDuration}
                  </Text>
                  <Text style={[styles.detailMetricLabel, { color: colors.textSecondary }]}>
                    Minutes
                  </Text>
                </View>
                {selectedSession.caloriesBurned && (
                  <View style={styles.detailMetric}>
                    <Ionicons name="flame" size={20} color="#FF6B35" />
                    <Text style={[styles.detailMetricValue, { color: colors.text }]}>
                      {selectedSession.caloriesBurned}
                    </Text>
                    <Text style={[styles.detailMetricLabel, { color: colors.textSecondary }]}>
                      Calories
                    </Text>
                  </View>
                )}
                <View style={styles.detailMetric}>
                  <Ionicons name="fitness" size={20} color={colors.primary} />
                  <Text style={[styles.detailMetricValue, { color: colors.text }]}>
                    {selectedSession.exercises.length}
                  </Text>
                  <Text style={[styles.detailMetricLabel, { color: colors.textSecondary }]}>
                    Exercises
                  </Text>
                </View>
              </View>
            </View>

            {/* Exercise Details */}
            <View style={[styles.exercisesSection, { backgroundColor: colors.surface }]}>
              <Text style={[styles.exercisesSectionTitle, { color: colors.text }]}>
                Exercises
              </Text>
              {selectedSession.exercises.map((exerciseData, index) => {
                const exercise = exercises.find(ex => ex.id === exerciseData.exerciseId);
                return (
                  <View key={index} style={[styles.exerciseDetailCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.exerciseDetailName, { color: colors.text }]}>
                      {exercise?.name || `Exercise ${exerciseData.exerciseId}`}
                    </Text>
                    <View style={styles.setsInfo}>
                      {(exerciseData.sets || []).map((set, setIndex) => (
                        <View key={set.id} style={styles.setDetail}>
                          <Text style={[styles.setLabel, { color: colors.textSecondary }]}>
                            Set {setIndex + 1}:
                          </Text>
                          <Text style={[styles.setValue, { color: colors.text }]}>
                            {set.reps && `${set.reps} reps`}
                            {set.weight && ` • ${set.weight}kg`}
                            {set.duration && `${set.duration}s`}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>

            {selectedSession.notes && (
              <View style={[styles.notesSection, { backgroundColor: colors.surface }]}>
                <Text style={[styles.notesSectionTitle, { color: colors.text }]}>
                  Notes
                </Text>
                <Text style={[styles.notesText, { color: colors.textSecondary }]}>
                  {selectedSession.notes}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="fitness-outline" size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
        No workouts found
      </Text>
      <Text style={[styles.emptyStateDescription, { color: colors.textSecondary }]}>
        Try adjusting your filters or start your first workout!
      </Text>
    </View>
  );

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Workout History
              </Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Search bar */}
            <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search workouts..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterChips}>
                  {(['All', 'Strength', 'Cardio', 'Flexibility', 'Sports'] as FilterOption[]).map(renderFilterChip)}
                </View>
              </ScrollView>
            </View>

            {/* Sort options */}
            <View style={styles.sortContainer}>
              <Text style={[styles.sortLabel, { color: colors.textSecondary }]}>Sort by:</Text>
              <View style={styles.sortOptions}>
                {(['Recent', 'Duration', 'Calories', 'Name'] as SortOption[]).map(renderSortOption)}
              </View>
            </View>
          </View>

          {/* Results */}
          <View style={styles.resultsContainer}>
            <Text style={[styles.resultsTitle, { color: colors.text }]}>
              {filteredAndSortedSessions.length} workout{filteredAndSortedSessions.length !== 1 ? 's' : ''}
            </Text>

            {filteredAndSortedSessions.length === 0 ? (
              renderEmptyState()
            ) : (
              <FlatList
                data={filteredAndSortedSessions}
                renderItem={renderWorkoutSession}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.sessionsList}
              />
            )}
          </View>
        </View>
      </Modal>

      {renderSessionDetail()}
    </>
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  sortOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  sessionsList: {
    paddingBottom: 100,
  },
  sessionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  categoryIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  sessionDate: {
    fontSize: 12,
  },
  sessionMetrics: {
    alignItems: 'flex-end',
    gap: 4,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sessionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '500',
  },
  exerciseCount: {
    fontSize: 12,
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  detailContainer: {
    flex: 1,
  },
  detailHeader: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailContent: {
    flex: 1,
    padding: 20,
  },
  detailCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  detailMainInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 20,
  },
  detailCategoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailInfo: {
    flex: 1,
  },
  detailName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailDate: {
    fontSize: 14,
    marginBottom: 8,
  },
  detailTags: {
    flexDirection: 'row',
    gap: 8,
  },
  detailTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailMetric: {
    alignItems: 'center',
    gap: 4,
  },
  detailMetricValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailMetricLabel: {
    fontSize: 12,
  },
  exercisesSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  exercisesSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  exerciseDetailCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  exerciseDetailName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  setsInfo: {
    gap: 4,
  },
  setDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setLabel: {
    fontSize: 12,
    minWidth: 40,
  },
  setValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  notesSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  notesSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default WorkoutHistoryModal;
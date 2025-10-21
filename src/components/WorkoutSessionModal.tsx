import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  updateWorkoutSet,
  completeWorkoutSessionAsync,
  pauseWorkout,
  resumeWorkout,
  WorkoutSet,
} from '../store/slices/workoutSlice';

const { width } = Dimensions.get('window');

interface WorkoutSessionModalProps {
  visible: boolean;
  onClose: () => void;
}

const WorkoutSessionModal: React.FC<WorkoutSessionModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();
  const { activeSession, isWorkoutActive, exercises } = useSelector(
    (state: RootState) => state.workout
  );

  const [timer, setTimer] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completionNotes, setCompletionNotes] = useState('');
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkoutActive && visible) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
        if (restTimer > 0) {
          setRestTimer((prev) => prev - 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive, visible, restTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSetComplete = (setId: string, exerciseId: string) => {
    dispatch(updateWorkoutSet({ setId, updates: { completed: true } }));

    // Find the exercise and set rest timer
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (exercise) {
      const restTime = 60; // Default 60 seconds rest
      setRestTimer(restTime);
    }
  };

  const handleSetUpdate = (setId: string, field: keyof WorkoutSet, value: any) => {
    dispatch(updateWorkoutSet({ setId, updates: { [field]: value } }));
  };

  const handlePauseResume = () => {
    if (isWorkoutActive) {
      dispatch(pauseWorkout());
    } else {
      dispatch(resumeWorkout());
    }
  };

  const handleCompleteWorkout = () => {
    if (!activeSession) return;

    // Calculate estimated calories burned (simple formula)
    const estimatedCalories = Math.round(timer / 60 * 8); // 8 calories per minute average

    Alert.alert(
      'Complete Workout',
      `Great job! You worked out for ${formatTime(timer)}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            dispatch(completeWorkoutSessionAsync({
              caloriesBurned: estimatedCalories,
              notes: completionNotes
            }));
            onClose();
            setTimer(0);
            setRestTimer(0);
            setCurrentExerciseIndex(0);
            setCompletionNotes('');
          },
        },
      ]
    );
  };

  const renderSetRow = (set: WorkoutSet, setIndex: number, exerciseId: string) => (
    <View key={set.id} style={[styles.setRow, { backgroundColor: colors.card }]}>
      <Text style={[styles.setNumber, { color: colors.text }]}>{setIndex + 1}</Text>

      {set.reps !== undefined && (
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Reps</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            value={set.reps?.toString() || ''}
            onChangeText={(text) => handleSetUpdate(set.id, 'reps', parseInt(text) || 0)}
            keyboardType="numeric"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      )}

      {set.weight !== undefined && (
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Weight</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            value={set.weight?.toString() || ''}
            onChangeText={(text) => handleSetUpdate(set.id, 'weight', parseFloat(text) || 0)}
            keyboardType="numeric"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      )}

      {set.duration !== undefined && (
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Duration</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            value={set.duration?.toString() || ''}
            onChangeText={(text) => handleSetUpdate(set.id, 'duration', parseInt(text) || 0)}
            keyboardType="numeric"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.completeButton,
          { backgroundColor: set.completed ? colors.primary : colors.surface },
        ]}
        onPress={() => handleSetComplete(set.id, exerciseId)}
      >
        <Ionicons
          name={set.completed ? 'checkmark' : 'ellipse-outline'}
          size={20}
          color={set.completed ? 'white' : colors.primary}
        />
      </TouchableOpacity>
    </View>
  );

  const renderExercise = (exerciseData: any, index: number) => {
    const exercise = exercises.find(ex => ex.id === exerciseData.exerciseId);
    const sets = Array.isArray(exerciseData?.sets) ? exerciseData.sets : [];

    if (!exercise) {
      // Fallback for exercises not found in database
      return (
        <View key={exerciseData.exerciseId} style={[styles.exerciseCard, { backgroundColor: colors.surface }]}>
          <View style={styles.exerciseHeader}>
            <Text style={[styles.exerciseName, { color: colors.text }]}>Exercise {exerciseData.exerciseId}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.categoryText, { color: colors.primary }]}>Unknown</Text>
            </View>
          </View>
          <Text style={[styles.exerciseNote, { color: colors.textSecondary }]}>
            Exercise details not available
          </Text>
        </View>
      );
    }

    return (
      <View key={exerciseData.exerciseId} style={[styles.exerciseCard, { backgroundColor: colors.surface }]}>
        <View style={styles.exerciseHeader}>
          <Text style={[styles.exerciseName, { color: colors.text }]}>{exercise.name}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.categoryText, { color: colors.primary }]}>{exercise.category}</Text>
          </View>
        </View>

        <View style={styles.setsContainer}>
          <View style={[styles.setsHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.setsHeaderText, { color: colors.textSecondary }]}>Set</Text>
            {sets[0]?.reps !== undefined && (
              <Text style={[styles.setsHeaderText, { color: colors.textSecondary }]}>Reps</Text>
            )}
            {sets[0]?.weight !== undefined && (
              <Text style={[styles.setsHeaderText, { color: colors.textSecondary }]}>Weight</Text>
            )}
            {sets[0]?.duration !== undefined && (
              <Text style={[styles.setsHeaderText, { color: colors.textSecondary }]}>Duration</Text>
            )}
            <Text style={[styles.setsHeaderText, { color: colors.textSecondary }]}>✓</Text>
          </View>

          {sets.map((set: WorkoutSet, setIndex: number) =>
            renderSetRow(set, setIndex, exerciseData.exerciseId)
          )}
        </View>
      </View>
    );
  };

  if (!activeSession) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="chevron-down" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{activeSession.name}</Text>
            <TouchableOpacity onPress={handlePauseResume} style={styles.pauseButton}>
              <Ionicons name={isWorkoutActive ? 'pause' : 'play'} size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(timer)}</Text>
            {restTimer > 0 && (
              <Text style={styles.restTimerText}>Rest: {restTimer}s</Text>
            )}
          </View>
        </LinearGradient>

        {/* Exercise List */}
        <ScrollView style={styles.exercisesList} showsVerticalScrollIndicator={false}>
          {activeSession.exercises.map((exerciseData, index) =>
            renderExercise(exerciseData, index)
          )}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.completeWorkoutButton, { backgroundColor: colors.primary }]}
            onPress={handleCompleteWorkout}
          >
            <Text style={styles.completeWorkoutText}>Complete Workout</Text>
          </TouchableOpacity>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  pauseButton: {
    padding: 8,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  restTimerText: {
    color: 'white',
    fontSize: 16,
    marginTop: 4,
    opacity: 0.9,
  },
  exercisesList: {
    flex: 1,
    padding: 20,
  },
  exerciseCard: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  setsContainer: {
    marginTop: 8,
  },
  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  setsHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  setNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 30,
    textAlign: 'center',
  },
  inputContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 10,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    textAlign: 'center',
    minWidth: 50,
  },
  completeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  completeWorkoutButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeWorkoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  exerciseNote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
});

export default WorkoutSessionModal;
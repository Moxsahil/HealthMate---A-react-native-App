import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useHealthData } from '../hooks/useHealthData';

interface GoalsSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const GoalsSettingsModal: React.FC<GoalsSettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useTheme();
  const { dailyGoals, updateGoals } = useHealthData();

  const [goals, setGoals] = useState({
    steps: dailyGoals.steps.toString(),
    calories: dailyGoals.calories.toString(),
    activeMinutes: dailyGoals.activeMinutes.toString(),
    water: dailyGoals.waterIntake.toString(),
  });

  useEffect(() => {
    setGoals({
      steps: dailyGoals.steps.toString(),
      calories: dailyGoals.calories.toString(),
      activeMinutes: dailyGoals.activeMinutes.toString(),
      water: dailyGoals.waterIntake.toString(),
    });
  }, [dailyGoals]);

  const handleSave = async () => {
    const stepsValue = parseInt(goals.steps);
    const caloriesValue = parseInt(goals.calories);
    const activeMinutesValue = parseInt(goals.activeMinutes);
    const waterValue = parseInt(goals.water);

    // Validation
    if (
      isNaN(stepsValue) || stepsValue <= 0 ||
      isNaN(caloriesValue) || caloriesValue <= 0 ||
      isNaN(activeMinutesValue) || activeMinutesValue <= 0 ||
      isNaN(waterValue) || waterValue <= 0
    ) {
      Alert.alert('Invalid Input', 'Please enter valid positive numbers for all goals');
      return;
    }

    try {
      await updateGoals({
        steps: stepsValue,
        calories: caloriesValue,
        activeMinutes: activeMinutesValue,
        water: waterValue,
      });

      Alert.alert('Success', 'Goals updated successfully!');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update goals. Please try again.');
    }
  };

  const goalItems = [
    {
      key: 'steps',
      label: 'Daily Steps',
      icon: 'directions-walk',
      color: colors.primary,
      unit: 'steps',
      placeholder: 'e.g., 10000',
    },
    {
      key: 'calories',
      label: 'Daily Calories',
      icon: 'local-fire-department',
      color: colors.warning,
      unit: 'calories',
      placeholder: 'e.g., 2000',
    },
    {
      key: 'activeMinutes',
      label: 'Active Minutes',
      icon: 'timer',
      color: colors.success,
      unit: 'minutes',
      placeholder: 'e.g., 30',
    },
    {
      key: 'water',
      label: 'Water Intake',
      icon: 'water-drop',
      color: colors.info,
      unit: 'glasses',
      placeholder: 'e.g., 8',
    },
  ];

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
      paddingTop: 50, // Space for status bar
    },
    modal: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      width: '100%',
      maxHeight: '90%',
      minHeight: '60%',
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    headerIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      flex: 1,
    },
    closeButton: {
      padding: 8,
    },
    scrollContent: {
      flexGrow: 1,
    },
    goalItem: {
      marginBottom: 20,
    },
    goalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    goalIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    goalLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    goalUnit: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.surface,
      minHeight: 50, // Ensure minimum touch target
      textAlignVertical: 'center',
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    saveButton: {
      backgroundColor: colors.primary,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: 'white',
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 20,
      lineHeight: 20,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <MaterialIcons name="flag" size={24} color={colors.primary} />
            </View>
            <Text style={styles.title}>Daily Goals</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            Set your daily health and fitness goals. These will be used to track your progress and motivate you to stay active.
          </Text>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {goalItems.map((item) => (
              <View key={item.key} style={styles.goalItem}>
                <View style={styles.goalHeader}>
                  <View style={[styles.goalIcon, { backgroundColor: item.color + '20' }]}>
                    <MaterialIcons
                      name={item.icon as any}
                      size={18}
                      color={item.color}
                    />
                  </View>
                  <Text style={styles.goalLabel}>{item.label}</Text>
                  <Text style={styles.goalUnit}>{item.unit}</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={goals[item.key as keyof typeof goals]}
                  onChangeText={(value) =>
                    setGoals(prev => ({ ...prev, [item.key]: value }))
                  }
                  placeholder={item.placeholder}
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            ))}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Goals</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default GoalsSettingsModal;
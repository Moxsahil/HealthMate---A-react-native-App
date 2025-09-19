import React, { useState } from 'react';
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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useHealthData } from '../hooks/useHealthData';

interface ManualDataEntryProps {
  visible: boolean;
  onClose: () => void;
  dataType: 'steps' | 'calories' | 'activeMinutes' | 'water';
}

const ManualDataEntry: React.FC<ManualDataEntryProps> = ({
  visible,
  onClose,
  dataType,
}) => {
  const { colors } = useTheme();
  const { addSteps, addCalories, addActiveMinutes, addWaterIntake } = useHealthData();
  const [value, setValue] = useState('');

  const getTitle = () => {
    switch (dataType) {
      case 'steps':
        return 'Add Steps';
      case 'calories':
        return 'Add Calories';
      case 'activeMinutes':
        return 'Add Active Minutes';
      case 'water':
        return 'Add Water Intake';
      default:
        return 'Add Data';
    }
  };

  const getIcon = () => {
    switch (dataType) {
      case 'steps':
        return 'directions-walk';
      case 'calories':
        return 'local-fire-department';
      case 'activeMinutes':
        return 'timer';
      case 'water':
        return 'water-drop';
      default:
        return 'add';
    }
  };

  const getPlaceholder = () => {
    switch (dataType) {
      case 'steps':
        return 'Enter number of steps (e.g., 1000)';
      case 'calories':
        return 'Enter calories burned (e.g., 200)';
      case 'activeMinutes':
        return 'Enter minutes (e.g., 30)';
      case 'water':
        return 'Enter glasses of water (e.g., 2)';
      default:
        return 'Enter value';
    }
  };

  const handleSubmit = async () => {
    const numValue = parseInt(value);

    if (isNaN(numValue) || numValue <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid positive number');
      return;
    }

    try {
      switch (dataType) {
        case 'steps':
          await addSteps(numValue);
          break;
        case 'calories':
          await addCalories(numValue);
          break;
        case 'activeMinutes':
          await addActiveMinutes(numValue);
          break;
        case 'water':
          for (let i = 0; i < numValue; i++) {
            addWaterIntake();
          }
          break;
      }

      Alert.alert('Success', `${getTitle().replace('Add ', '')} added successfully!`);
      setValue('');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to add data. Please try again.');
    }
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modal: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      margin: 20,
      width: '90%',
      maxWidth: 400,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    icon: {
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
    inputContainer: {
      marginBottom: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
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
    submitButton: {
      backgroundColor: colors.primary,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: 'white',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.icon}>
              <MaterialIcons
                name={getIcon() as any}
                size={24}
                color={colors.primary}
              />
            </View>
            <Text style={styles.title}>{getTitle()}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Value</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              placeholder={getPlaceholder()}
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              autoFocus
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ManualDataEntry;
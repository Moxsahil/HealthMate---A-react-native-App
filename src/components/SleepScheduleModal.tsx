import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { SleepGoals } from '../services/sleepService';

const { width, height } = Dimensions.get('window');

interface SleepScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  currentGoals: SleepGoals;
  onUpdateGoals: (goals: Partial<SleepGoals>) => void;
  isLoading?: boolean;
}

const SleepScheduleModal: React.FC<SleepScheduleModalProps> = ({
  visible,
  onClose,
  currentGoals,
  onUpdateGoals,
  isLoading = false,
}) => {
  const { colors, isDark } = useTheme();
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;

  // Local state for the goals
  const [bedtime, setBedtime] = useState(currentGoals.bedtime);
  const [wakeTime, setWakeTime] = useState(currentGoals.wakeTime);
  const [targetSleepHours, setTargetSleepHours] = useState(currentGoals.targetSleepHours);

  // Time picker state
  const [showBedtimePicker, setShowBedtimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);
  const [tempBedtime, setTempBedtime] = useState(new Date());
  const [tempWakeTime, setTempWakeTime] = useState(new Date());

  React.useEffect(() => {
    if (visible) {
      // Reset local state when modal opens
      setBedtime(currentGoals.bedtime);
      setWakeTime(currentGoals.wakeTime);
      setTargetSleepHours(currentGoals.targetSleepHours);

      // Initialize temp dates with current goals
      setTempBedtime(createDateFromTime(currentGoals.bedtime));
      setTempWakeTime(createDateFromTime(currentGoals.wakeTime));

      // Animate in
      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    // Calculate duration in minutes
    const bedtimeParts = bedtime.split(':');
    const waketimeParts = wakeTime.split(':');

    let bedtimeMinutes = parseInt(bedtimeParts[0]) * 60 + parseInt(bedtimeParts[1]);
    let waketimeMinutes = parseInt(waketimeParts[0]) * 60 + parseInt(waketimeParts[1]);

    // Handle overnight sleep
    if (waketimeMinutes < bedtimeMinutes) {
      waketimeMinutes += 24 * 60;
    }

    const duration = waketimeMinutes - bedtimeMinutes;

    const updatedGoals: Partial<SleepGoals> = {
      bedtime,
      wakeTime,
      duration,
      targetSleepHours,
    };

    onUpdateGoals(updatedGoals);
    handleClose();
  };

  const formatTime12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const createDateFromTime = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const formatTimeFromDate = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleBedtimePress = () => {
    if (Platform.OS === 'ios') {
      setTempBedtime(createDateFromTime(bedtime));
      setShowBedtimePicker(true);
    } else {
      setShowBedtimePicker(true);
    }
  };

  const handleWakeTimePress = () => {
    if (Platform.OS === 'ios') {
      setTempWakeTime(createDateFromTime(wakeTime));
      setShowWakeTimePicker(true);
    } else {
      setShowWakeTimePicker(true);
    }
  };

  const handleBedtimeChange = (_: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowBedtimePicker(false);
    }

    if (selectedDate) {
      if (Platform.OS === 'ios') {
        setTempBedtime(selectedDate);
      } else {
        setBedtime(formatTimeFromDate(selectedDate));
      }
    }
  };

  const handleWakeTimeChange = (_: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowWakeTimePicker(false);
    }

    if (selectedDate) {
      if (Platform.OS === 'ios') {
        setTempWakeTime(selectedDate);
      } else {
        setWakeTime(formatTimeFromDate(selectedDate));
      }
    }
  };

  const handleBedtimeConfirm = () => {
    setBedtime(formatTimeFromDate(tempBedtime));
    setShowBedtimePicker(false);
  };

  const handleBedtimeCancel = () => {
    setTempBedtime(createDateFromTime(bedtime));
    setShowBedtimePicker(false);
  };

  const handleWakeTimeConfirm = () => {
    setWakeTime(formatTimeFromDate(tempWakeTime));
    setShowWakeTimePicker(false);
  };

  const handleWakeTimeCancel = () => {
    setTempWakeTime(createDateFromTime(wakeTime));
    setShowWakeTimePicker(false);
  };

  const adjustTargetHours = (change: number) => {
    const newHours = Math.max(4, Math.min(12, targetSleepHours + change));
    setTargetSleepHours(newHours);
  };

  // Theme-aware picker styles
  const pickerStyles = StyleSheet.create({
    pickerOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'flex-end',
    },
    pickerContainer: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: height * 0.4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 10,
    },
    pickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: isDark ? colors.card : colors.background,
    },
    pickerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    pickerButton: {
      fontSize: 16,
      color: colors.primary,
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    pickerConfirmButton: {
      fontWeight: '700',
    },
    pickerDateTimePicker: {
      backgroundColor: colors.surface,
      minHeight: 200,
    },
  });

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: opacityAnimation,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  transform: [
                    {
                      translateY: slideAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [height, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={['#1a1a2e', '#16213e', '#0f3460']}
                style={styles.modalGradient}
              >
                {/* Header */}
                <View style={styles.header}>
                  <View style={styles.headerLeft}>
                    <MaterialIcons name="schedule" size={24} color="#4CAF50" />
                    <Text style={styles.headerTitle}>Sleep Schedule</Text>
                  </View>
                  <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <MaterialIcons name="close" size={24} color="#b0b0b0" />
                  </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.content}>
                  <Text style={styles.subtitle}>
                    Set your ideal bedtime and wake time to maintain a consistent sleep schedule
                  </Text>

                  {/* Bedtime Setting */}
                  <View style={styles.settingSection}>
                    <View style={styles.settingHeader}>
                      <MaterialIcons name="bedtime" size={20} color="#FF9800" />
                      <Text style={styles.settingLabel}>Bedtime</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.timePicker}
                      onPress={handleBedtimePress}
                    >
                      <Text style={styles.timeText}>{formatTime12Hour(bedtime)}</Text>
                      <MaterialIcons name="keyboard-arrow-right" size={24} color="#b0b0b0" />
                    </TouchableOpacity>
                  </View>

                  {/* Wake Time Setting */}
                  <View style={styles.settingSection}>
                    <View style={styles.settingHeader}>
                      <MaterialIcons name="alarm" size={20} color="#4CAF50" />
                      <Text style={styles.settingLabel}>Wake Time</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.timePicker}
                      onPress={handleWakeTimePress}
                    >
                      <Text style={styles.timeText}>{formatTime12Hour(wakeTime)}</Text>
                      <MaterialIcons name="keyboard-arrow-right" size={24} color="#b0b0b0" />
                    </TouchableOpacity>
                  </View>

                  {/* Target Sleep Hours */}
                  <View style={styles.settingSection}>
                    <View style={styles.settingHeader}>
                      <MaterialIcons name="access-time" size={20} color="#2196F3" />
                      <Text style={styles.settingLabel}>Target Sleep Hours</Text>
                    </View>
                    <View style={styles.hoursAdjuster}>
                      <TouchableOpacity
                        style={styles.adjustButton}
                        onPress={() => adjustTargetHours(-0.5)}
                      >
                        <MaterialIcons name="remove" size={20} color="#ffffff" />
                      </TouchableOpacity>
                      <Text style={styles.hoursText}>{targetSleepHours}h</Text>
                      <TouchableOpacity
                        style={styles.adjustButton}
                        onPress={() => adjustTargetHours(0.5)}
                      >
                        <MaterialIcons name="add" size={20} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Preview */}
                  <View style={styles.previewSection}>
                    <Text style={styles.previewLabel}>Sleep Duration Preview</Text>
                    <Text style={styles.previewText}>
                      {(() => {
                        const bedtimeParts = bedtime.split(':');
                        const waketimeParts = wakeTime.split(':');
                        let bedtimeMinutes = parseInt(bedtimeParts[0]) * 60 + parseInt(bedtimeParts[1]);
                        let waketimeMinutes = parseInt(waketimeParts[0]) * 60 + parseInt(waketimeParts[1]);
                        if (waketimeMinutes < bedtimeMinutes) {
                          waketimeMinutes += 24 * 60;
                        }
                        const duration = waketimeMinutes - bedtimeMinutes;
                        const hours = Math.floor(duration / 60);
                        const minutes = duration % 60;
                        return `${hours}h ${minutes}m`;
                      })()}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={handleClose}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.saveButton, isLoading && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={colors.primary ? [colors.primary, '#42A5F5'] : ['#2196F3', '#42A5F5']}
                      style={styles.saveButtonGradient}
                    >
                      {isLoading ? (
                        <MaterialIcons name="hourglass-empty" size={20} color="#ffffff" />
                      ) : (
                        <MaterialIcons name="check" size={20} color="#ffffff" />
                      )}
                      <Text style={styles.saveButtonText}>
                        {isLoading ? 'Saving...' : 'Save Schedule'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>

      {/* iOS Time Pickers */}
      {Platform.OS === 'ios' && showBedtimePicker && (
        <Modal transparent={true} animationType="slide">
          <View style={pickerStyles.pickerOverlay}>
            <View style={pickerStyles.pickerContainer}>
              <View style={pickerStyles.pickerHeader}>
                <TouchableOpacity onPress={handleBedtimeCancel}>
                  <Text style={pickerStyles.pickerButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={pickerStyles.pickerTitle}>Bedtime</Text>
                <TouchableOpacity onPress={handleBedtimeConfirm}>
                  <Text style={[pickerStyles.pickerButton, pickerStyles.pickerConfirmButton]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempBedtime}
                mode="time"
                display="spinner"
                onChange={handleBedtimeChange}
                style={pickerStyles.pickerDateTimePicker}
                textColor={colors.text}
                themeVariant={isDark ? 'dark' : 'light'}
              />
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === 'ios' && showWakeTimePicker && (
        <Modal transparent={true} animationType="slide">
          <View style={pickerStyles.pickerOverlay}>
            <View style={pickerStyles.pickerContainer}>
              <View style={pickerStyles.pickerHeader}>
                <TouchableOpacity onPress={handleWakeTimeCancel}>
                  <Text style={pickerStyles.pickerButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={pickerStyles.pickerTitle}>Wake Time</Text>
                <TouchableOpacity onPress={handleWakeTimeConfirm}>
                  <Text style={[pickerStyles.pickerButton, pickerStyles.pickerConfirmButton]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempWakeTime}
                mode="time"
                display="spinner"
                onChange={handleWakeTimeChange}
                style={pickerStyles.pickerDateTimePicker}
                textColor={colors.text}
                themeVariant={isDark ? 'dark' : 'light'}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Android Time Pickers */}
      {Platform.OS === 'android' && showBedtimePicker && (
        <DateTimePicker
          value={createDateFromTime(bedtime)}
          mode="time"
          display="default"
          onChange={handleBedtimeChange}
          themeVariant={isDark ? 'dark' : 'light'}
        />
      )}

      {Platform.OS === 'android' && showWakeTimePicker && (
        <DateTimePicker
          value={createDateFromTime(wakeTime)}
          mode="time"
          display="default"
          onChange={handleWakeTimeChange}
          themeVariant={isDark ? 'dark' : 'light'}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    maxHeight: height * 0.8,
  },
  modalGradient: {
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#b0b0b0',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  settingSection: {
    marginBottom: 24,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  timePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  hoursAdjuster: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  adjustButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  hoursText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    minWidth: 60,
    textAlign: 'center',
  },
  previewSection: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.4)',
    marginTop: 8,
  },
  previewLabel: {
    fontSize: 14,
    color: '#b0b0b0',
    marginBottom: 6,
    fontWeight: '500',
  },
  previewText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4CAF50',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 24,
    paddingBottom: 30,
    paddingTop: 20,
  },
  actionButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#b0b0b0',
  },
  saveButton: {
    overflow: 'hidden',
    borderRadius: 16,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default SleepScheduleModal;
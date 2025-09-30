import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addSleepSessionAsync } from '../store/slices/sleepSlice';
import { AppDispatch } from '../store/store';
import { useTheme } from '../hooks/useTheme';

interface SleepLogModalProps {
  visible: boolean;
  onClose: () => void;
}

const SleepLogModal: React.FC<SleepLogModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isTablet = screenWidth > 768;

  const [date, setDate] = useState(new Date());
  const [bedtime, setBedtime] = useState(new Date());
  const [wakeTime, setWakeTime] = useState(new Date());
  const [calculatedQuality, setCalculatedQuality] = useState(3);
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBedtimePicker, setShowBedtimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);

  // iOS specific picker states
  const [tempDate, setTempDate] = useState(new Date());
  const [tempBedtime, setTempBedtime] = useState(new Date());
  const [tempWakeTime, setTempWakeTime] = useState(new Date());

  // Update quality whenever sleep times change
  useEffect(() => {
    const duration = calculateDuration();
    if (duration > 0) {
      const quality = calculateAutomaticQuality(duration);
      setCalculatedQuality(quality);
    }
  }, [bedtime, wakeTime]);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateDuration = (): number => {
    let duration = wakeTime.getTime() - bedtime.getTime();

    // If wake time is earlier than bedtime (next day), add 24 hours
    if (duration < 0) {
      duration += 24 * 60 * 60 * 1000;
    }

    return Math.floor(duration / (1000 * 60)); // Convert to minutes
  };

  const calculateAutomaticQuality = (durationMinutes: number): number => {
    const hours = durationMinutes / 60;

    // Quality based on sleep duration
    if (hours >= 7 && hours <= 8.5) {
      return 5; // Excellent - optimal range
    } else if (hours >= 6.5 && hours < 7) {
      return 4; // Good - slightly under optimal
    } else if (hours > 8.5 && hours <= 9) {
      return 4; // Good - slightly over optimal
    } else if (hours >= 6 && hours < 6.5) {
      return 3; // Average - under optimal
    } else if (hours > 9 && hours <= 10) {
      return 3; // Average - over optimal
    } else if (hours >= 5 && hours < 6) {
      return 2; // Poor - significantly under optimal
    } else {
      return 1; // Very poor - too little or too much sleep
    }
  };

  const formatTime12Hour = (time: Date): string => {
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatTimeRange = (): string => {
    return `${formatTime12Hour(bedtime)} – ${formatTime12Hour(wakeTime)}`;
  };

  // Platform-specific picker handlers
  const handleDatePickerOpen = () => {
    if (Platform.OS === 'ios') {
      setTempDate(date);
      setShowDatePicker(true);
    } else {
      // Android: Show native picker directly
      setShowDatePicker(true);
    }
  };

  const handleDatePickerConfirm = () => {
    setDate(tempDate);
    setShowDatePicker(false);
  };

  const handleDatePickerCancel = () => {
    setTempDate(date);
    setShowDatePicker(false);
  };

  const handleBedtimePickerOpen = () => {
    if (Platform.OS === 'ios') {
      setTempBedtime(bedtime);
      setShowBedtimePicker(true);
    } else {
      // Android: Show native picker directly
      setShowBedtimePicker(true);
    }
  };

  const handleBedtimePickerConfirm = () => {
    setBedtime(tempBedtime);
    setShowBedtimePicker(false);
  };

  const handleBedtimePickerCancel = () => {
    setTempBedtime(bedtime);
    setShowBedtimePicker(false);
  };

  const handleWakeTimePickerOpen = () => {
    if (Platform.OS === 'ios') {
      setTempWakeTime(wakeTime);
      setShowWakeTimePicker(true);
    } else {
      // Android: Show native picker directly
      setShowWakeTimePicker(true);
    }
  };

  const handleWakeTimePickerConfirm = () => {
    setWakeTime(tempWakeTime);
    setShowWakeTimePicker(false);
  };

  const handleWakeTimePickerCancel = () => {
    setTempWakeTime(wakeTime);
    setShowWakeTimePicker(false);
  };

  // Android picker handlers (for native default behavior)
  const handleAndroidDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleAndroidBedtimeChange = (event: any, selectedTime?: Date) => {
    setShowBedtimePicker(false);
    if (event.type === 'set' && selectedTime) {
      setBedtime(selectedTime);
    }
  };

  const handleAndroidWakeTimeChange = (event: any, selectedTime?: Date) => {
    setShowWakeTimePicker(false);
    if (event.type === 'set' && selectedTime) {
      setWakeTime(selectedTime);
    }
  };

  const generateSleepStages = (quality: number) => {
    // Generate realistic sleep stage percentages based on quality
    const baseDeep = 15 + quality * 3; // 18-30% based on quality
    const baseRem = 12 + quality * 2; // 14-22% based on quality

    // Add some realistic variation
    const deep = Math.max(12, Math.min(35, baseDeep + (Math.random() - 0.5) * 6));
    const rem = Math.max(10, Math.min(25, baseRem + (Math.random() - 0.5) * 4));
    const light = Math.max(45, 100 - deep - rem);

    return {
      deepSleep: Math.round(deep),
      remSleep: Math.round(rem),
      lightSleep: Math.round(light),
    };
  };

  const calculateSleepEfficiency = (duration: number, quality: number): number => {
    // Base efficiency on quality and duration
    const baseEfficiency = 60 + quality * 5; // 65-85% base
    const durationHours = duration / 60;

    // Optimal duration is 7-9 hours
    let durationFactor = 1;
    if (durationHours < 6 || durationHours > 10) {
      durationFactor = 0.9;
    } else if (durationHours >= 7 && durationHours <= 8.5) {
      durationFactor = 1.1;
    }

    return Math.max(50, Math.min(100, Math.round(baseEfficiency * durationFactor)));
  };

  const handleSave = async () => {
    const duration = calculateDuration();

    if (duration <= 0 || duration > 24 * 60) {
      Alert.alert('Invalid Duration', 'Please check your bedtime and wake time.');
      return;
    }

    const sleepStages = generateSleepStages(calculatedQuality);
    const sleepEfficiency = calculateSleepEfficiency(duration, calculatedQuality);

    const sleepSession = {
      id: Date.now().toString(),
      date: date.toISOString().split('T')[0],
      bedtime: formatTime(bedtime),
      wakeTime: formatTime(wakeTime),
      duration,
      quality: calculatedQuality as 1 | 2 | 3 | 4 | 5,
      notes: notes.trim() || undefined,
      ...sleepStages,
      sleepEfficiency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await dispatch(addSleepSessionAsync(sleepSession)).unwrap();

      // Reset form
      const now = new Date();
      setDate(now);
      setBedtime(now);
      setWakeTime(now);
      setCalculatedQuality(3);
      setNotes('');

      onClose();
      Alert.alert('Success', 'Sleep session logged successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save sleep session. Please try again.');
    }
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      width: isTablet ? '70%' : '95%',
      maxWidth: isTablet ? 600 : screenWidth - 40,
      maxHeight: screenHeight * 0.85,
      borderRadius: 20,
      overflow: 'hidden',
    },
    modalGradient: {
      padding: isTablet ? 30 : 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: isTablet ? 30 : 20,
    },
    modalTitle: {
      fontSize: isTablet ? 24 : 20,
      fontWeight: '700',
      color: colors.text || '#ffffff',
    },
    closeButton: {
      padding: 8,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: 12,
    },
    inputRow: {
      flexDirection: isTablet ? 'row' : 'column',
      justifyContent: 'space-between',
      gap: isTablet ? 16 : 12,
    },
    inputContainer: {
      flex: isTablet ? 1 : undefined,
    },
    label: {
      fontSize: isTablet ? 16 : 14,
      color: colors.textSecondary || '#b0b0b0',
      marginBottom: 8,
    },
    input: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      padding: isTablet ? 20 : 16,
      color: colors.text || '#ffffff',
      fontSize: isTablet ? 18 : 16,
    },
    timeButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      padding: isTablet ? 20 : 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: isTablet ? 60 : 50,
    },
    timeButtonText: {
      color: colors.text || '#ffffff',
      fontSize: isTablet ? 18 : 16,
      fontWeight: '500',
    },
    qualityDisplay: {
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      borderRadius: 12,
      padding: isTablet ? 20 : 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(33, 150, 243, 0.3)',
    },
    qualityTitle: {
      fontSize: isTablet ? 16 : 14,
      fontWeight: '600',
      color: colors.text || '#ffffff',
      marginBottom: 8,
    },
    qualityValue: {
      fontSize: isTablet ? 32 : 28,
      fontWeight: '700',
      color: '#2196F3',
      marginBottom: 4,
    },
    qualityLabel: {
      fontSize: isTablet ? 14 : 12,
      color: colors.textSecondary || '#b0b0b0',
      textAlign: 'center',
    },
    durationInfo: {
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      borderRadius: 12,
      padding: isTablet ? 20 : 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(76, 175, 80, 0.3)',
    },
    durationText: {
      fontSize: isTablet ? 24 : 20,
      fontWeight: '700',
      color: '#4CAF50',
      marginBottom: 4,
    },
    durationLabel: {
      fontSize: isTablet ? 16 : 14,
      color: colors.textSecondary || '#b0b0b0',
    },
    durationSubtext: {
      fontSize: isTablet ? 14 : 12,
      color: colors.textSecondary || '#b0b0b0',
      marginTop: 4,
      textAlign: 'center',
    },
    notesInput: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      padding: 16,
      color: '#ffffff',
      fontSize: 16,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    saveButton: {
      borderRadius: 12,
      overflow: 'hidden',
      marginTop: 20,
    },
    saveButtonGradient: {
      padding: 16,
      alignItems: 'center',
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff',
    },
    // iOS Picker Modal Styles
    iosPickerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
      zIndex: 10000,
    },
    iosPickerContainer: {
      backgroundColor: colors.surface || '#ffffff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 40,
    },
    iosPickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border || 'rgba(0, 0, 0, 0.1)',
    },
    iosPickerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text || '#000000',
    },
    iosPickerButton: {
      paddingHorizontal: 15,
      paddingVertical: 8,
    },
    iosPickerButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    iosPickerCancelText: {
      color: colors.error || '#FF3B30',
    },
    iosPickerConfirmText: {
      color: colors.primary || '#007AFF',
    },
    iosPickerContent: {
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
  });

  const getQualityDescription = (quality: number): string => {
    const descriptions = [
      'Very Poor Sleep', // 1
      'Poor Sleep',      // 2
      'Average Sleep',   // 3
      'Good Sleep',      // 4
      'Excellent Sleep'  // 5
    ];
    return descriptions[quality - 1] || 'Unknown';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#1a1a2e', '#16213e', '#0f3460']}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Log Sleep Session</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <MaterialIcons name="close" size={24} color={colors.text || '#ffffff'} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={{ maxHeight: screenHeight * 0.6 }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
              {/* Date Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sleep Date</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={handleDatePickerOpen}
                >
                  <Text style={styles.timeButtonText}>{formatDate(date)}</Text>
                  <MaterialIcons name="calendar-today" size={20} color="#b0b0b0" />
                </TouchableOpacity>
              </View>

              {/* Sleep Times */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sleep Times</Text>
                <View style={styles.inputRow}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Bedtime</Text>
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={handleBedtimePickerOpen}
                    >
                      <Text style={styles.timeButtonText}>{formatTime12Hour(bedtime)}</Text>
                      <MaterialIcons name="bedtime" size={20} color="#b0b0b0" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Wake Time</Text>
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={handleWakeTimePickerOpen}
                    >
                      <Text style={styles.timeButtonText}>{formatTime12Hour(wakeTime)}</Text>
                      <MaterialIcons name="alarm" size={20} color="#b0b0b0" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Duration & Quality Display */}
              <View style={styles.section}>
                <View style={styles.durationInfo}>
                  <Text style={styles.durationText}>
                    {Math.floor(calculateDuration() / 60)}h {calculateDuration() % 60}m
                  </Text>
                  <Text style={styles.durationLabel}>Total Sleep Duration</Text>
                  <Text style={styles.durationSubtext}>
                    {formatTimeRange()}
                  </Text>
                </View>
              </View>

              {/* Automatic Sleep Quality */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sleep Quality (Auto-calculated)</Text>
                <View style={styles.qualityDisplay}>
                  <Text style={styles.qualityTitle}>Quality Rating</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <MaterialIcons
                        key={star}
                        name="star"
                        size={isTablet ? 28 : 24}
                        color={star <= calculatedQuality ? '#FFD700' : '#404040'}
                      />
                    ))}
                  </View>
                  <Text style={styles.qualityValue}>{calculatedQuality}/5</Text>
                  <Text style={styles.qualityLabel}>
                    {getQualityDescription(calculatedQuality)}
                  </Text>
                </View>
              </View>

              {/* Notes */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes (Optional)</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="How did you sleep? Any observations..."
                  placeholderTextColor="#808080"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <LinearGradient
                  colors={[colors.primary, '#42A5F5']}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Save Sleep Session</Text>
                </LinearGradient>
              </TouchableOpacity>
              </ScrollView>
            </LinearGradient>
          </View>

          {/* Platform-Specific Pickers */}
          {Platform.OS === 'ios' ? (
            <>
              {/* iOS Custom Date Picker Modal */}
              {showDatePicker && (
                <Modal
                  visible={showDatePicker}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={handleDatePickerCancel}
                >
                  <TouchableOpacity
                    style={styles.iosPickerOverlay}
                    activeOpacity={1}
                    onPress={handleDatePickerCancel}
                  >
                    <View style={styles.iosPickerContainer}>
                      <View style={styles.iosPickerHeader}>
                        <TouchableOpacity
                          style={styles.iosPickerButton}
                          onPress={handleDatePickerCancel}
                        >
                          <Text style={[styles.iosPickerButtonText, styles.iosPickerCancelText]}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                        <Text style={styles.iosPickerTitle}>Select Date</Text>
                        <TouchableOpacity
                          style={styles.iosPickerButton}
                          onPress={handleDatePickerConfirm}
                        >
                          <Text style={[styles.iosPickerButtonText, styles.iosPickerConfirmText]}>
                            Done
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.iosPickerContent}>
                        <DateTimePicker
                          value={tempDate}
                          mode="date"
                          display="spinner"
                          maximumDate={new Date()}
                          onChange={(_, selectedDate) => {
                            if (selectedDate) {
                              setTempDate(selectedDate);
                            }
                          }}
                          style={{ height: 200 }}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                </Modal>
              )}

              {/* iOS Custom Bedtime Picker Modal */}
              {showBedtimePicker && (
                <Modal
                  visible={showBedtimePicker}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={handleBedtimePickerCancel}
                >
                  <TouchableOpacity
                    style={styles.iosPickerOverlay}
                    activeOpacity={1}
                    onPress={handleBedtimePickerCancel}
                  >
                    <View style={styles.iosPickerContainer}>
                      <View style={styles.iosPickerHeader}>
                        <TouchableOpacity
                          style={styles.iosPickerButton}
                          onPress={handleBedtimePickerCancel}
                        >
                          <Text style={[styles.iosPickerButtonText, styles.iosPickerCancelText]}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                        <Text style={styles.iosPickerTitle}>Bedtime</Text>
                        <TouchableOpacity
                          style={styles.iosPickerButton}
                          onPress={handleBedtimePickerConfirm}
                        >
                          <Text style={[styles.iosPickerButtonText, styles.iosPickerConfirmText]}>
                            Done
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.iosPickerContent}>
                        <DateTimePicker
                          value={tempBedtime}
                          mode="time"
                          display="spinner"
                          is24Hour={false}
                          onChange={(_, selectedTime) => {
                            if (selectedTime) {
                              setTempBedtime(selectedTime);
                            }
                          }}
                          style={{ height: 200 }}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                </Modal>
              )}

              {/* iOS Custom Wake Time Picker Modal */}
              {showWakeTimePicker && (
                <Modal
                  visible={showWakeTimePicker}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={handleWakeTimePickerCancel}
                >
                  <TouchableOpacity
                    style={styles.iosPickerOverlay}
                    activeOpacity={1}
                    onPress={handleWakeTimePickerCancel}
                  >
                    <View style={styles.iosPickerContainer}>
                      <View style={styles.iosPickerHeader}>
                        <TouchableOpacity
                          style={styles.iosPickerButton}
                          onPress={handleWakeTimePickerCancel}
                        >
                          <Text style={[styles.iosPickerButtonText, styles.iosPickerCancelText]}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                        <Text style={styles.iosPickerTitle}>Wake Time</Text>
                        <TouchableOpacity
                          style={styles.iosPickerButton}
                          onPress={handleWakeTimePickerConfirm}
                        >
                          <Text style={[styles.iosPickerButtonText, styles.iosPickerConfirmText]}>
                            Done
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.iosPickerContent}>
                        <DateTimePicker
                          value={tempWakeTime}
                          mode="time"
                          display="spinner"
                          is24Hour={false}
                          onChange={(_, selectedTime) => {
                            if (selectedTime) {
                              setTempWakeTime(selectedTime);
                            }
                          }}
                          style={{ height: 200 }}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                </Modal>
              )}
            </>
          ) : (
            <>
              {/* Android Native Date Picker */}
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  onChange={handleAndroidDateChange}
                />
              )}

              {/* Android Native Bedtime Picker */}
              {showBedtimePicker && (
                <DateTimePicker
                  value={bedtime}
                  mode="time"
                  display="default"
                  is24Hour={false}
                  onChange={handleAndroidBedtimeChange}
                />
              )}

              {/* Android Native Wake Time Picker */}
              {showWakeTimePicker && (
                <DateTimePicker
                  value={wakeTime}
                  mode="time"
                  display="default"
                  is24Hour={false}
                  onChange={handleAndroidWakeTimeChange}
                />
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default SleepLogModal;
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
  ScrollView,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useDispatch } from 'react-redux';
import { addMeal } from '../store/slices/nutritionSlice';

interface MealLoggingModalProps {
  visible: boolean;
  onClose: () => void;
}

interface SuggestedMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
}

const MealLoggingModal: React.FC<MealLoggingModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState<'manual' | 'suggestions'>('suggestions');
  const [mealData, setMealData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    quantity: '1',
  });

  const suggestedMeals: SuggestedMeal[] = [
    // Breakfast
    { id: '1', name: 'Scrambled Eggs (2)', calories: 186, protein: 13, carbs: 1, fat: 14, category: 'Breakfast' },
    { id: '2', name: 'Oatmeal with Banana', calories: 300, protein: 8, carbs: 58, fat: 6, category: 'Breakfast' },
    { id: '3', name: 'Greek Yogurt with Berries', calories: 150, protein: 15, carbs: 20, fat: 2, category: 'Breakfast' },
    { id: '4', name: 'Avocado Toast', calories: 250, protein: 8, carbs: 25, fat: 15, category: 'Breakfast' },

    // Lunch
    { id: '5', name: 'Grilled Chicken Salad', calories: 350, protein: 35, carbs: 15, fat: 18, category: 'Lunch' },
    { id: '6', name: 'Turkey Sandwich', calories: 400, protein: 25, carbs: 45, fat: 12, category: 'Lunch' },
    { id: '7', name: 'Quinoa Bowl', calories: 450, protein: 18, carbs: 65, fat: 12, category: 'Lunch' },
    { id: '8', name: 'Caesar Salad', calories: 320, protein: 12, carbs: 20, fat: 24, category: 'Lunch' },

    // Dinner
    { id: '9', name: 'Grilled Salmon with Rice', calories: 500, protein: 40, carbs: 45, fat: 18, category: 'Dinner' },
    { id: '10', name: 'Spaghetti Bolognese', calories: 550, protein: 25, carbs: 70, fat: 18, category: 'Dinner' },
    { id: '11', name: 'Stir-fry Vegetables', calories: 280, protein: 12, carbs: 35, fat: 12, category: 'Dinner' },
    { id: '12', name: 'Grilled Chicken Breast', calories: 380, protein: 42, carbs: 8, fat: 18, category: 'Dinner' },

    // Snacks
    { id: '13', name: 'Apple with Peanut Butter', calories: 190, protein: 8, carbs: 25, fat: 8, category: 'Snack' },
    { id: '14', name: 'Mixed Nuts (1 oz)', calories: 170, protein: 6, carbs: 6, fat: 15, category: 'Snack' },
    { id: '15', name: 'Protein Bar', calories: 200, protein: 20, carbs: 15, fat: 8, category: 'Snack' },
    { id: '16', name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0, category: 'Snack' },
  ];

  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'];

  const filteredMeals = selectedCategory === 'All'
    ? suggestedMeals
    : suggestedMeals.filter(meal => meal.category === selectedCategory);

  const handleManualSubmit = async () => {
    const { name, calories, protein, carbs, fat, quantity } = mealData;

    if (!name || !calories) {
      Alert.alert('Missing Information', 'Please enter meal name and calories');
      return;
    }

    const caloriesNum = parseFloat(calories);
    const proteinNum = parseFloat(protein) || 0;
    const carbsNum = parseFloat(carbs) || 0;
    const fatNum = parseFloat(fat) || 0;
    const quantityNum = parseFloat(quantity) || 1;

    if (isNaN(caloriesNum) || caloriesNum <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid calories');
      return;
    }

    try {
      const meal = {
        id: Date.now().toString(),
        type: 'snack' as const, // Default to snack for manual entries
        foods: [{
          id: Date.now().toString(),
          name,
          calories: caloriesNum,
          protein: proteinNum,
          carbs: carbsNum,
          fat: fatNum,
          quantity: quantityNum,
        }],
        totalCalories: caloriesNum * quantityNum,
        totalProtein: proteinNum * quantityNum,
        totalCarbs: carbsNum * quantityNum,
        totalFat: fatNum * quantityNum,
        timestamp: new Date().toISOString(),
      };

      dispatch(addMeal(meal));

      Alert.alert('Success', 'Meal logged successfully!');
      resetForm();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to log meal. Please try again.');
    }
  };

  const handleSuggestedMealSelect = async (meal: SuggestedMeal) => {
    try {
      const loggedMeal = {
        id: Date.now().toString(),
        type: meal.category.toLowerCase() as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        foods: [{
          id: meal.id,
          name: meal.name,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          quantity: 1,
        }],
        totalCalories: meal.calories,
        totalProtein: meal.protein,
        totalCarbs: meal.carbs,
        totalFat: meal.fat,
        timestamp: new Date().toISOString(),
      };

      dispatch(addMeal(loggedMeal));

      Alert.alert('Success', `${meal.name} logged successfully!`);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to log meal. Please try again.');
    }
  };

  const resetForm = () => {
    setMealData({
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      quantity: '1',
    });
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
      padding: 0,
      margin: 20,
      width: '95%',
      maxWidth: 500,
      height: '85%',
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.success + '20',
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
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      margin: 16,
      borderRadius: 12,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    activeTab: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    activeTabText: {
      color: 'white',
    },
    content: {
      flex: 1,
      padding: 16,
    },
    // Manual entry styles
    inputGroup: {
      marginBottom: 16,
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
    macroInputs: {
      flexDirection: 'row',
      gap: 12,
    },
    macroInput: {
      flex: 1,
    },
    submitButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 16,
    },
    submitButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    // Suggestions styles
    categoryContainer: {
      marginBottom: 16,
    },
    categoryScroll: {
      marginBottom: 16,
    },
    categoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 12,
    },
    activeCategoryButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryButtonText: {
      fontSize: 14,
      color: colors.text,
    },
    activeCategoryButtonText: {
      color: 'white',
    },
    mealItem: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    mealHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    mealName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    mealCalories: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    mealMacros: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    macroText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    categoryBadge: {
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      marginTop: 8,
      alignSelf: 'flex-start',
    },
    categoryBadgeText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '500',
    },
  });

  const renderManualEntry = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Meal Name *</Text>
        <TextInput
          style={styles.input}
          value={mealData.name}
          onChangeText={(text) => setMealData(prev => ({ ...prev, name: text }))}
          placeholder="e.g., Grilled Chicken Salad"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Calories *</Text>
        <TextInput
          style={styles.input}
          value={mealData.calories}
          onChangeText={(text) => setMealData(prev => ({ ...prev, calories: text }))}
          placeholder="e.g., 350"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Macronutrients (optional)</Text>
        <View style={styles.macroInputs}>
          <View style={styles.macroInput}>
            <Text style={[styles.label, { fontSize: 14, marginBottom: 4 }]}>Protein (g)</Text>
            <TextInput
              style={styles.input}
              value={mealData.protein}
              onChangeText={(text) => setMealData(prev => ({ ...prev, protein: text }))}
              placeholder="25"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.macroInput}>
            <Text style={[styles.label, { fontSize: 14, marginBottom: 4 }]}>Carbs (g)</Text>
            <TextInput
              style={styles.input}
              value={mealData.carbs}
              onChangeText={(text) => setMealData(prev => ({ ...prev, carbs: text }))}
              placeholder="30"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.macroInput}>
            <Text style={[styles.label, { fontSize: 14, marginBottom: 4 }]}>Fat (g)</Text>
            <TextInput
              style={styles.input}
              value={mealData.fat}
              onChangeText={(text) => setMealData(prev => ({ ...prev, fat: text }))}
              placeholder="15"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Quantity</Text>
        <TextInput
          style={styles.input}
          value={mealData.quantity}
          onChangeText={(text) => setMealData(prev => ({ ...prev, quantity: text }))}
          placeholder="1"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleManualSubmit}>
        <Text style={styles.submitButtonText}>Log Meal</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderSuggestions = () => (
    <View style={styles.content}>
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.activeCategoryButton
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.activeCategoryButtonText
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredMeals}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.mealItem}
            onPress={() => handleSuggestedMealSelect(item)}
          >
            <View style={styles.mealHeader}>
              <Text style={styles.mealName}>{item.name}</Text>
              <Text style={styles.mealCalories}>{item.calories} cal</Text>
            </View>
            <View style={styles.mealMacros}>
              <Text style={styles.macroText}>Protein: {item.protein}g</Text>
              <Text style={styles.macroText}>Carbs: {item.carbs}g</Text>
              <Text style={styles.macroText}>Fat: {item.fat}g</Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <MaterialIcons name="restaurant" size={24} color={colors.success} />
            </View>
            <Text style={styles.title}>Log Meal</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'suggestions' && styles.activeTab]}
              onPress={() => setActiveTab('suggestions')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'suggestions' && styles.activeTabText
              ]}>
                Suggestions
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'manual' && styles.activeTab]}
              onPress={() => setActiveTab('manual')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'manual' && styles.activeTabText
              ]}>
                Manual Entry
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'manual' ? renderManualEntry() : renderSuggestions()}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default MealLoggingModal;
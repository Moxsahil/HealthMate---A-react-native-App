import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { RootState } from '../../store/store';
import { useTheme } from '../../hooks/useTheme';
import MealLoggingModal from '../../components/MealLoggingModal';

const NutritionScreen: React.FC = () => {
  const { colors } = useTheme();
  const { todayMeals, nutritionGoals, waterIntake } = useSelector((state: RootState) => state.nutrition);
  const [showMealModal, setShowMealModal] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.card,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 4,
    },
    section: {
      paddingHorizontal: 20,
      marginTop: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    summaryCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    caloriesContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    caloriesValue: {
      fontSize: 48,
      fontWeight: 'bold',
      color: colors.primary,
    },
    caloriesLabel: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    caloriesRemaining: {
      fontSize: 14,
      color: colors.text,
    },
    macrosContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    macroItem: {
      alignItems: 'center',
    },
    macroValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    macroLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    macroProgress: {
      width: 60,
      height: 4,
      backgroundColor: colors.surface,
      borderRadius: 2,
      marginTop: 8,
    },
    macroFill: {
      height: '100%',
      borderRadius: 2,
    },
    proteinFill: {
      backgroundColor: colors.error,
    },
    carbsFill: {
      backgroundColor: colors.warning,
    },
    fatFill: {
      backgroundColor: colors.success,
    },
    waterCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    waterHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    waterTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    waterValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.info,
    },
    waterGlasses: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 8,
    },
    glassIcon: {
      padding: 8,
    },
    mealCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    mealHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    mealTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    mealCalories: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    emptyMeal: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    emptyMealText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 8,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
    },
    addButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  // Calculate total calories from meals
  const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
  const remainingCalories = nutritionGoals.calories - totalCalories;

  // Calculate total macros
  const totalProtein = todayMeals.reduce((sum, meal) => sum + meal.totalProtein, 0);
  const totalCarbs = todayMeals.reduce((sum, meal) => sum + meal.totalCarbs, 0);
  const totalFat = todayMeals.reduce((sum, meal) => sum + meal.totalFat, 0);

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nutrition</Text>
        <Text style={styles.subtitle}>Track your meals and hydration</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.caloriesContainer}>
              <Text style={styles.caloriesValue}>{totalCalories}</Text>
              <Text style={styles.caloriesLabel}>calories consumed</Text>
              <Text style={styles.caloriesRemaining}>
                {remainingCalories > 0 ? `${remainingCalories} remaining` : `${Math.abs(remainingCalories)} over goal`}
              </Text>
            </View>

            <View style={styles.macrosContainer}>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{totalProtein}g</Text>
                <Text style={styles.macroLabel}>Protein</Text>
                <View style={styles.macroProgress}>
                  <View
                    style={[
                      styles.macroFill,
                      styles.proteinFill,
                      { width: `${Math.min((totalProtein / nutritionGoals.protein) * 100, 100)}%` },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{totalCarbs}g</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
                <View style={styles.macroProgress}>
                  <View
                    style={[
                      styles.macroFill,
                      styles.carbsFill,
                      { width: `${Math.min((totalCarbs / nutritionGoals.carbs) * 100, 100)}%` },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{totalFat}g</Text>
                <Text style={styles.macroLabel}>Fat</Text>
                <View style={styles.macroProgress}>
                  <View
                    style={[
                      styles.macroFill,
                      styles.fatFill,
                      { width: `${Math.min((totalFat / nutritionGoals.fat) * 100, 100)}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Water Intake</Text>
          <View style={styles.waterCard}>
            <View style={styles.waterHeader}>
              <Text style={styles.waterTitle}>Today's Hydration</Text>
              <Text style={styles.waterValue}>{waterIntake}/{nutritionGoals.water}</Text>
            </View>

            <View style={styles.waterGlasses}>
              {Array.from({ length: nutritionGoals.water }, (_, index) => (
                <TouchableOpacity key={index} style={styles.glassIcon}>
                  <MaterialIcons
                    name="water-drop"
                    size={24}
                    color={index < waterIntake ? colors.info : colors.surface}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          {mealTypes.map((mealType) => {
            const meal = todayMeals.find(m => m.type === mealType);
            const mealTypeTitle = mealType.charAt(0).toUpperCase() + mealType.slice(1);

            return (
              <View key={mealType} style={styles.mealCard}>
                <View style={styles.mealHeader}>
                  <Text style={styles.mealTitle}>{mealTypeTitle}</Text>
                  {meal && (
                    <Text style={styles.mealCalories}>{meal.totalCalories} cal</Text>
                  )}
                </View>

                {meal ? (
                  <View>
                    {meal.foods.map((food, index) => (
                      <Text key={index} style={styles.emptyMealText}>
                        {food.name} (x{food.quantity})
                      </Text>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyMeal}>
                    <MaterialIcons name="add-circle-outline" size={32} color={colors.textSecondary} />
                    <Text style={styles.emptyMealText}>No {mealType} logged yet</Text>
                  </View>
                )}
              </View>
            );
          })}

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowMealModal(true)}
          >
            <Text style={styles.addButtonText}>Add Meal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <MealLoggingModal
        visible={showMealModal}
        onClose={() => setShowMealModal(false)}
      />
    </SafeAreaView>
  );
};

export default NutritionScreen;
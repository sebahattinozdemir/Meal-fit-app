import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { MealCard } from '../components/Cards';
import { workoutDayPlan, restDayPlan } from '../data/meals';
import { DAY_NAMES, MEAL_LABELS, MealType } from '../types';
import { formatIngredient } from '../utils/ingredients';
import { colors, spacing, borderRadius } from '../constants/theme';

export function MealPlanScreen() {
  const { getDayType } = useApp();
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [detailMeal, setDetailMeal] = useState<{ type: MealType; dayType: 'spor' | 'dinlenme' } | null>(null);

  const dayType = getDayType(selectedDay);
  const plan = dayType === 'spor' ? workoutDayPlan : restDayPlan;
  const mealTypes: MealType[] = ['kahvalti', 'ogle', 'aksam', 'araOgun'];

  const totalCalories = mealTypes.reduce((sum, t) => sum + plan.meals[t].calories, 0);
  const totalProtein = mealTypes.reduce((sum, t) => sum + plan.meals[t].protein, 0);
  const totalCarbs = mealTypes.reduce((sum, t) => sum + plan.meals[t].carbs, 0);
  const totalFat = mealTypes.reduce((sum, t) => sum + plan.meals[t].fat, 0);

  const selectedMeal = detailMeal
    ? (detailMeal.dayType === 'spor' ? workoutDayPlan : restDayPlan).meals[detailMeal.type]
    : null;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
        {DAY_NAMES.map((name, index) => {
          const isSelected = index === selectedDay;
          const isWorkout = getDayType(index) === 'spor';
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayTab,
                isSelected && styles.dayTabSelected,
                isWorkout && !isSelected && styles.dayTabWorkout,
              ]}
              onPress={() => setSelectedDay(index)}
            >
              <Text style={[styles.dayTabText, isSelected && styles.dayTabTextSelected]}>
                {name.slice(0, 3)}
              </Text>
              {isWorkout && (
                <Ionicons
                  name="barbell"
                  size={10}
                  color={isSelected ? '#fff' : colors.workout}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.dayTypeBanner, dayType === 'spor' ? styles.workoutBanner : styles.restBanner]}>
          <Ionicons
            name={dayType === 'spor' ? 'barbell' : 'bed-outline'}
            size={20}
            color={dayType === 'spor' ? colors.workout : colors.rest}
          />
          <Text style={[styles.dayTypeText, dayType === 'spor' ? styles.workoutText : styles.restText]}>
            {dayType === 'spor' ? 'Spor Günü Menüsü' : 'Dinlenme Günü Menüsü'}
          </Text>
        </View>

        <View style={styles.macroSummary}>
          <View style={styles.macroBox}>
            <Text style={styles.macroValue}>{totalCalories}</Text>
            <Text style={styles.macroLabel}>kcal</Text>
          </View>
          <View style={styles.macroBox}>
            <Text style={styles.macroValue}>{totalProtein}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroBox}>
            <Text style={styles.macroValue}>{totalCarbs}g</Text>
            <Text style={styles.macroLabel}>Karbonhidrat</Text>
          </View>
          <View style={styles.macroBox}>
            <Text style={styles.macroValue}>{totalFat}g</Text>
            <Text style={styles.macroLabel}>Yağ</Text>
          </View>
        </View>

        {mealTypes.map((type) => {
          const meal = plan.meals[type];
          return (
            <MealCard
              key={type}
              mealType={MEAL_LABELS[type]}
              name={meal.name}
              calories={meal.calories}
              protein={meal.protein}
              prepTime={meal.prepTime}
              ingredients={meal.ingredients}
              isWorkout={dayType === 'spor'}
              onPress={() => setDetailMeal({ type, dayType })}
            />
          );
        })}
      </ScrollView>

      <Modal visible={!!detailMeal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMeal && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedMeal.name}</Text>
                  <TouchableOpacity onPress={() => setDetailMeal(null)}>
                    <Ionicons name="close-circle" size={28} color={colors.textLight} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalDescription}>{selectedMeal.description}</Text>

                <View style={styles.modalMacros}>
                  <View style={styles.modalMacroItem}>
                    <Text style={styles.modalMacroValue}>{selectedMeal.calories}</Text>
                    <Text style={styles.modalMacroLabel}>kcal</Text>
                  </View>
                  <View style={styles.modalMacroItem}>
                    <Text style={styles.modalMacroValue}>{selectedMeal.protein}g</Text>
                    <Text style={styles.modalMacroLabel}>Protein</Text>
                  </View>
                  <View style={styles.modalMacroItem}>
                    <Text style={styles.modalMacroValue}>{selectedMeal.carbs}g</Text>
                    <Text style={styles.modalMacroLabel}>Karb.</Text>
                  </View>
                  <View style={styles.modalMacroItem}>
                    <Text style={styles.modalMacroValue}>{selectedMeal.fat}g</Text>
                    <Text style={styles.modalMacroLabel}>Yağ</Text>
                  </View>
                </View>

                <Text style={styles.ingredientsTitle}>Malzemeler</Text>
                {selectedMeal.ingredients.map((ing, i) => (
                  <View key={i} style={styles.ingredientRow}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                    <Text style={styles.ingredientText}>{formatIngredient(ing)}</Text>
                  </View>
                ))}

                <View style={styles.prepRow}>
                  <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
                  <Text style={styles.prepText}>Hazırlık süresi: {selectedMeal.prepTime} dakika</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  daySelector: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 56,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayTabSelected: { backgroundColor: colors.primary },
  dayTabWorkout: { backgroundColor: colors.workoutLight },
  dayTabText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  dayTabTextSelected: { color: '#fff' },
  content: { flex: 1, padding: spacing.lg },
  dayTypeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  workoutBanner: { backgroundColor: colors.workoutLight },
  restBanner: { backgroundColor: colors.restLight },
  dayTypeText: { fontSize: 15, fontWeight: '600' },
  workoutText: { color: colors.workout },
  restText: { color: colors.rest },
  macroSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  macroBox: { alignItems: 'center', flex: 1 },
  macroValue: { fontSize: 18, fontWeight: '700', color: colors.text },
  macroLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: colors.text, flex: 1, marginRight: spacing.sm },
  modalDescription: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg },
  modalMacros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  modalMacroItem: { alignItems: 'center' },
  modalMacroValue: { fontSize: 20, fontWeight: '700', color: colors.primary },
  modalMacroLabel: { fontSize: 11, color: colors.textSecondary },
  ingredientsTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  ingredientText: { fontSize: 15, color: colors.text },
  prepRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  prepText: { fontSize: 14, color: colors.textSecondary },
});

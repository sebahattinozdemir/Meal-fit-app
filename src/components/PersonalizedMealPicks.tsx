import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCatalogMealById } from '../data/mealCatalog';
import { ScoredMeal } from '../types/personalization';
import { MEAL_LABELS } from '../types';
import { colors, spacing, borderRadius } from '../constants/theme';

interface Props {
  picks: ScoredMeal[];
  onMealPress: (mealId: string) => void;
  title?: string;
}

export function PersonalizedMealPicks({ picks, onMealPress, title = 'Sana uygun tarifler' }: Props) {
  if (picks.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Ionicons name="heart-outline" size={18} color={colors.primary} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {picks.map((pick) => {
          const meal = getCatalogMealById(pick.mealId);
          if (!meal) return null;
          return (
            <TouchableOpacity
              key={pick.mealId}
              style={styles.card}
              onPress={() => onMealPress(pick.mealId)}
              activeOpacity={0.88}
            >
              <Text style={styles.mealType}>{MEAL_LABELS[meal.mealType]}</Text>
              <Text style={styles.mealName} numberOfLines={2}>
                {meal.name}
              </Text>
              <Text style={styles.meta}>
                {meal.calories} kcal · {meal.protein}g P · {meal.prepTime} dk
              </Text>
              <Text style={styles.reason} numberOfLines={2}>
                {pick.reason}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  title: { fontSize: 15, fontWeight: '800', color: colors.text },
  card: {
    width: 168,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.sm + 2,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary + '44',
  },
  mealType: { fontSize: 10, fontWeight: '700', color: colors.primary, textTransform: 'uppercase' },
  mealName: { fontSize: 14, fontWeight: '800', color: colors.text, marginTop: 4, minHeight: 36 },
  meta: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },
  reason: { fontSize: 10, color: colors.textLight, marginTop: 6, lineHeight: 14 },
});

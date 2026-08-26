import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MealIngredient } from '../types';
import { formatIngredient } from '../utils/ingredients';
import { colors, spacing, borderRadius, fonts, cardShadow } from '../constants/theme';

interface Props {
  title: string;
  value?: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  compact?: boolean;
  onPress?: () => void;
}

export function StatCard({ title, value, subtitle, icon, iconColor, iconBg, compact, onPress }: Props) {
  const content = (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={[styles.iconContainer, compact && styles.iconContainerCompact, { backgroundColor: iconBg || colors.primaryLight }]}>
        <Ionicons name={icon} size={compact ? 22 : 24} color={iconColor || colors.primary} />
      </View>
      <View style={[styles.textContainer, compact && styles.textContainerCompact]}>
        <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
        {value !== undefined && <Text style={[styles.value, compact && styles.valueCompact]}>{value}</Text>}
        {subtitle && <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>{subtitle}</Text>}
      </View>
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{content}</TouchableOpacity>;
  }
  return content;
}

interface MealCardProps {
  mealType: string;
  name: string;
  calories: number;
  protein: number;
  prepTime: number;
  ingredients: MealIngredient[];
  isWorkout?: boolean;
  onPress?: () => void;
}

export function MealCard({ mealType, name, calories, protein, prepTime, ingredients, isWorkout, onPress }: MealCardProps) {
  const content = (
    <>
      <View style={styles.mealHeader}>
        <View style={[styles.mealBadge, isWorkout ? styles.workoutBadge : styles.restBadge]}>
          <Text style={[styles.mealBadgeText, isWorkout ? styles.workoutBadgeText : styles.restBadgeText]}>
            {mealType}
          </Text>
        </View>
        <Text style={styles.prepTime}>{prepTime} dk</Text>
      </View>
      <Text style={styles.mealName}>{name}</Text>
      <View style={styles.macros}>
        <View style={styles.macroItem}>
          <Ionicons name="flame-outline" size={14} color={colors.workout} />
          <Text style={styles.macroText}>{calories} kcal</Text>
        </View>
        <View style={styles.macroItem}>
          <Ionicons name="barbell-outline" size={14} color={colors.primary} />
          <Text style={styles.macroText}>{protein}g protein</Text>
        </View>
      </View>
      <View style={styles.ingredientList}>
        {ingredients.map((ing, i) => (
          <View key={i} style={styles.ingredientRow}>
            <Text style={styles.ingredientBullet}>•</Text>
            <Text style={styles.ingredientText} numberOfLines={2}>
              {formatIngredient(ing)}
            </Text>
          </View>
        ))}
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.mealCard, isWorkout && styles.mealCardWorkout]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.mealCard, isWorkout && styles.mealCardWorkout]}>{content}</View>;
}

interface DayChipProps {
  dayName: string;
  dayIndex: number;
  isWorkout: boolean;
  isToday: boolean;
  onPress?: () => void;
}

export function DayChip({ dayName, isWorkout, isToday, onPress }: DayChipProps) {
  const chipStyle = [
    styles.dayChip,
    isWorkout && styles.dayChipWorkout,
    isToday && styles.dayChipToday,
  ];
  const content = (
    <>
      <Text style={[styles.dayChipText, isWorkout && styles.dayChipTextWorkout]}>
        {dayName.slice(0, 3)}
      </Text>
      {isWorkout && (
        <Ionicons name="barbell" size={12} color={colors.workout} style={styles.dayChipIcon} />
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={chipStyle} onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={chipStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...cardShadow,
  },
  cardCompact: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: spacing.sm + 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconContainerCompact: {
    width: 40,
    height: 40,
    marginRight: 0,
    marginBottom: spacing.sm,
  },
  textContainer: { flex: 1 },
  textContainerCompact: { width: '100%' },
  title: { fontSize: 13, fontFamily: fonts.medium, color: colors.textSecondary },
  titleCompact: { fontSize: 11 },
  value: { fontSize: 22, fontFamily: fonts.extrabold, color: colors.text, marginTop: 2 },
  valueCompact: { fontSize: 20 },
  subtitle: { fontSize: 12, fontFamily: fonts.regular, color: colors.textLight, marginTop: 2 },
  subtitleCompact: { fontSize: 10 },

  mealCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.rest,
    ...cardShadow,
  },
  mealCardWorkout: { borderLeftColor: colors.workout },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  mealBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  workoutBadge: { backgroundColor: colors.workoutLight },
  restBadge: { backgroundColor: colors.restLight },
  mealBadgeText: { fontSize: 11, fontFamily: fonts.bold },
  workoutBadgeText: { color: colors.workout },
  restBadgeText: { color: colors.rest },
  prepTime: { fontSize: 12, color: colors.textLight },
  mealName: { fontSize: 16, fontFamily: fonts.bold, color: colors.text, marginBottom: spacing.sm },
  macros: { flexDirection: 'row', gap: spacing.md },
  macroItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  macroText: { fontSize: 12, color: colors.textSecondary },
  ingredientList: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ingredientRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 4 },
  ingredientBullet: { fontSize: 12, color: colors.primary, lineHeight: 18, width: 10 },
  ingredientText: { flex: 1, fontSize: 12, color: colors.textSecondary, lineHeight: 18 },

  dayChip: {
    width: 44,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  dayChipWorkout: {
    backgroundColor: colors.workoutLight,
    borderColor: colors.workout,
  },
  dayChipToday: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  dayChipText: { fontSize: 12, fontFamily: fonts.bold, color: colors.textSecondary },
  dayChipTextWorkout: { color: colors.workout },
  dayChipIcon: { marginTop: 2 },
});

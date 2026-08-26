import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fonts, cardShadow } from '../constants/theme';

interface Props {
  dayType: 'spor' | 'dinlenme';
  dayName: string;
  calories: number;
  protein: number;
  nutritionNote?: string;
  loggedWorkoutToday: boolean;
  workoutsThisWeek: number;
  workoutStreak: number;
  onWorkoutPress: () => void;
  onProgressPress: () => void;
}

export function TodaySummaryCard({
  dayType,
  dayName,
  calories,
  protein,
  nutritionNote,
  loggedWorkoutToday,
  workoutsThisWeek,
  workoutStreak,
  onWorkoutPress,
  onProgressPress,
}: Props) {
  const isWorkout = dayType === 'spor';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.dayBadge, isWorkout ? styles.dayBadgeWorkout : styles.dayBadgeRest]}>
          <Ionicons
            name={isWorkout ? 'barbell' : 'moon-outline'}
            size={14}
            color={isWorkout ? colors.workout : colors.rest}
          />
          <Text style={[styles.dayBadgeText, isWorkout ? styles.dayTextWorkout : styles.dayTextRest]}>
            {isWorkout ? 'Spor günü' : 'Dinlenme günü'}
          </Text>
        </View>
        <Text style={styles.dayName}>{dayName}</Text>
      </View>

      <View style={styles.macroRow}>
        <View style={styles.macroBlock}>
          <Text style={styles.macroValue}>{calories}</Text>
          <Text style={styles.macroLabel}>kcal hedef</Text>
        </View>
        <View style={styles.macroDivider} />
        <View style={styles.macroBlock}>
          <Text style={styles.macroValue}>{protein}g</Text>
          <Text style={styles.macroLabel}>protein</Text>
        </View>
      </View>

      {nutritionNote ? <Text style={styles.note}>{nutritionNote}</Text> : null}

      {isWorkout ? (
        <TouchableOpacity
          style={[styles.workoutRow, loggedWorkoutToday && styles.workoutRowDone]}
          onPress={onWorkoutPress}
          activeOpacity={0.85}
        >
          <Ionicons
            name={loggedWorkoutToday ? 'checkmark-circle' : 'ellipse-outline'}
            size={20}
            color={loggedWorkoutToday ? colors.success : colors.workout}
          />
          <Text style={styles.workoutText}>
            {loggedWorkoutToday ? 'Antrenman kaydedildi' : 'Antrenmanı kaydet'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
        </TouchableOpacity>
      ) : null}

      <View style={styles.footerRow}>
        <View style={styles.miniStat}>
          <Ionicons name="flame-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.miniStatText}>{workoutStreak} gün seri</Text>
        </View>
        <View style={styles.miniStat}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.miniStatText}>Bu hafta {workoutsThisWeek}</Text>
        </View>
        <TouchableOpacity style={styles.progressLink} onPress={onProgressPress} hitSlop={8}>
          <Text style={styles.progressLinkText}>Gelişim</Text>
          <Ionicons name="arrow-forward" size={12} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: -spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  dayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  dayBadgeWorkout: { backgroundColor: colors.workoutLight },
  dayBadgeRest: { backgroundColor: colors.restLight },
  dayBadgeText: { fontSize: 12, fontFamily: fonts.extrabold },
  dayTextWorkout: { color: colors.workout },
  dayTextRest: { color: colors.rest },
  dayName: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  macroRow: { flexDirection: 'row', alignItems: 'center' },
  macroBlock: { flex: 1, alignItems: 'center' },
  macroValue: { fontSize: 28, fontFamily: fonts.extrabold, color: colors.text },
  macroLabel: { fontSize: 12, fontFamily: fonts.semibold, color: colors.textSecondary, marginTop: 2 },
  macroDivider: { width: 1, height: 40, backgroundColor: colors.border },
  note: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.workoutLight,
    borderWidth: 1,
    borderColor: colors.workout + '55',
  },
  workoutRowDone: {
    backgroundColor: '#ECFDF5',
    borderColor: colors.success + '55',
  },
  workoutText: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.text },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  miniStat: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  miniStatText: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  progressLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  progressLinkText: { fontSize: 12, fontWeight: '700', color: colors.primary },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileRecommendation } from '../utils/recommendations';
import { colors, spacing, borderRadius, fonts, cardShadow } from '../constants/theme';

interface Props {
  preview: ProfileRecommendation;
}

export function PlanReadyCard({ preview }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={28} color="#fff" />
        </View>
        <Text style={styles.heroTitle}>Planın hazır!</Text>
        <Text style={styles.heroSub}>Kişisel antrenman ve beslenme rotan oluşturuldu.</Text>
      </View>

      <View style={styles.programCard}>
        <Text style={styles.programLabel}>Başlangıç programın</Text>
        <Text style={styles.programName}>{preview.programName}</Text>
        <Text style={styles.programReason}>{preview.programReason}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Ionicons name="flame-outline" size={18} color={colors.workout} />
          <Text style={styles.statValue}>{preview.nutrition.calories}</Text>
          <Text style={styles.statLabel}>günlük kcal</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="barbell-outline" size={18} color={colors.primary} />
          <Text style={styles.statValue}>{preview.nutrition.protein}g</Text>
          <Text style={styles.statLabel}>protein</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="calendar-outline" size={18} color={colors.secondary} />
          <Text style={styles.statValue}>{preview.workoutDaysPerWeek}</Text>
          <Text style={styles.statLabel}>gün / hafta</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          BMI {preview.bmi} · {preview.bmiLabel}
        </Text>
      </View>

      <Text style={styles.summary}>{preview.summary}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  hero: { alignItems: 'center', paddingVertical: spacing.sm },
  checkCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  heroTitle: { fontSize: 24, fontFamily: fonts.extrabold, color: colors.text },
  heroSub: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 20,
  },
  programCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '33',
  },
  programLabel: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  programName: { fontSize: 20, fontFamily: fonts.extrabold, color: colors.text, marginTop: 4 },
  programReason: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  statsGrid: { flexDirection: 'row', gap: spacing.sm },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    ...cardShadow,
  },
  statValue: { fontSize: 18, fontFamily: fonts.extrabold, color: colors.text, marginTop: 4 },
  statLabel: { fontSize: 10, fontFamily: fonts.semibold, color: colors.textSecondary, marginTop: 2 },
  metaRow: { alignItems: 'center' },
  metaText: { fontSize: 12, fontFamily: fonts.semibold, color: colors.textLight },
  summary: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.text,
    lineHeight: 19,
    textAlign: 'center',
  },
});

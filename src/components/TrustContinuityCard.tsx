import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrustContinuityReport } from '../types/trustContinuity';
import { colors, spacing, borderRadius } from '../constants/theme';

const LEVEL_COLOR: Record<TrustContinuityReport['trustLevel'], string> = {
  baslangic: colors.textSecondary,
  olgunlasiyor: colors.workout,
  guvenilir: colors.primary,
  ornek: colors.secondary,
};

const TONE_COLOR = {
  trust: colors.secondary,
  continuity: colors.primary,
  momentum: colors.workout,
};

interface Props {
  report: TrustContinuityReport;
  compact?: boolean;
}

export function TrustContinuityCard({ report, compact = false }: Props) {
  const levelColor = LEVEL_COLOR[report.trustLevel];

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="shield-outline" size={20} color={levelColor} />
          <View>
            <Text style={styles.kicker}>Güven & Süreklilik</Text>
            <Text style={styles.headline}>{report.headline}</Text>
          </View>
        </View>
        <View style={[styles.scoreRing, { borderColor: levelColor }]}>
          <Text style={[styles.scoreValue, { color: levelColor }]}>{report.consistencyScore}</Text>
          <Text style={styles.scoreLabel}>skor</Text>
        </View>
      </View>

      <Text style={styles.subline}>{report.subline}</Text>

      <View style={styles.levelRow}>
        <View style={[styles.levelBadge, { backgroundColor: levelColor + '22' }]}>
          <Text style={[styles.levelText, { color: levelColor }]}>{report.trustLevelLabel}</Text>
        </View>
        <Text style={styles.adherenceText}>{report.weeklyAdherenceLabel}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${report.weeklyAdherencePct}%`, backgroundColor: levelColor }]} />
      </View>

      <View style={styles.statsRow}>
        <MiniStat icon="calendar-outline" value={String(report.consecutiveActiveWeeks)} label="Aktif hf." />
        <MiniStat icon="scale-outline" value={String(report.weightCheckInWeeks)} label="Tartım hf." />
        <MiniStat icon="flame-outline" value={String(report.workoutStreak)} label="Seri" />
        <MiniStat icon="time-outline" value={String(report.memberDays)} label="Gün" />
      </View>

      {!compact &&
        report.signals.map((signal) => (
          <View key={signal.id} style={styles.signalRow}>
            <Ionicons
              name={signal.icon as keyof typeof Ionicons.glyphMap}
              size={16}
              color={TONE_COLOR[signal.tone]}
            />
            <Text style={styles.signalText}>{signal.text}</Text>
          </View>
        ))}

      {!compact && <Text style={styles.trustNote}>{report.dataTrustNote}</Text>}
    </View>
  );
}

function MiniStat({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.miniStat}>
      <Ionicons name={icon} size={14} color={colors.textSecondary} />
      <Text style={styles.miniValue}>{value}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary + '33',
  },
  cardCompact: { marginHorizontal: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  headerLeft: { flexDirection: 'row', gap: spacing.sm, flex: 1 },
  kicker: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  headline: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 2, lineHeight: 21 },
  scoreRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: { fontSize: 18, fontWeight: '900', lineHeight: 20 },
  scoreLabel: { fontSize: 9, color: colors.textLight, fontWeight: '700' },
  subline: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 17 },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.full },
  levelText: { fontSize: 11, fontWeight: '800' },
  adherenceText: { fontSize: 11, color: colors.textSecondary, flex: 1 },
  progressTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  miniStat: { alignItems: 'center', flex: 1, gap: 2 },
  miniValue: { fontSize: 16, fontWeight: '800', color: colors.text },
  miniLabel: { fontSize: 9, color: colors.textLight, fontWeight: '700' },
  signalRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  signalText: { flex: 1, fontSize: 12, color: colors.text, lineHeight: 17 },
  trustNote: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: spacing.sm,
    lineHeight: 14,
    fontStyle: 'italic',
  },
});

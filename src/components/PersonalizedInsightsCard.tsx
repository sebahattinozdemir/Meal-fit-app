import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { PersonalizedInsight } from '../types/personalization';
import { navigateToMainTab, MainTabRoute } from '../navigation/navigationHelpers';
import { colors, spacing, borderRadius } from '../constants/theme';

const ACCENT = {
  primary: colors.primary,
  workout: colors.workout,
  success: colors.success,
  secondary: colors.secondary,
};

const ACCENT_BG = {
  primary: colors.primaryLight,
  workout: colors.workoutLight,
  success: '#ECFDF5',
  secondary: '#EEF2FF',
};

interface Props {
  insights: PersonalizedInsight[];
}

export function PersonalizedInsightsCard({ insights }: Props) {
  const navigation = useNavigation<any>();

  if (insights.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="sparkles-outline" size={20} color={colors.secondary} />
        <Text style={styles.headerTitle}>Bugün sana özel</Text>
      </View>

      {insights.map((insight, index) => (
        <View
          key={insight.id}
          style={[styles.insightRow, index < insights.length - 1 && styles.insightBorder]}
        >
          <View style={[styles.iconWrap, { backgroundColor: ACCENT_BG[insight.accent] }]}>
            <Ionicons
              name={insight.icon as keyof typeof Ionicons.glyphMap}
              size={18}
              color={ACCENT[insight.accent]}
            />
          </View>
          <View style={styles.insightBody}>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightText}>{insight.body}</Text>
            {insight.actionLabel && insight.actionRoute ? (
              <TouchableOpacity
                onPress={() => navigateToMainTab(navigation, insight.actionRoute as MainTabRoute)}
                hitSlop={8}
              >
                <Text style={styles.action}>{insight.actionLabel} →</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      ))}
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
    borderColor: colors.secondary + '44',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  headerTitle: { fontSize: 13, fontWeight: '800', color: colors.secondary, textTransform: 'uppercase' },
  insightRow: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.sm },
  insightBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightBody: { flex: 1 },
  insightTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
  insightText: { fontSize: 12, color: colors.textSecondary, marginTop: 4, lineHeight: 17 },
  action: { fontSize: 12, fontWeight: '700', color: colors.secondary, marginTop: 6 },
});

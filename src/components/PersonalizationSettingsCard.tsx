import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import {
  COOKING_TIME_OPTIONS,
  DEFAULT_PERSONALIZATION,
  DIET_STYLE_OPTIONS,
  PersonalizationPreferences,
  TRAINING_PLACE_OPTIONS,
} from '../types/personalization';
import { colors, spacing, borderRadius } from '../constants/theme';

export function PersonalizationSettingsCard() {
  const { userProfile, updateProfilePreferences } = useApp();
  const [expanded, setExpanded] = useState(false);

  if (!userProfile) return null;

  const prefs = userProfile.preferences ?? DEFAULT_PERSONALIZATION;

  const setPref = <K extends keyof PersonalizationPreferences>(key: K, value: PersonalizationPreferences[K]) => {
    updateProfilePreferences({ [key]: value });
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded((v) => !v)} activeOpacity={0.85}>
        <View style={styles.headerLeft}>
          <Ionicons name="options-outline" size={22} color={colors.secondary} />
          <View>
            <Text style={styles.title}>Kişiselleştirme</Text>
            <Text style={styles.subtitle}>
              {DIET_STYLE_OPTIONS.find((d) => d.key === prefs.dietStyle)?.label}
              {' · '}
              {TRAINING_PLACE_OPTIONS.find((t) => t.key === prefs.trainingPlace)?.label}
            </Text>
          </View>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          <Text style={styles.sectionLabel}>Beslenme stili</Text>
          <View style={styles.chipRow}>
            {DIET_STYLE_OPTIONS.map((opt) => (
              <Chip
                key={opt.key}
                label={opt.label}
                active={prefs.dietStyle === opt.key}
                onPress={() => setPref('dietStyle', opt.key)}
              />
            ))}
          </View>

          <Text style={styles.sectionLabel}>Hazırlık süresi</Text>
          <View style={styles.chipRow}>
            {COOKING_TIME_OPTIONS.map((opt) => (
              <Chip
                key={opt.key}
                label={opt.label}
                active={prefs.cookingTime === opt.key}
                onPress={() => setPref('cookingTime', opt.key)}
              />
            ))}
          </View>

          <Text style={styles.sectionLabel}>Antrenman yeri</Text>
          <View style={styles.chipRow}>
            {TRAINING_PLACE_OPTIONS.map((opt) => (
              <Chip
                key={opt.key}
                label={opt.label}
                active={prefs.trainingPlace === opt.key}
                onPress={() => setPref('trainingPlace', opt.key)}
              />
            ))}
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Süt ürünlerinden kaçın</Text>
            <Switch
              value={prefs.avoidDairy}
              onValueChange={(v) => setPref('avoidDairy', v)}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={prefs.avoidDairy ? colors.primary : '#f4f4f5'}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Domuz ürünlerinden kaçın</Text>
            <Switch
              value={prefs.avoidPork}
              onValueChange={(v) => setPref('avoidPork', v)}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={prefs.avoidPork ? colors.primary : '#f4f4f5'}
            />
          </View>
        </View>
      )}
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
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
    borderColor: colors.secondary + '33',
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  title: { fontSize: 15, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  body: { marginTop: spacing.md, gap: spacing.sm },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginTop: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  chipText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  chipTextActive: { color: '#fff' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
  },
  toggleLabel: { fontSize: 13, fontWeight: '600', color: colors.text, flex: 1, marginRight: spacing.sm },
});

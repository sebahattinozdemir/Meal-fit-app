import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useSubscription } from '../context/SubscriptionContext';
import { ProLockBadge } from './ProBanner';
import { colors, spacing, borderRadius } from '../constants/theme';

export function ReminderSettingsCard() {
  const {
    reminderSettings,
    setReminderEnabled,
    setReminderOption,
    requestReminderPermission,
    reminderPermission,
    scheduledReminderCount,
  } = useApp();
  const { isPro, canAccess, showPaywall } = useSubscription();

  useEffect(() => {
    if (!isPro && reminderSettings.enabled) {
      setReminderEnabled(false);
    }
  }, [isPro, reminderSettings.enabled, setReminderEnabled]);

  const handleMasterToggle = async (value: boolean) => {
    if (value && !canAccess('smart_reminders')) {
      showPaywall('smart_reminders');
      return;
    }
    if (value) {
      const ok = await requestReminderPermission();
      if (!ok) {
        Alert.alert(
          'Bildirim izni gerekli',
          'Hatırlatmalar için telefon ayarlarından bildirimleri açman gerekiyor.'
        );
        return;
      }
    }
    await setReminderEnabled(value);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="notifications-outline" size={22} color={colors.primary} />
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Akıllı Hatırlatmalar</Text>
              {!isPro && <ProLockBadge small />}
            </View>
            <Text style={styles.subtitle}>
              {!isPro
                ? 'Pro ile spor günü ve tartım bildirimleri'
                : reminderSettings.enabled
                  ? `${scheduledReminderCount} bildirim planlandı`
                  : 'Kapalı'}
              {reminderPermission === 'denied' ? ' · İzin kapalı' : ''}
            </Text>
          </View>
        </View>
        <Switch
          value={reminderSettings.enabled && isPro}
          onValueChange={handleMasterToggle}
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor={reminderSettings.enabled && isPro ? colors.primary : '#f4f4f5'}
        />
      </View>

      {!isPro && (
        <TouchableOpacity style={styles.proUpsell} onPress={() => showPaywall('smart_reminders')}>
          <Ionicons name="diamond-outline" size={16} color={colors.secondary} />
          <Text style={styles.proUpsellText}>Pro&apos;ya geç — otomatik hatırlatmaları aç</Text>
        </TouchableOpacity>
      )}

      {reminderSettings.enabled && isPro && (
        <View style={styles.options}>
          <OptionRow
            icon="sunny-outline"
            label="Spor günü sabahı"
            hint={`${reminderSettings.morningHour}:00 — plan + antrenman`}
            value={reminderSettings.workoutMorning}
            onChange={(v) => setReminderOption('workoutMorning', v)}
          />
          <OptionRow
            icon="moon-outline"
            label="Spor günü akşamı"
            hint={`${reminderSettings.eveningHour}:00 — antrenman kaydı`}
            value={reminderSettings.workoutEvening}
            onChange={(v) => setReminderOption('workoutEvening', v)}
          />
          <OptionRow
            icon="scale-outline"
            label="Haftalık tartım"
            hint="Pazar 09:30 — kilo grafiği"
            value={reminderSettings.weightWeekly}
            onChange={(v) => setReminderOption('weightWeekly', v)}
          />
        </View>
      )}

      {reminderPermission === 'denied' && (
        <TouchableOpacity style={styles.permissionBtn} onPress={() => requestReminderPermission()}>
          <Text style={styles.permissionBtnText}>Bildirim iznini tekrar iste</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function OptionRow({
  icon,
  label,
  hint,
  value,
  onChange,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.optionRow}>
      <Ionicons name={icon} size={18} color={colors.textSecondary} />
      <View style={styles.optionText}>
        <Text style={styles.optionLabel}>{label}</Text>
        <Text style={styles.optionHint}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.primaryLight }}
        thumbColor={value ? colors.primary : '#f4f4f5'}
      />
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 15, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  proUpsell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.secondary + '11',
    borderRadius: borderRadius.md,
  },
  proUpsellText: { fontSize: 12, fontWeight: '700', color: colors.secondary, flex: 1 },
  options: { marginTop: spacing.md, gap: spacing.sm },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  optionText: { flex: 1 },
  optionLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  optionHint: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  permissionBtn: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
  },
  permissionBtnText: { color: colors.primaryDark, fontWeight: '700', fontSize: 13 },
});

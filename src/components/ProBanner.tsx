import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSubscription } from '../context/SubscriptionContext';
import { PRO_PRICE } from '../data/subscription';
import { colors, spacing, borderRadius } from '../constants/theme';

export function ProBanner() {
  const { isPro, showPaywall } = useSubscription();

  if (isPro) {
    return (
      <View style={styles.proActive}>
        <Ionicons name="diamond" size={18} color={colors.primary} />
        <Text style={styles.proActiveText}>Pro aktif — tüm özellikler açık</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={() => showPaywall('general')} activeOpacity={0.9}>
      <LinearGradient
        colors={[colors.secondary, '#4F46E5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.bannerLeft}>
          <Text style={styles.bannerKicker}>PRO</Text>
          <Text style={styles.bannerTitle}>Tüm programlar & tarifler</Text>
          <Text style={styles.bannerSub}>
            {PRO_PRICE.monthly.currency}{PRO_PRICE.monthly.amount}/ay&apos;dan — 7 gün dene
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.9)" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function ProLockBadge({ small }: { small?: boolean }) {
  return (
    <View style={[styles.lockBadge, small && styles.lockBadgeSmall]}>
      <Ionicons name="lock-closed" size={small ? 8 : 10} color="#fff" />
      {!small && <Text style={styles.lockText}>PRO</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  bannerLeft: { flex: 1 },
  bannerKicker: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '800' },
  bannerTitle: { color: '#fff', fontSize: 17, fontWeight: '800', marginTop: 2 },
  bannerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4 },
  proActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary + '44',
  },
  proActiveText: { color: colors.primaryDark, fontWeight: '700', fontSize: 14 },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.secondary,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  lockBadgeSmall: { paddingHorizontal: 5, paddingVertical: 2 },
  lockText: { color: '#fff', fontSize: 9, fontWeight: '800' },
});

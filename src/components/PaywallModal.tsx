import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSubscription, proFeatureLabel } from '../context/SubscriptionContext';
import { ProFeature, FREE_FEATURES, PRO_FEATURES } from '../data/subscription';
import { SubscriptionLegalFooter } from './SubscriptionLegalFooter';
import { colors, spacing, borderRadius } from '../constants/theme';

export function PaywallModal() {
  const insets = useSafeAreaInsets();
  const {
    paywallVisible,
    paywallFeature,
    hidePaywall,
    purchasePro,
    restorePurchases,
    isPro,
    storePrices,
    iapMode,
  } = useSubscription();
  const [loading, setLoading] = useState<'monthly' | 'yearly' | 'restore' | null>(null);

  if (isPro) return null;

  const headline =
    paywallFeature === 'general'
      ? 'Pro ile tüm potansiyelini aç'
      : `${proFeatureLabel(paywallFeature as ProFeature)} — Pro gerekli`;

  const heroSub =
    iapMode === 'mock'
      ? 'Geliştirme modu: satın alma simüle edilir. Mağaza sürümünde gerçek abonelik açılır.'
      : '7 gün ücretsiz dene. Tüm programlar, tarifler ve akıllı hatırlatmalar.';

  const buy = async (plan: 'monthly' | 'yearly') => {
    setLoading(plan);
    try {
      await purchasePro(plan);
    } finally {
      setLoading(null);
    }
  };

  const restore = async () => {
    setLoading('restore');
    try {
      await restorePurchases();
    } finally {
      setLoading(null);
    }
  };

  return (
    <Modal visible={paywallVisible} animationType="slide" transparent onRequestClose={hidePaywall}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
          <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.hero}>
            <TouchableOpacity style={styles.closeBtn} onPress={hidePaywall}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.heroBadge}>PRO</Text>
            <Text style={styles.heroTitle}>{headline}</Text>
            <Text style={styles.heroSub}>{heroSub}</Text>
          </LinearGradient>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Pro&apos;da neler var?</Text>
            {PRO_FEATURES.map((f) => (
              <View key={f.feature} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Ionicons name={f.icon as keyof typeof Ionicons.glyphMap} size={18} color={colors.primary} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureSub}>{f.subtitle}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              </View>
            ))}

            <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Ücretsiz planda</Text>
            {FREE_FEATURES.map((line) => (
              <View key={line} style={styles.freeRow}>
                <Ionicons name="checkmark" size={16} color={colors.textLight} />
                <Text style={styles.freeText}>{line}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.yearlyBtn}
              onPress={() => buy('yearly')}
              disabled={!!loading}
              activeOpacity={0.9}
            >
              {loading === 'yearly' ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceMain}>{storePrices.yearly.priceString.split('/')[0]}</Text>
                    <Text style={styles.pricePeriod}>/{storePrices.yearly.period}</Text>
                    {storePrices.yearly.badge ? (
                      <View style={styles.saveBadge}>
                        <Text style={styles.saveBadgeText}>{storePrices.yearly.badge}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.priceSub}>7 gün ücretsiz dene</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.monthlyBtn}
              onPress={() => buy('monthly')}
              disabled={!!loading}
              activeOpacity={0.85}
            >
              {loading === 'monthly' ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={styles.monthlyText}>Aylık {storePrices.monthly.priceString}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={restore} disabled={!!loading}>
              <Text style={styles.restoreText}>
                {loading === 'restore' ? 'Kontrol ediliyor...' : 'Satın alımı geri yükle'}
              </Text>
            </TouchableOpacity>

            <SubscriptionLegalFooter compact />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '92%',
  },
  hero: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
    fontWeight: '800',
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: spacing.sm, lineHeight: 30 },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: spacing.sm, lineHeight: 18 },
  body: { paddingHorizontal: spacing.lg, maxHeight: 320 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  featureSub: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  freeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 6 },
  freeText: { fontSize: 13, color: colors.textSecondary },
  footer: { padding: spacing.lg, gap: spacing.sm },
  yearlyBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  priceMain: { color: '#fff', fontSize: 28, fontWeight: '800' },
  pricePeriod: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },
  saveBadge: {
    marginLeft: spacing.sm,
    backgroundColor: colors.workoutLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  saveBadgeText: { color: colors.workout, fontSize: 10, fontWeight: '800' },
  priceSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 4 },
  monthlyBtn: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  monthlyText: { color: colors.primary, fontWeight: '800', fontSize: 16 },
  restoreText: { textAlign: 'center', color: colors.textLight, fontSize: 13, fontWeight: '600', marginTop: spacing.xs },
});

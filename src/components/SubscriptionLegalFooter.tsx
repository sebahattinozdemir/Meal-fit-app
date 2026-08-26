import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../constants/theme';
import { openPrivacyPolicy, openTermsOfUse } from '../utils/legalLinks';

type Props = {
  compact?: boolean;
};

export function SubscriptionLegalFooter({ compact }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.text, compact && styles.textCompact]}>
        Pro abonelik otomatik yenilenir. Ücretsiz deneme süresi varsa, süre bitiminde seçtiğiniz plan
        ücretlendirilir. Dönem bitiminden en az 24 saat önce App Store veya Google Play hesabınızdan
        iptal edebilirsiniz. Ödeme, satın alma onayında mağaza hesabınızdan tahsil edilir.
      </Text>
      <View style={styles.links}>
        <TouchableOpacity onPress={openTermsOfUse} hitSlop={8}>
          <Text style={styles.link}>Kullanım koşulları</Text>
        </TouchableOpacity>
        <Text style={styles.sep}>·</Text>
        <TouchableOpacity onPress={openPrivacyPolicy} hitSlop={8}>
          <Text style={styles.link}>Gizlilik politikası</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.sm },
  text: {
    fontSize: 10,
    lineHeight: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  textCompact: { fontSize: 9, lineHeight: 13 },
  links: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  link: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  sep: { fontSize: 10, color: colors.textLight },
});

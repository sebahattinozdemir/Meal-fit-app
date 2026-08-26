import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LEGAL_URLS } from '../constants/store';
import { openLegalUrl } from '../utils/legalLinks';
import { colors, spacing, borderRadius } from '../constants/theme';

export function LegalLinksCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Yasal & destek</Text>
      <Text style={styles.sub}>Abonelik, gizlilik ve kullanım koşulları.</Text>

      <TouchableOpacity
        style={styles.row}
        onPress={() => openLegalUrl(LEGAL_URLS.privacy, 'Gizlilik politikası')}
        activeOpacity={0.85}
      >
        <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
        <Text style={styles.rowText}>Gizlilik politikası</Text>
        <Ionicons name="open-outline" size={16} color={colors.textLight} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={() => openLegalUrl(LEGAL_URLS.terms, 'Kullanım koşulları')}
        activeOpacity={0.85}
      >
        <Ionicons name="document-text-outline" size={18} color={colors.primary} />
        <Text style={styles.rowText}>Kullanım koşulları</Text>
        <Ionicons name="open-outline" size={16} color={colors.textLight} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.row, styles.rowLast]}
        onPress={() => openLegalUrl(`mailto:${LEGAL_URLS.supportEmail}`, 'Destek')}
        activeOpacity={0.85}
      >
        <Ionicons name="mail-outline" size={18} color={colors.primary} />
        <Text style={styles.rowText}>Destek: {LEGAL_URLS.supportEmail}</Text>
        <Ionicons name="open-outline" size={16} color={colors.textLight} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontSize: 15, fontWeight: '800', color: colors.text },
  sub: { fontSize: 12, color: colors.textSecondary, marginTop: 4, lineHeight: 17 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginTop: spacing.xs,
  },
  rowLast: { borderBottomWidth: 0 },
  rowText: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
});

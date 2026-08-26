import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { ProBanner } from '../components/ProBanner';
import { PersonalizationSettingsCard } from '../components/PersonalizationSettingsCard';
import { ReminderSettingsCard } from '../components/ReminderSettingsCard';
import { LegalLinksCard } from '../components/LegalLinksCard';
import { FITNESS_GOAL_LABELS } from '../types/profile';
import { colors, spacing, borderRadius, fonts } from '../constants/theme';

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { isPro } = useSubscription();
  const { userProfile } = useApp();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayarlar</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.profileHero}>
        <ProfileAvatar size={72} editable />
        <Text style={styles.name}>{user?.name || 'Sporcu'}</Text>
        {userProfile ? (
          <Text style={styles.meta}>
            {FITNESS_GOAL_LABELS[userProfile.goal]} • {userProfile.weightKg} kg
          </Text>
        ) : null}
      </View>

      <View style={styles.content}>
        {!isPro ? <ProBanner /> : null}

        <PersonalizationSettingsCard />

        <ReminderSettingsCard />

        <LegalLinksCard />

        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Çıkış yap</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontFamily: fonts.extrabold, color: colors.text },
  profileHero: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  name: { fontSize: 22, fontFamily: fonts.extrabold, color: colors.text, marginTop: spacing.sm },
  meta: { fontSize: 13, color: colors.textSecondary, marginTop: 4, fontFamily: fonts.semibold },
  content: { paddingHorizontal: spacing.lg },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: colors.danger + '33',
  },
  logoutText: { fontSize: 15, fontFamily: fonts.bold, color: colors.danger },
});

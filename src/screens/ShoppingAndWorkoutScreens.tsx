import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { WorkoutSessionScreen } from '../components/WorkoutSessionScreen';
import { WorkoutLogModal } from '../components/WorkoutLogModal';
import { WorkoutHistoryList } from '../components/WorkoutHistoryList';
import { ProgramCatalog } from '../components/ProgramCatalog';
import { DAY_NAMES, ProgramDay, WorkoutProgram } from '../types';
import { toDateKey } from '../utils/date';
import { colors, spacing, borderRadius } from '../constants/theme';

const CATEGORY_LABELS: Record<string, string> = {
  protein: 'Protein Kaynakları',
  sebze: 'Sebze & Meyve',
  tahil: 'Tahıllar',
  sut: 'Süt Ürünleri',
  diger: 'Diğer',
};

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  protein: 'barbell',
  sebze: 'leaf',
  tahil: 'nutrition',
  sut: 'water',
  diger: 'ellipsis-horizontal',
};

export function ShoppingListScreen() {
  const { shoppingList, toggleShoppingItem, generateShoppingList, workoutDays } = useApp();

  const grouped = shoppingList.reduce<Record<string, typeof shoppingList>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const checkedCount = shoppingList.filter((i) => i.checked).length;
  const totalCount = shoppingList.length;
  const progress = totalCount > 0 ? checkedCount / totalCount : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Alışveriş Listesi</Text>
          <Text style={styles.headerSubtitle}>
            {workoutDays.length} spor + {7 - workoutDays.length} dinlenme günü — haftalık miktarlar
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={generateShoppingList}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {checkedCount}/{totalCount} tamamlandı
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Object.entries(grouped).map(([category, items]) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Ionicons
                name={CATEGORY_ICONS[category] || 'list'}
                size={18}
                color={colors.primary}
              />
              <Text style={styles.categoryTitle}>
                {CATEGORY_LABELS[category] || category}
              </Text>
            </View>
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemRow, item.checked && styles.itemRowChecked]}
                onPress={() => toggleShoppingItem(item.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.checked ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={item.checked ? colors.primary : colors.textLight}
                />
                <View style={styles.itemMain}>
                  <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
                    {item.name}
                  </Text>
                  {item.purchaseHint ? (
                    <Text style={[styles.itemHint, item.checked && styles.itemHintChecked]}>
                      {item.purchaseHint}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.itemQuantity}>{item.quantity}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {shoppingList.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>Alışveriş listesi boş</Text>
            <TouchableOpacity style={styles.generateBtn} onPress={generateShoppingList}>
              <Text style={styles.generateBtnText}>Listeyi Oluştur</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export function WorkoutScreen() {
  const {
    workoutDays,
    toggleWorkoutDay,
    isWorkoutDay,
    workoutLogs,
    addWorkoutLog,
    deleteWorkoutLog,
    getWorkoutsThisWeek,
    hasWorkoutLoggedToday,
    getDayType,
    activeProgramId,
    selectProgram,
    clearProgram,
  } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [sessionVisible, setSessionVisible] = useState(false);
  const [sessionTarget, setSessionTarget] = useState<{ program: WorkoutProgram; day: ProgramDay } | null>(null);
  const [tab, setTab] = useState<'log' | 'programs' | 'calendar'>('programs');

  const today = new Date().getDay();
  const isTodayWorkout = getDayType(today) === 'spor';
  const weekWorkouts = getWorkoutsThisWeek();
  const todayLogs = useMemo(
    () => workoutLogs.filter((log) => log.date === toDateKey()),
    [workoutLogs]
  );
  const totalDuration = weekWorkouts.reduce((sum, log) => sum + log.durationMinutes, 0);

  const openLogModal = () => {
    setModalVisible(true);
  };

  const launchWorkoutSession = (program: WorkoutProgram, day: ProgramDay) => {
    Alert.alert(
      'Antrenmana başla',
      `${program.name} — ${day.name}\n\nAntrenman moduna geçilecek. Hazır mısın?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Devam',
          onPress: () => {
            Alert.alert(
              'Son uyarı',
              '3-2-1 geri sayımından sonra antrenman ekranı açılacak. Setler arası dinlenme otomatik başlar.',
              [
                { text: 'Vazgeç', style: 'cancel' },
                {
                  text: 'Antrenmana Başla',
                  onPress: () => {
                    setSessionTarget({ program, day });
                    setSessionVisible(true);
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.workoutHeader}>
          <Text style={styles.workoutTitle}>Antrenman</Text>
          <Text style={styles.workoutSubtitle}>
            Spor günlerinde antrenmanını kaydet, geçmişini takip et.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>{weekWorkouts.length}</Text>
            <Text style={styles.miniStatLabel}>Bu hafta</Text>
          </View>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>{totalDuration}</Text>
            <Text style={styles.miniStatLabel}>Toplam dk</Text>
          </View>
          <View style={styles.miniStat}>
            <Text style={styles.miniStatValue}>{workoutLogs.length}</Text>
            <Text style={styles.miniStatLabel}>Tüm kayıtlar</Text>
          </View>
        </View>

        {isTodayWorkout && (
          <TouchableOpacity style={styles.logCta} onPress={() => openLogModal()} activeOpacity={0.85}>
            <View style={styles.logCtaIcon}>
              <Ionicons name="add-circle" size={28} color="#fff" />
            </View>
            <View style={styles.logCtaText}>
              <Text style={styles.logCtaTitle}>
                {hasWorkoutLoggedToday() ? 'Ek Antrenman Kaydet' : 'Bugün Antrenman Kaydet'}
              </Text>
              <Text style={styles.logCtaSubtitle}>
                {hasWorkoutLoggedToday()
                  ? `${todayLogs.length} kayıt mevcut • yeni ekle`
                  : 'Egzersiz, set ve ağırlık gir'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        )}

        {!isTodayWorkout && (
          <View style={styles.restBanner}>
            <Ionicons name="bed-outline" size={20} color={colors.rest} />
            <Text style={styles.restBannerText}>Bugün dinlenme günü — iyileşme de antrenmanın parçası.</Text>
          </View>
        )}

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'programs' && styles.tabBtnActive]}
            onPress={() => setTab('programs')}
          >
            <Text style={[styles.tabBtnText, tab === 'programs' && styles.tabBtnTextActive]}>Programlar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'log' && styles.tabBtnActive]}
            onPress={() => setTab('log')}
          >
            <Text style={[styles.tabBtnText, tab === 'log' && styles.tabBtnTextActive]}>Geçmiş</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'calendar' && styles.tabBtnActive]}
            onPress={() => setTab('calendar')}
          >
            <Text style={[styles.tabBtnText, tab === 'calendar' && styles.tabBtnTextActive]}>Takvim</Text>
          </TouchableOpacity>
        </View>

        {tab === 'programs' && (
          <ProgramCatalog
            activeProgramId={activeProgramId}
            workoutDays={workoutDays}
            onSelectProgram={selectProgram}
            onClearProgram={clearProgram}
            onStartWorkout={launchWorkoutSession}
          />
        )}

        {tab === 'log' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Antrenman Geçmişi</Text>
            <WorkoutHistoryList
              logs={workoutLogs}
              onDelete={deleteWorkoutLog}
            />
          </View>
        ) : tab === 'calendar' ? (
          <>
            <View style={styles.workoutCountBadgeWrap}>
              <View style={styles.workoutCountBadge}>
                <Ionicons name="barbell" size={16} color={colors.workout} />
                <Text style={styles.workoutCountText}>{workoutDays.length} / 5 gün seçili</Text>
              </View>
            </View>

            <View style={styles.daysGrid}>
              {DAY_NAMES.map((name, index) => {
                const isWorkout = isWorkoutDay(index);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.dayCard, isWorkout && styles.dayCardActive]}
                    onPress={() => toggleWorkoutDay(index)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dayCardName, isWorkout && styles.dayCardNameActive]}>
                      {name}
                    </Text>
                    <View style={[styles.dayCardIcon, isWorkout && styles.dayCardIconActive]}>
                      <Ionicons
                        name={isWorkout ? 'barbell' : 'bed-outline'}
                        size={24}
                        color={isWorkout ? colors.workout : colors.textLight}
                      />
                    </View>
                    <Text style={[styles.dayCardType, isWorkout && styles.dayCardTypeActive]}>
                      {isWorkout ? 'Spor Günü' : 'Dinlenme'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.tipsSection}>
              <Text style={styles.tipsTitle}>Spor Günü Beslenme İpuçları</Text>
              {[
                { icon: 'sunny-outline' as const, text: 'Antrenman öncesi 1-2 saat önce karbonhidrat ağırlıklı öğün tüketin' },
                { icon: 'water-outline' as const, text: 'Günde en az 2-3 litre su için' },
                { icon: 'fitness-outline' as const, text: 'Antrenman sonrası 30 dk içinde protein alın' },
                { icon: 'moon-outline' as const, text: 'Dinlenme günlerinde kalori biraz düşük, protein yüksek tutulur' },
              ].map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <View style={styles.tipIcon}>
                    <Ionicons name={tip.icon} size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.tipText}>{tip.text}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>

      <WorkoutSessionScreen
        visible={sessionVisible}
        program={sessionTarget?.program ?? null}
        day={sessionTarget?.day ?? null}
        onClose={() => {
          setSessionVisible(false);
          setSessionTarget(null);
        }}
        onComplete={addWorkoutLog}
      />

      <WorkoutLogModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={addWorkoutLog}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl + 20,
    backgroundColor: colors.surface,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.text },
  headerSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.surface },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  content: { flex: 1, padding: spacing.lg },
  categorySection: { marginBottom: spacing.lg },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  categoryTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  itemRowChecked: { opacity: 0.6 },
  itemMain: { flex: 1 },
  itemName: { fontSize: 15, color: colors.text, fontWeight: '600' },
  itemNameChecked: { textDecorationLine: 'line-through', color: colors.textLight },
  itemHint: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  itemHintChecked: { textDecorationLine: 'line-through' },
  itemQuantity: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
    minWidth: 72,
    textAlign: 'right',
  },
  emptyState: { alignItems: 'center', paddingTop: spacing.xl * 2 },
  emptyText: { fontSize: 16, color: colors.textLight, marginTop: spacing.md },
  generateBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  generateBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },

  workoutHeader: { padding: spacing.lg, paddingTop: spacing.xl + 20 },
  workoutTitle: { fontSize: 24, fontWeight: '700', color: colors.text },
  workoutSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 20 },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  miniStat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  miniStatValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  miniStatLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  logCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  logCtaIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logCtaText: { flex: 1 },
  logCtaTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  logCtaSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  restBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.restLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  restBannerText: { flex: 1, fontSize: 13, color: colors.rest, lineHeight: 18 },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtn: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: borderRadius.full },
  tabBtnActive: { backgroundColor: colors.primary },
  tabBtnText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  tabBtnTextActive: { color: '#fff' },
  section: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl * 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  workoutCountBadgeWrap: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  workoutCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.workoutLight,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
  },
  workoutCountText: { fontSize: 13, fontWeight: '600', color: colors.workout },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  dayCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  dayCardActive: {
    backgroundColor: colors.workoutLight,
    borderColor: colors.workout,
  },
  dayCardName: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  dayCardNameActive: { color: colors.workout },
  dayCardIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  dayCardIconActive: { backgroundColor: 'rgba(245, 158, 11, 0.2)' },
  dayCardType: { fontSize: 12, color: colors.textLight },
  dayCardTypeActive: { color: colors.workout, fontWeight: '600' },
  tipsSection: {
    margin: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  tipsTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.md },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: { flex: 1, fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
});

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { BarChart, ChartCard, LineChart } from '../components/ProgressCharts';
import {
  getLatestWeight,
  getMonthlyWorkoutCount,
  getTopLiftProgress,
  getWeeklyDurationPoints,
  getWeeklyWorkoutPoints,
  getWeightChartPoints,
  getWeightDelta,
  getWorkoutStreak,
} from '../utils/progressStats';
import { calculateBMI } from '../utils/recommendations';
import { toDateKey } from '../utils/date';
import { colors, spacing, borderRadius } from '../constants/theme';

export function ProgressScreen() {
  const {
    progressEntries,
    addProgressEntry,
    deleteProgressEntry,
    workoutLogs,
    workoutDays,
    userProfile,
  } = useApp();

  const [weightInput, setWeightInput] = useState('');
  const [waistInput, setWaistInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [showForm, setShowForm] = useState(false);

  const weightPoints = useMemo(() => getWeightChartPoints(progressEntries), [progressEntries]);
  const weeklyWorkouts = useMemo(() => getWeeklyWorkoutPoints(workoutLogs), [workoutLogs]);
  const weeklyDuration = useMemo(() => getWeeklyDurationPoints(workoutLogs), [workoutLogs]);
  const weightDelta = useMemo(() => getWeightDelta(progressEntries), [progressEntries]);
  const latestWeight = useMemo(
    () => getLatestWeight(progressEntries, userProfile?.weightKg),
    [progressEntries, userProfile?.weightKg]
  );
  const monthlyWorkouts = useMemo(() => getMonthlyWorkoutCount(workoutLogs), [workoutLogs]);
  const streak = useMemo(() => getWorkoutStreak(workoutLogs, workoutDays), [workoutLogs, workoutDays]);
  const topLifts = useMemo(() => getTopLiftProgress(workoutLogs), [workoutLogs]);

  const bmi =
    latestWeight && userProfile?.heightCm
      ? calculateBMI(latestWeight, userProfile.heightCm)
      : null;

  const handleAddEntry = () => {
    const weight = parseFloat(weightInput.replace(',', '.'));
    const waist = waistInput.trim() ? parseFloat(waistInput.replace(',', '.')) : undefined;

    if (!weight || weight < 30 || weight > 300) {
      Alert.alert('Geçersiz kilo', 'Lütfen 30–300 kg arası geçerli bir değer gir.');
      return;
    }

    if (waist !== undefined && (waist < 40 || waist > 200)) {
      Alert.alert('Geçersiz bel', 'Bel ölçüsü 40–200 cm arasında olmalı.');
      return;
    }

    addProgressEntry({
      date: toDateKey(),
      weightKg: Math.round(weight * 10) / 10,
      waistCm: waist,
      note: noteInput.trim() || undefined,
    });

    setWeightInput('');
    setWaistInput('');
    setNoteInput('');
    setShowForm(false);
  };

  const deltaLabel =
    weightDelta === null
      ? 'İlk ölçümünden itibaren takip başlasın'
      : weightDelta === 0
        ? 'Kilo değişmedi'
        : weightDelta > 0
          ? `+${weightDelta} kg (başlangıca göre)`
          : `${weightDelta} kg (başlangıca göre)`;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gelişim Takibi</Text>
          <Text style={styles.headerSub}>Kilo, antrenman ve güç gelişimini grafiklerle izle</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Ionicons name="scale-outline" size={20} color={colors.secondary} />
            <Text style={styles.summaryValue}>{latestWeight ?? '—'}{latestWeight ? ' kg' : ''}</Text>
            <Text style={styles.summaryLabel}>Güncel kilo</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="barbell-outline" size={20} color={colors.workout} />
            <Text style={styles.summaryValue}>{monthlyWorkouts}</Text>
            <Text style={styles.summaryLabel}>Bu ay antrenman</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="flame-outline" size={20} color={colors.primary} />
            <Text style={styles.summaryValue}>{streak}</Text>
            <Text style={styles.summaryLabel}>Spor günü serisi</Text>
          </View>
        </View>

        {(bmi !== null || weightDelta !== null) && (
          <View style={styles.metaRow}>
            {bmi !== null && (
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>BMI {bmi}</Text>
              </View>
            )}
            <View style={[styles.metaChip, weightDelta !== null && weightDelta < 0 && styles.metaChipGood]}>
              <Text style={styles.metaChipText}>{deltaLabel}</Text>
            </View>
          </View>
        )}

        <ChartCard title="Kilo Grafiği" subtitle={deltaLabel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart points={weightPoints} />
          </ScrollView>
        </ChartCard>

        <ChartCard title="Haftalık Antrenman" subtitle="Son 6 haftadaki kayıt sayısı">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart points={weeklyWorkouts} color={colors.workout} unit="" />
          </ScrollView>
        </ChartCard>

        <ChartCard title="Antrenman Süresi" subtitle="Haftalık toplam dakika">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart points={weeklyDuration} color={colors.primary} unit=" dk" />
          </ScrollView>
        </ChartCard>

        {topLifts.length > 0 && (
          <View style={styles.liftsCard}>
            <Text style={styles.liftsTitle}>En Yüksek Ağırlıklar</Text>
            <Text style={styles.liftsSub}>Antrenman kayıtlarından otomatik hesaplanır</Text>
            {topLifts.map((lift) => (
              <View key={lift.name} style={styles.liftRow}>
                <View style={styles.liftInfo}>
                  <Text style={styles.liftName}>{lift.name}</Text>
                  <Text style={styles.liftMeta}>{lift.sessions} antrenmanda kayıtlı</Text>
                </View>
                <Text style={styles.liftWeight}>{lift.maxWeight} kg</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.formSection}>
          <TouchableOpacity
            style={styles.formToggle}
            onPress={() => setShowForm((v) => !v)}
            activeOpacity={0.85}
          >
            <Ionicons name={showForm ? 'remove-circle-outline' : 'add-circle-outline'} size={22} color={colors.primary} />
            <Text style={styles.formToggleText}>{showForm ? 'Formu gizle' : 'Bugünkü kiloyu ekle'}</Text>
          </TouchableOpacity>

          {showForm && (
            <View style={styles.formCard}>
              <Text style={styles.formLabel}>Kilo (kg) *</Text>
              <TextInput
                style={styles.input}
                value={weightInput}
                onChangeText={setWeightInput}
                placeholder={latestWeight ? String(latestWeight) : '75'}
                placeholderTextColor={colors.textLight}
                keyboardType="decimal-pad"
              />
              <Text style={styles.formLabel}>Bel (cm) — isteğe bağlı</Text>
              <TextInput
                style={styles.input}
                value={waistInput}
                onChangeText={setWaistInput}
                placeholder="82"
                placeholderTextColor={colors.textLight}
                keyboardType="decimal-pad"
              />
              <Text style={styles.formLabel}>Not</Text>
              <TextInput
                style={styles.input}
                value={noteInput}
                onChangeText={setNoteInput}
                placeholder="Sabah aç karnına..."
                placeholderTextColor={colors.textLight}
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddEntry}>
                <Text style={styles.saveBtnText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {progressEntries.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Ölçüm Geçmişi</Text>
            {[...progressEntries]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 8)
              .map((entry) => (
                <View key={entry.id} style={styles.historyRow}>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyDate}>{entry.date}</Text>
                    <Text style={styles.historyWeight}>{entry.weightKg} kg</Text>
                    {entry.waistCm ? (
                      <Text style={styles.historyMeta}>Bel: {entry.waistCm} cm</Text>
                    ) : null}
                    {entry.note ? <Text style={styles.historyNote}>{entry.note}</Text> : null}
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert('Sil', 'Bu ölçümü silmek istiyor musun?', [
                        { text: 'İptal', style: 'cancel' },
                        { text: 'Sil', style: 'destructive', onPress: () => deleteProgressEntry(entry.id) },
                      ])
                    }
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.textLight} />
                  </TouchableOpacity>
                </View>
              ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xl * 2 },
  header: { padding: spacing.lg, paddingTop: spacing.xl + 20 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: colors.text },
  headerSub: { fontSize: 14, color: colors.textSecondary, marginTop: 4, lineHeight: 20 },
  summaryRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.sm },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.sm + 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  summaryValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  summaryLabel: { fontSize: 10, color: colors.textSecondary, textAlign: 'center', fontWeight: '600' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  metaChip: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaChipGood: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  metaChipText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  liftsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  liftsTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  liftsSub: { fontSize: 12, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.sm },
  liftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  liftInfo: { flex: 1 },
  liftName: { fontSize: 14, fontWeight: '700', color: colors.text },
  liftMeta: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  liftWeight: { fontSize: 18, fontWeight: '800', color: colors.workout },
  formSection: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  formToggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  formToggleText: { fontSize: 15, fontWeight: '700', color: colors.primary },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6, marginTop: spacing.sm },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 16,
    color: colors.text,
  },
  saveBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  historySection: { paddingHorizontal: spacing.lg },
  historyTitle: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyInfo: { flex: 1 },
  historyDate: { fontSize: 12, color: colors.textLight, fontWeight: '600' },
  historyWeight: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 2 },
  historyMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  historyNote: { fontSize: 12, color: colors.textSecondary, marginTop: 4, fontStyle: 'italic' },
});

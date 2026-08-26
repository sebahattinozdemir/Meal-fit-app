import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { CustomProgramEditor } from './CustomProgramEditor';
import { WORKOUT_PROGRAMS, getProgramDayForToday } from '../data/workoutPrograms';
import { MAX_CUSTOM_PROGRAMS, validateCustomProgram } from '../utils/customPrograms';
import {
  ProgramDay,
  ProgramGoal,
  PROGRAM_GOAL_LABELS,
  PROGRAM_LEVEL_LABELS,
  WorkoutProgram,
} from '../types';
import { colors, spacing, borderRadius } from '../constants/theme';

const GOAL_FILTERS: { key: ProgramGoal | 'all'; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'kas', label: 'Kas' },
  { key: 'kuvvet', label: 'Kuvvet' },
  { key: 'hipertrofi', label: 'Hipertrofi' },
  { key: 'dayaniklilik', label: 'Dayanıklılık' },
  { key: 'genel', label: 'Genel' },
];

const GOAL_COLORS: Record<ProgramGoal, string> = {
  kas: colors.workout,
  kuvvet: colors.secondary,
  hipertrofi: colors.primary,
  dayaniklilik: colors.rest,
  genel: colors.textSecondary,
};

interface Props {
  activeProgramId: string | null;
  workoutDays: number[];
  onSelectProgram: (id: string) => void;
  onClearProgram: () => void;
  onStartWorkout: (program: WorkoutProgram, day: ProgramDay) => void;
}

export function ProgramCatalog({
  activeProgramId,
  workoutDays,
  onSelectProgram,
  onClearProgram,
  onStartWorkout,
}: Props) {
  const { customPrograms, addCustomProgram, updateCustomProgram } = useApp();
  const [filter, setFilter] = useState<ProgramGoal | 'all'>('all');
  const [detailProgram, setDetailProgram] = useState<WorkoutProgram | null>(null);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingProgram, setEditingProgram] = useState<WorkoutProgram | null>(null);

  const filtered =
    filter === 'all' ? WORKOUT_PROGRAMS : WORKOUT_PROGRAMS.filter((p) => p.goal === filter);

  const today = new Date().getDay();
  const activeProgram = activeProgramId
    ? WORKOUT_PROGRAMS.find((p) => p.id === activeProgramId) ??
      customPrograms.find((p) => p.id === activeProgramId) ??
      null
    : null;
  const todayProgramDay = activeProgram
    ? getProgramDayForToday(activeProgram, workoutDays, today)
    : null;

  const openCreateEditor = () => {
    if (customPrograms.length >= MAX_CUSTOM_PROGRAMS) {
      Alert.alert('Limit', `En fazla ${MAX_CUSTOM_PROGRAMS} özel program oluşturabilirsin.`);
      return;
    }
    setEditingProgram(null);
    setEditorVisible(true);
  };

  const handleEditorSave = (program: WorkoutProgram) => {
    if (editingProgram) {
      if (!updateCustomProgram(program)) {
        Alert.alert('Kaydedilemedi', validateCustomProgram(program).error ?? 'Program güncellenemedi.');
        return;
      }
    } else {
      const id = addCustomProgram(program);
      if (!id) {
        Alert.alert('Kaydedilemedi', validateCustomProgram(program).error ?? 'Program kaydedilemedi.');
        return;
      }
      onSelectProgram(id);
    }
    setEditorVisible(false);
    setEditingProgram(null);
  };

  return (
    <View style={styles.wrap}>
      {activeProgram && (
        <View style={styles.activeBanner}>
          <View style={styles.activeBannerTop}>
            <View>
              <Text style={styles.activeLabel}>Aktif Program</Text>
              <Text style={styles.activeName}>{activeProgram.name}</Text>
            </View>
            <TouchableOpacity onPress={onClearProgram} hitSlop={8}>
              <Ionicons name="close-circle" size={22} color={colors.textLight} />
            </TouchableOpacity>
          </View>
          {todayProgramDay ? (
            <>
              <Text style={styles.todayDay}>
                Bugün: {todayProgramDay.name} — {todayProgramDay.focus}
              </Text>
              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => onStartWorkout(activeProgram, todayProgramDay)}
              >
                <Ionicons name="play-circle" size={20} color="#fff" />
                <Text style={styles.startBtnText}>Programla Antrenman Başlat</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.restNote}>Bugün dinlenme günü — program devam ediyor.</Text>
          )}
        </View>
      )}

      <View style={styles.customSection}>
        <View style={styles.customHeader}>
          <Text style={styles.sectionLabel}>Özel Programlarım</Text>
          <TouchableOpacity style={styles.createBtn} onPress={openCreateEditor}>
            <Ionicons name="add-circle" size={18} color={colors.primary} />
            <Text style={styles.createBtnText}>Yeni</Text>
          </TouchableOpacity>
        </View>
        {customPrograms.length === 0 ? (
          <TouchableOpacity style={styles.emptyCustomCard} onPress={openCreateEditor}>
            <Text style={styles.emptyCustomTitle}>İlk özel programını oluştur</Text>
          </TouchableOpacity>
        ) : (
          customPrograms.map((program) => (
            <TouchableOpacity
              key={program.id}
              style={[styles.card, program.id === activeProgramId && styles.cardActive]}
              onPress={() => setDetailProgram(program)}
            >
              <Text style={styles.cardTitle}>{program.name}</Text>
              <Text style={styles.cardDesc}>{program.description || 'Özel program'}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {GOAL_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.count}>{filtered.length} hazır program</Text>

      {filtered.map((program) => {
        const isActive = program.id === activeProgramId;
        return (
          <TouchableOpacity
            key={program.id}
            style={[styles.card, isActive && styles.cardActive]}
            onPress={() => setDetailProgram(program)}
            activeOpacity={0.85}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.goalBadge, { backgroundColor: GOAL_COLORS[program.goal] + '22' }]}>
                <Text style={[styles.goalText, { color: GOAL_COLORS[program.goal] }]}>
                  {PROGRAM_GOAL_LABELS[program.goal]}
                </Text>
              </View>
              {isActive && (
                <View style={styles.activeTag}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                  <Text style={styles.activeTagText}>Aktif</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardTitle}>{program.name}</Text>
            <Text style={styles.cardDesc} numberOfLines={2}>{program.description}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.metaText}>{program.daysPerWeek} gün/hafta</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="trending-up-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.metaText}>{PROGRAM_LEVEL_LABELS[program.level]}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.metaText}>{program.durationWeeks} hafta</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      <Modal visible={!!detailProgram} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {detailProgram && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{detailProgram.name}</Text>
                  <TouchableOpacity onPress={() => setDetailProgram(null)}>
                    <Ionicons name="close-circle" size={28} color={colors.textLight} />
                  </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalDesc}>{detailProgram.description}</Text>
                  <View style={styles.modalMeta}>
                    <Text style={styles.modalMetaItem}>
                      {PROGRAM_GOAL_LABELS[detailProgram.goal]} • {PROGRAM_LEVEL_LABELS[detailProgram.level]}
                    </Text>
                    <Text style={styles.modalMetaItem}>
                      {detailProgram.daysPerWeek} gün/hafta • {detailProgram.durationWeeks} hafta
                    </Text>
                  </View>

                  {detailProgram.days.map((day) => (
                    <View key={day.id} style={styles.dayBlock}>
                      <Text style={styles.dayName}>{day.name}</Text>
                      <Text style={styles.dayFocus}>{day.focus}</Text>
                      {day.exercises.map((ex, i) => (
                        <View key={i} style={styles.exRow}>
                          <Text style={styles.exName}>{ex.name}</Text>
                          <Text style={styles.exDetail}>
                            {ex.sets}×{ex.reps} • {ex.restSec}s dinlenme
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  style={styles.selectBtn}
                  onPress={() => {
                    onSelectProgram(detailProgram.id);
                    setDetailProgram(null);
                  }}
                >
                  <Ionicons name="checkmark-circle" size={22} color="#fff" />
                  <Text style={styles.selectBtnText}>Bu Programı Seç</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <CustomProgramEditor
        visible={editorVisible}
        initialProgram={editingProgram}
        onClose={() => {
          setEditorVisible(false);
          setEditingProgram(null);
        }}
        onSave={handleEditorSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl * 2 },
  activeBanner: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  activeBannerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  activeLabel: { fontSize: 11, fontWeight: '600', color: colors.primaryDark, textTransform: 'uppercase' },
  activeName: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 2 },
  todayDay: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 18 },
  restNote: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.sm },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    marginTop: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
  },
  startBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  customSection: { marginBottom: spacing.md },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  createBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  createBtnText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  emptyCustomCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyCustomTitle: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  filterRow: { marginBottom: spacing.sm, maxHeight: 40 },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: '#fff' },
  count: { fontSize: 12, color: colors.textLight, marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardActive: { borderColor: colors.primary, borderWidth: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  goalBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.full },
  goalText: { fontSize: 11, fontWeight: '700' },
  activeTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  activeTagText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  cardDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '88%',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  modalTitle: { fontSize: 22, fontWeight: '800', color: colors.text, flex: 1, marginRight: spacing.sm },
  modalDesc: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  modalMeta: { marginTop: spacing.sm, marginBottom: spacing.lg },
  modalMetaItem: { fontSize: 13, color: colors.textLight, marginBottom: 2 },
  dayBlock: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  dayName: { fontSize: 16, fontWeight: '700', color: colors.text },
  dayFocus: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.sm },
  exRow: { marginBottom: spacing.xs },
  exName: { fontSize: 14, fontWeight: '600', color: colors.text },
  exDetail: { fontSize: 12, color: colors.textLight, marginLeft: spacing.sm },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  selectBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EXERCISES_BY_TYPE } from '../data/exercises';
import {
  ProgramDay,
  ProgramExercise,
  ProgramGoal,
  ProgramLevel,
  PROGRAM_GOAL_LABELS,
  PROGRAM_LEVEL_LABELS,
  WorkoutProgram,
} from '../types';
import {
  createCustomProgramTemplate,
  createEmptyExercise,
  createProgramDay,
  validateCustomProgram,
} from '../utils/customPrograms';
import { colors, spacing, borderRadius } from '../constants/theme';

const GOAL_OPTIONS: ProgramGoal[] = ['genel', 'kas', 'kuvvet', 'hipertrofi', 'dayaniklilik'];
const LEVEL_OPTIONS: ProgramLevel[] = ['baslangic', 'orta', 'ileri'];
const EXERCISE_SUGGESTIONS = Object.values(EXERCISES_BY_TYPE).flat();

interface Props {
  visible: boolean;
  initialProgram?: WorkoutProgram | null;
  onClose: () => void;
  onSave: (program: WorkoutProgram) => void;
}

export function CustomProgramEditor({ visible, initialProgram, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<WorkoutProgram>(() => createCustomProgramTemplate());
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  useEffect(() => {
    if (visible) {
      setDraft(
        initialProgram
          ? {
              ...initialProgram,
              days: initialProgram.days.map((d) => ({
                ...d,
                exercises: d.exercises.map((ex) => ({ ...ex })),
              })),
            }
          : createCustomProgramTemplate()
      );
      setActiveDayIndex(0);
    }
  }, [visible, initialProgram]);

  const activeDay = draft.days[activeDayIndex] ?? draft.days[0];

  const updateDraft = (patch: Partial<WorkoutProgram>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const updateDay = (dayIndex: number, patch: Partial<ProgramDay>) => {
    setDraft((prev) => ({
      ...prev,
      days: prev.days.map((day, i) => (i === dayIndex ? { ...day, ...patch } : day)),
      daysPerWeek: prev.days.length,
    }));
  };

  const updateExercise = (dayIndex: number, exIndex: number, patch: Partial<ProgramExercise>) => {
    setDraft((prev) => ({
      ...prev,
      days: prev.days.map((day, i) =>
        i === dayIndex
          ? {
              ...day,
              exercises: day.exercises.map((ex, j) => (j === exIndex ? { ...ex, ...patch } : ex)),
            }
          : day
      ),
    }));
  };

  const addDay = () => {
    if (draft.days.length >= 7) {
      Alert.alert('Limit', 'En fazla 7 antrenman günü ekleyebilirsin.');
      return;
    }
    const next = createProgramDay(`Gün ${draft.days.length + 1}`);
    setDraft((prev) => ({
      ...prev,
      days: [...prev.days, next],
      daysPerWeek: prev.days.length + 1,
    }));
    setActiveDayIndex(draft.days.length);
  };

  const removeDay = (dayIndex: number) => {
    if (draft.days.length <= 1) {
      Alert.alert('En az bir gün', 'Programda en az bir antrenman günü olmalı.');
      return;
    }
    Alert.alert('Günü sil', `"${draft.days[dayIndex].name}" silinsin mi?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          setDraft((prev) => {
            const days = prev.days.filter((_, i) => i !== dayIndex);
            return { ...prev, days, daysPerWeek: days.length };
          });
          setActiveDayIndex((i) => Math.max(0, Math.min(i, draft.days.length - 2)));
        },
      },
    ]);
  };

  const addExercise = (dayIndex: number) => {
    setDraft((prev) => ({
      ...prev,
      days: prev.days.map((day, i) =>
        i === dayIndex ? { ...day, exercises: [...day.exercises, createEmptyExercise()] } : day
      ),
    }));
  };

  const removeExercise = (dayIndex: number, exIndex: number) => {
    const day = draft.days[dayIndex];
    if (day.exercises.length <= 1) {
      Alert.alert('En az bir hareket', 'Her günde en az bir hareket olmalı.');
      return;
    }
    setDraft((prev) => ({
      ...prev,
      days: prev.days.map((d, i) =>
        i === dayIndex ? { ...d, exercises: d.exercises.filter((_, j) => j !== exIndex) } : d
      ),
    }));
  };

  const handleSave = () => {
    const normalized = {
      ...draft,
      daysPerWeek: draft.days.length,
    };
    const validation = validateCustomProgram(normalized);
    if (!validation.valid) {
      Alert.alert('Eksik bilgi', validation.error ?? 'Program kaydedilemedi.');
      return;
    }
    onSave(normalized);
  };

  if (!activeDay) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>{initialProgram ? 'Programı Düzenle' : 'Özel Program Oluştur'}</Text>
              <Text style={styles.subtitle}>Hareketleri, set ve tekrarları kendin belirle</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close-circle" size={28} color={colors.textLight} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Text style={styles.label}>Program adı *</Text>
            <TextInput
              style={styles.input}
              value={draft.name}
              onChangeText={(name) => updateDraft({ name })}
              placeholder="Örn. Push / Pull / Legs"
              placeholderTextColor={colors.textLight}
            />

            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={draft.description}
              onChangeText={(description) => updateDraft({ description })}
              placeholder="Programın amacı veya notların"
              placeholderTextColor={colors.textLight}
              multiline
            />

            <Text style={styles.label}>Hedef</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {GOAL_OPTIONS.map((goal) => (
                <TouchableOpacity
                  key={goal}
                  style={[styles.chip, draft.goal === goal && styles.chipActive]}
                  onPress={() => updateDraft({ goal })}
                >
                  <Text style={[styles.chipText, draft.goal === goal && styles.chipTextActive]}>
                    {PROGRAM_GOAL_LABELS[goal]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Seviye</Text>
            <View style={styles.levelRow}>
              {LEVEL_OPTIONS.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[styles.levelChip, draft.level === level && styles.chipActive]}
                  onPress={() => updateDraft({ level })}
                >
                  <Text style={[styles.chipText, draft.level === level && styles.chipTextActive]}>
                    {PROGRAM_LEVEL_LABELS[level]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Antrenman günleri</Text>
              <TouchableOpacity style={styles.addBtn} onPress={addDay}>
                <Ionicons name="add" size={16} color={colors.primary} />
                <Text style={styles.addBtnText}>Gün ekle</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayTabs}>
              {draft.days.map((day, index) => (
                <TouchableOpacity
                  key={day.id}
                  style={[styles.dayTab, activeDayIndex === index && styles.dayTabActive]}
                  onPress={() => setActiveDayIndex(index)}
                >
                  <Text style={[styles.dayTabText, activeDayIndex === index && styles.dayTabTextActive]}>
                    {day.name || `Gün ${index + 1}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.dayCard}>
              <View style={styles.dayCardHeader}>
                <Text style={styles.dayCardTitle}>{activeDay.name || `Gün ${activeDayIndex + 1}`}</Text>
                <TouchableOpacity onPress={() => removeDay(activeDayIndex)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={18} color={colors.textLight} />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Gün adı</Text>
              <TextInput
                style={styles.input}
                value={activeDay.name}
                onChangeText={(name) => updateDay(activeDayIndex, { name })}
                placeholder="Örn. Üst vücut"
                placeholderTextColor={colors.textLight}
              />

              <Text style={styles.label}>Odak / not</Text>
              <TextInput
                style={styles.input}
                value={activeDay.focus}
                onChangeText={(focus) => updateDay(activeDayIndex, { focus })}
                placeholder="Örn. Göğüs + triceps"
                placeholderTextColor={colors.textLight}
              />

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Hareketler</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => addExercise(activeDayIndex)}>
                  <Ionicons name="add" size={16} color={colors.primary} />
                  <Text style={styles.addBtnText}>Hareket ekle</Text>
                </TouchableOpacity>
              </View>

              {activeDay.exercises.map((exercise, exIndex) => (
                <View key={`${activeDay.id}-${exIndex}`} style={styles.exerciseCard}>
                  <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseIndex}>#{exIndex + 1}</Text>
                    <TouchableOpacity onPress={() => removeExercise(activeDayIndex, exIndex)} hitSlop={8}>
                      <Ionicons name="close-circle-outline" size={18} color={colors.textLight} />
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    style={styles.input}
                    value={exercise.name}
                    onChangeText={(name) => updateExercise(activeDayIndex, exIndex, { name })}
                    placeholder="Hareket adı"
                    placeholderTextColor={colors.textLight}
                  />

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestRow}>
                    {EXERCISE_SUGGESTIONS.slice(0, 8).map((name) => (
                      <TouchableOpacity
                        key={`${exIndex}-${name}`}
                        style={styles.suggestChip}
                        onPress={() => updateExercise(activeDayIndex, exIndex, { name })}
                      >
                        <Text style={styles.suggestChipText}>{name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <View style={styles.exerciseMetaRow}>
                    <View style={styles.metaField}>
                      <Text style={styles.metaLabel}>Set</Text>
                      <TextInput
                        style={styles.metaInput}
                        value={String(exercise.sets)}
                        onChangeText={(v) => {
                          const sets = parseInt(v.replace(/\D/g, ''), 10);
                          if (!Number.isNaN(sets)) updateExercise(activeDayIndex, exIndex, { sets });
                        }}
                        keyboardType="number-pad"
                      />
                    </View>
                    <View style={styles.metaField}>
                      <Text style={styles.metaLabel}>Tekrar</Text>
                      <TextInput
                        style={styles.metaInput}
                        value={exercise.reps}
                        onChangeText={(reps) => updateExercise(activeDayIndex, exIndex, { reps })}
                        placeholder="10"
                        placeholderTextColor={colors.textLight}
                      />
                    </View>
                    <View style={styles.metaField}>
                      <Text style={styles.metaLabel}>Dinlenme (sn)</Text>
                      <TextInput
                        style={styles.metaInput}
                        value={String(exercise.restSec)}
                        onChangeText={(v) => {
                          const restSec = parseInt(v.replace(/\D/g, ''), 10);
                          if (!Number.isNaN(restSec)) updateExercise(activeDayIndex, exIndex, { restSec });
                        }}
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text style={styles.saveBtnText}>{initialProgram ? 'Değişiklikleri Kaydet' : 'Programı Kaydet'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  headerText: { flex: 1, marginRight: spacing.sm },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  content: { paddingBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 6, marginTop: spacing.sm },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: colors.text,
  },
  inputMultiline: { minHeight: 72, textAlignVertical: 'top' },
  chipRow: { marginBottom: spacing.xs, maxHeight: 42 },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  chipTextActive: { color: '#fff' },
  levelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  levelChip: {
    flex: 1,
    minWidth: 90,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  dayTabs: { marginBottom: spacing.sm, maxHeight: 42 },
  dayTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  dayTabActive: { backgroundColor: colors.workoutLight, borderColor: colors.workout },
  dayTabText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  dayTabTextActive: { color: colors.workout },
  dayCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  dayCardTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  exerciseCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  exerciseIndex: { fontSize: 12, fontWeight: '800', color: colors.textLight },
  suggestRow: { marginTop: spacing.xs, marginBottom: spacing.sm, maxHeight: 34 },
  suggestChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
  },
  suggestChipText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  exerciseMetaRow: { flexDirection: 'row', gap: spacing.sm },
  metaField: { flex: 1 },
  metaLabel: { fontSize: 11, fontWeight: '600', color: colors.textLight, marginBottom: 4 },
  metaInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

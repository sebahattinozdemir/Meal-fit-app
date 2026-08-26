import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EXERCISES_BY_TYPE, WORKOUT_TYPES, WorkoutType } from '../data/exercises';
import { NewWorkoutLog } from '../context/AppContext';
import { ExerciseLog, ExerciseSet, ProgramDay, WorkoutProgram } from '../types';
import { colors, spacing, borderRadius } from '../constants/theme';
import { toDateKey } from '../utils/date';

interface WorkoutTemplate {
  type: string;
  durationMinutes: number;
  exercises: ExerciseLog[];
  notes?: string;
  programId?: string;
  programDayId?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (log: NewWorkoutLog) => void;
  template?: WorkoutTemplate | null;
}

function parseReps(reps: string): number {
  const match = reps.match(/\d+/);
  return match ? parseInt(match[0], 10) : 10;
}

function buildFromProgram(program: WorkoutProgram, day: ProgramDay): WorkoutTemplate {
  return {
    type: `${program.name} — ${day.name}`,
    durationMinutes: 55,
    programId: program.id,
    programDayId: day.id,
    notes: day.focus,
    exercises: day.exercises.map((ex, i) => ({
      id: `tpl-${i}-${Date.now()}`,
      name: ex.name,
      sets: Array.from({ length: ex.sets }, () => ({
        reps: parseReps(ex.reps),
        weight: 0,
      })),
    })),
  };
}

export { buildFromProgram };
export type { WorkoutTemplate };

function createExercise(name: string): ExerciseLog {
  return {
    id: `ex-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    name,
    sets: [{ reps: 10, weight: 0 }],
  };
}

export function WorkoutLogModal({ visible, onClose, onSave, template }: Props) {
  const [type, setType] = useState<WorkoutType>('Full Body');
  const [customType, setCustomType] = useState('');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<ExerciseLog[]>([]);
  const [programMeta, setProgramMeta] = useState<{ programId?: string; programDayId?: string }>({});

  useEffect(() => {
    if (visible) {
      if (template) {
        setCustomType(template.type);
        setDuration(String(template.durationMinutes));
        setNotes(template.notes || '');
        setExercises(template.exercises);
        setProgramMeta({ programId: template.programId, programDayId: template.programDayId });
      } else {
        setType('Full Body');
        setCustomType('');
        setDuration('60');
        setNotes('');
        setExercises([createExercise(EXERCISES_BY_TYPE['Full Body'][0])]);
        setProgramMeta({});
      }
    }
  }, [visible, template]);

  const handleTypeChange = (nextType: WorkoutType) => {
    setType(nextType);
    if (exercises.length === 0) {
      setExercises([createExercise(EXERCISES_BY_TYPE[nextType][0])]);
    }
  };

  const addExercise = (name: string) => {
    if (exercises.some((e) => e.name === name)) return;
    setExercises((prev) => [...prev, createExercise(name)]);
  };

  const removeExercise = (id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  const updateSet = (exerciseId: string, setIndex: number, field: keyof ExerciseSet, value: string) => {
    const num = parseInt(value, 10) || 0;
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set, i) =>
                i === setIndex ? { ...set, [field]: num } : set
              ),
            }
          : ex
      )
    );
  };

  const addSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: [...ex.sets, { ...ex.sets[ex.sets.length - 1] }] }
          : ex
      )
    );
  };

  const handleSave = () => {
    if (exercises.length === 0) {
      Alert.alert('Eksik bilgi', 'En az bir egzersiz ekleyin.');
      return;
    }
    onSave({
      date: toDateKey(),
      type: customType || type,
      durationMinutes: parseInt(duration, 10) || 0,
      exercises,
      notes: notes.trim() || undefined,
      programId: programMeta.programId,
      programDayId: programMeta.programDayId,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Antrenman Kaydet</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={28} color={colors.textLight} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
            <Text style={styles.label}>Antrenman Türü</Text>
            {template ? (
              <View style={styles.programTypeBanner}>
                <Ionicons name="document-text" size={18} color={colors.primary} />
                <Text style={styles.programTypeText}>{customType}</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow}>
                {WORKOUT_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeChip, type === t && styles.typeChipActive]}
                    onPress={() => handleTypeChange(t)}
                  >
                    <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <Text style={styles.label}>Süre (dakika)</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
              placeholder="60"
              placeholderTextColor={colors.textLight}
            />

            <Text style={styles.label}>Hızlı Egzersiz Ekle</Text>
            <View style={styles.quickExercises}>
              {EXERCISES_BY_TYPE[type].map((name) => (
                <TouchableOpacity key={name} style={styles.quickChip} onPress={() => addExercise(name)}>
                  <Ionicons name="add" size={14} color={colors.primary} />
                  <Text style={styles.quickChipText}>{name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Egzersizler</Text>
            {exercises.map((exercise) => (
              <View key={exercise.id} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <TouchableOpacity onPress={() => removeExercise(exercise.id)}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
                {exercise.sets.map((set, index) => (
                  <View key={index} style={styles.setRow}>
                    <Text style={styles.setLabel}>Set {index + 1}</Text>
                    <TextInput
                      style={styles.setInput}
                      value={String(set.reps)}
                      onChangeText={(v) => updateSet(exercise.id, index, 'reps', v)}
                      keyboardType="number-pad"
                      placeholder="Tekrar"
                    />
                    <Text style={styles.setX}>×</Text>
                    <TextInput
                      style={styles.setInput}
                      value={String(set.weight)}
                      onChangeText={(v) => updateSet(exercise.id, index, 'weight', v)}
                      keyboardType="number-pad"
                      placeholder="kg"
                    />
                    <Text style={styles.kgLabel}>kg</Text>
                  </View>
                ))}
                <TouchableOpacity style={styles.addSetBtn} onPress={() => addSet(exercise.id)}>
                  <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
                  <Text style={styles.addSetText}>Set ekle</Text>
                </TouchableOpacity>
              </View>
            ))}

            <Text style={styles.label}>Notlar (opsiyonel)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Nasıl geçti? PR kırdın mı?"
              placeholderTextColor={colors.textLight}
              multiline
            />
          </ScrollView>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text style={styles.saveBtnText}>Antrenmanı Kaydet</Text>
          </TouchableOpacity>
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
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  scroll: { paddingHorizontal: spacing.lg },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  typeRow: { marginBottom: spacing.xs },
  programTypeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  programTypeText: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.primaryDark },
  typeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipActive: { backgroundColor: colors.workoutLight, borderColor: colors.workout },
  typeChipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  typeChipTextActive: { color: colors.workout },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notesInput: { minHeight: 80, textAlignVertical: 'top' },
  quickExercises: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  quickChipText: { fontSize: 12, color: colors.primaryDark, fontWeight: '500' },
  exerciseCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  exerciseName: { fontSize: 15, fontWeight: '600', color: colors.text },
  setLabel: { width: 42, fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  setRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs, gap: 6 },
  setInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  setX: { color: colors.textLight, fontWeight: '600' },
  kgLabel: { fontSize: 12, color: colors.textSecondary, width: 20 },
  addSetBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  addSetText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

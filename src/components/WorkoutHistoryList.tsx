import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutLog } from '../types';
import { formatWorkoutDate } from '../utils/date';
import { colors, spacing, borderRadius } from '../constants/theme';

interface Props {
  logs: WorkoutLog[];
  onDelete: (id: string) => void;
  emptyMessage?: string;
}

export function WorkoutHistoryList({ logs, onDelete, emptyMessage }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (logs.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="barbell-outline" size={40} color={colors.textLight} />
        <Text style={styles.emptyText}>
          {emptyMessage || 'Henüz antrenman kaydı yok. İlk antrenmanını kaydet!'}
        </Text>
      </View>
    );
  }

  const confirmDelete = (log: WorkoutLog) => {
    Alert.alert(
      'Kaydı Sil',
      `${log.type} antrenmanını silmek istediğine emin misin?`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => onDelete(log.id) },
      ]
    );
  };

  return (
    <View>
      {logs.map((log) => {
        const expanded = expandedId === log.id;
        const totalSets = log.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
        return (
          <TouchableOpacity
            key={log.id}
            style={styles.card}
            onPress={() => setExpandedId(expanded ? null : log.id)}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={styles.typeBadge}>
                <Ionicons name="barbell" size={14} color={colors.workout} />
                <Text style={styles.typeText}>{log.type}</Text>
              </View>
              <TouchableOpacity onPress={() => confirmDelete(log)} hitSlop={8}>
                <Ionicons name="trash-outline" size={18} color={colors.textLight} />
              </TouchableOpacity>
            </View>
            <Text style={styles.dateText}>{formatWorkoutDate(log.date)}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.metaText}>{log.durationMinutes} dk</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="fitness-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.metaText}>{log.exercises.length} egzersiz</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="layers-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.metaText}>{totalSets} set</Text>
              </View>
            </View>

            {expanded && (
              <View style={styles.details}>
                {log.exercises.map((exercise) => (
                  <View key={exercise.id} style={styles.exerciseBlock}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    {exercise.sets.map((set, i) => (
                      <Text key={i} style={styles.setDetail}>
                        Set {i + 1}: {set.reps} tekrar × {set.weight} kg
                      </Text>
                    ))}
                  </View>
                ))}
                {log.notes ? <Text style={styles.notes}>Not: {log.notes}</Text> : null}
              </View>
            )}

            <Text style={styles.expandHint}>{expanded ? 'Detayı gizle' : 'Detayı gör'}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  emptyText: { fontSize: 14, color: colors.textLight, textAlign: 'center', paddingHorizontal: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.workoutLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  typeText: { fontSize: 13, fontWeight: '700', color: colors.workout },
  dateText: { fontSize: 15, fontWeight: '600', color: colors.text, marginTop: spacing.sm },
  metaRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.textSecondary },
  details: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  exerciseBlock: { marginBottom: spacing.sm },
  exerciseName: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 },
  setDetail: { fontSize: 13, color: colors.textSecondary, marginLeft: spacing.sm },
  notes: { fontSize: 13, color: colors.textSecondary, fontStyle: 'italic', marginTop: spacing.sm },
  expandHint: { fontSize: 11, color: colors.primary, fontWeight: '600', marginTop: spacing.sm, textAlign: 'right' },
});

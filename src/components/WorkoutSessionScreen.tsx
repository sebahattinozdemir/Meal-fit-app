import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NewWorkoutLog } from '../context/AppContext';
import { ProgramDay, WorkoutProgram } from '../types';
import {
  BUILTIN_DEFAULT_REST_SEC,
  CompletedSetRecord,
  WorkoutSessionStep,
  buildExerciseLogsFromSession,
  buildSessionSteps,
  getUpcomingStep,
  parseTargetReps,
} from '../utils/workoutSession';
import { isCustomProgramId } from '../utils/customPrograms';
import { colors, spacing, borderRadius } from '../constants/theme';
import { toDateKey } from '../utils/date';

type SessionPhase = 'countdown' | 'active' | 'rest' | 'complete';

interface Props {
  visible: boolean;
  program: WorkoutProgram | null;
  day: ProgramDay | null;
  onClose: () => void;
  onComplete: (log: NewWorkoutLog) => void;
}

export function WorkoutSessionScreen({ visible, program, day, onClose, onComplete }: Props) {
  const [phase, setPhase] = useState<SessionPhase>('countdown');
  const [countdownValue, setCountdownValue] = useState<number | 'GO'>(3);
  const [stepIndex, setStepIndex] = useState(0);
  const [restRemaining, setRestRemaining] = useState(0);
  const [completedSets, setCompletedSets] = useState<CompletedSetRecord[]>([]);
  const [repsInput, setRepsInput] = useState('10');
  const [weightInput, setWeightInput] = useState('0');
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const pulse = useRef(new Animated.Value(0.6)).current;
  const restProgress = useRef(new Animated.Value(1)).current;

  const steps = useMemo(
    () => (program && day ? buildSessionSteps(program, day) : []),
    [program, day]
  );
  const currentStep = steps[stepIndex] ?? null;
  const upcomingStep = currentStep ? getUpcomingStep(steps, stepIndex) : null;

  const resetSession = useCallback(() => {
    setPhase('countdown');
    setCountdownValue(3);
    setStepIndex(0);
    setRestRemaining(0);
    setCompletedSets([]);
    setRepsInput('10');
    setWeightInput('0');
    setStartedAt(null);
    pulse.setValue(0.6);
    restProgress.setValue(1);
  }, [pulse, restProgress]);

  useEffect(() => {
    if (!visible) {
      resetSession();
    }
  }, [visible, resetSession]);

  useEffect(() => {
    if (!visible || phase !== 'countdown') return;

    const sequence = [
      { value: 3 as const, delay: 900 },
      { value: 2 as const, delay: 900 },
      { value: 1 as const, delay: 900 },
      { value: 'GO' as const, delay: 700 },
    ];

    let index = 0;
    setCountdownValue(sequence[0].value);

    const runPulse = () => {
      pulse.setValue(0.5);
      Animated.timing(pulse, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }).start();
    };

    runPulse();

    const timers: ReturnType<typeof setTimeout>[] = [];
    sequence.forEach((item, i) => {
      if (i === 0) return;
      timers.push(
        setTimeout(() => {
          setCountdownValue(item.value);
          runPulse();
          if (item.value === 'GO') {
            timers.push(
              setTimeout(() => {
                setStartedAt(Date.now());
                setPhase('active');
              }, item.delay)
            );
          }
        }, sequence.slice(0, i).reduce((sum, s) => sum + s.delay, 0))
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [visible, phase, pulse]);

  useEffect(() => {
    if (!currentStep || phase !== 'active') return;
    const lastSameExercise = [...completedSets]
      .reverse()
      .find((set) => set.exerciseIndex === currentStep.exerciseIndex);
    setRepsInput(String(lastSameExercise?.reps ?? parseTargetReps(currentStep.targetReps)));
    setWeightInput(String(lastSameExercise?.weight ?? 0));
  }, [stepIndex, phase, currentStep, completedSets]);

  useEffect(() => {
    if (phase !== 'rest' || restRemaining <= 0) return;

    restProgress.setValue(1);
    Animated.timing(restProgress, {
      toValue: 0,
      duration: restRemaining * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    const timer = setInterval(() => {
      setRestRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStepIndex((i) => i + 1);
          setPhase('active');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, restRemaining, restProgress]);

  const handleClose = () => {
    if (phase === 'complete') {
      onClose();
      return;
    }
    Alert.alert('Antrenmanı bitir', 'Antrenman modundan çıkmak istiyor musun? İlerleme kaydedilmez.', [
      { text: 'Devam et', style: 'cancel' },
      { text: 'Çık', style: 'destructive', onPress: onClose },
    ]);
  };

  const completeCurrentSet = () => {
    if (!currentStep || !program || !day) return;

    const reps = parseInt(repsInput, 10);
    const weight = parseFloat(weightInput.replace(',', '.'));
    if (!reps || reps < 1) {
      Alert.alert('Geçersiz tekrar', 'Lütfen geçerli bir tekrar sayısı gir.');
      return;
    }
    if (Number.isNaN(weight) || weight < 0) {
      Alert.alert('Geçersiz ağırlık', 'Lütfen geçerli bir ağırlık gir.');
      return;
    }

    const record: CompletedSetRecord = {
      exerciseIndex: currentStep.exerciseIndex,
      exerciseName: currentStep.exerciseName,
      setNumber: currentStep.setNumber,
      reps,
      weight: Math.round(weight * 10) / 10,
    };

    const nextCompleted = [...completedSets, record];
    setCompletedSets(nextCompleted);

    if (currentStep.isLastStep) {
      setPhase('complete');
      return;
    }

    setRestRemaining(currentStep.restAfterSec);
    setPhase('rest');
  };

  const skipRest = () => {
    setRestRemaining(0);
    restProgress.stopAnimation();
    setStepIndex((i) => i + 1);
    setPhase('active');
  };

  const handleSave = () => {
    if (!program || !day) return;
    const exercises = buildExerciseLogsFromSession(steps, completedSets);
    const durationMinutes = startedAt
      ? Math.max(1, Math.round((Date.now() - startedAt) / 60000))
      : 45;

    onComplete({
      date: toDateKey(),
      type: `${program.name} — ${day.name}`,
      durationMinutes,
      exercises,
      notes: day.focus || undefined,
      programId: program.id,
      programDayId: day.id,
    });
    onClose();
  };

  if (!program || !day || steps.length === 0) return null;

  const scale = pulse.interpolate({
    inputRange: [0.5, 1],
    outputRange: [0.82, 1],
  });

  const restBarWidth = restProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const restHint = isCustomProgramId(program.id)
    ? 'Özel programındaki dinlenme süresi kullanılıyor'
    : `Hazır programlarda varsayılan ${BUILTIN_DEFAULT_REST_SEC} sn dinlenme`;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleClose} hitSlop={8}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.topBarCenter}>
            <Text style={styles.topBarTitle}>{program.name}</Text>
            <Text style={styles.topBarSub}>{day.name}</Text>
          </View>
          <Text style={styles.topBarProgress}>
            {phase === 'complete' ? 'Bitti' : `${Math.min(stepIndex + 1, steps.length)}/${steps.length}`}
          </Text>
        </View>

        {phase === 'countdown' && (
          <View style={styles.countdownWrap}>
            <Text style={styles.countdownLabel}>Hazırlan</Text>
            <Animated.Text style={[styles.countdownNumber, { transform: [{ scale }] }]}>
              {countdownValue}
            </Animated.Text>
          </View>
        )}

        {phase === 'active' && currentStep && (
          <View style={styles.activeWrap}>
            <View style={styles.currentCard}>
              <Text style={styles.currentLabel}>Şu an</Text>
              <Text style={styles.currentExercise}>{currentStep.exerciseName}</Text>
              <Text style={styles.currentSetMeta}>
                Set {currentStep.setNumber}/{currentStep.totalSets} • Hedef {currentStep.targetReps} tekrar
              </Text>
            </View>

            {upcomingStep && (
              <View style={styles.upcomingCard}>
                <Text style={styles.upcomingLabel}>Sıradaki</Text>
                <Text style={styles.upcomingExercise}>{upcomingStep.exerciseName}</Text>
                <Text style={styles.upcomingMeta}>
                  Set {upcomingStep.setNumber}/{upcomingStep.totalSets} • {upcomingStep.targetReps} tekrar
                </Text>
              </View>
            )}

            <View style={styles.inputRow}>
              <View style={styles.inputBlock}>
                <Text style={styles.inputLabel}>Tekrar</Text>
                <TextInput
                  style={styles.input}
                  value={repsInput}
                  onChangeText={setRepsInput}
                  keyboardType="number-pad"
                  placeholderTextColor={colors.textLight}
                />
              </View>
              <View style={styles.inputBlock}>
                <Text style={styles.inputLabel}>Ağırlık (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={weightInput}
                  onChangeText={setWeightInput}
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.textLight}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={completeCurrentSet} activeOpacity={0.9}>
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={styles.primaryBtnText}>Seti Tamamla</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'rest' && currentStep && (
          <View style={styles.restWrap}>
            <Text style={styles.restTitle}>Dinlen</Text>
            <Text style={styles.restSeconds}>{restRemaining}</Text>
            <Text style={styles.restUnit}>saniye</Text>

            <View style={styles.restBarTrack}>
              <Animated.View style={[styles.restBarFill, { width: restBarWidth }]} />
            </View>

            <Text style={styles.restHint}>{restHint}</Text>

            {upcomingStep && (
              <View style={styles.upcomingCardLarge}>
                <Text style={styles.upcomingLabel}>Sıradaki hareket</Text>
                <Text style={styles.upcomingExercise}>{upcomingStep.exerciseName}</Text>
                <Text style={styles.upcomingMeta}>
                  Set {upcomingStep.setNumber}/{upcomingStep.totalSets} • {upcomingStep.targetReps} tekrar
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.secondaryBtn} onPress={skipRest}>
              <Text style={styles.secondaryBtnText}>Dinlenmeyi atla</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase === 'complete' && (
          <View style={styles.completeWrap}>
            <Ionicons name="trophy" size={56} color={colors.secondary} />
            <Text style={styles.completeTitle}>Antrenman tamamlandı</Text>
            <Text style={styles.completeSub}>
              {completedSets.length} set kaydedildi • {day.exercises.length} hareket
            </Text>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSave}>
              <Ionicons name="save-outline" size={22} color="#fff" />
              <Text style={styles.primaryBtnText}>Antrenmanı Kaydet</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.xl + 16,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  topBarCenter: { flex: 1, alignItems: 'center' },
  topBarTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  topBarSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
  topBarProgress: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '700', minWidth: 48, textAlign: 'right' },
  countdownWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  countdownLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 16, fontWeight: '600', marginBottom: spacing.lg },
  countdownNumber: { color: '#fff', fontSize: 120, fontWeight: '900' },
  activeWrap: { flex: 1, padding: spacing.lg, justifyContent: 'center', gap: spacing.md },
  currentCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  currentLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  currentExercise: { color: '#fff', fontSize: 30, fontWeight: '900', marginTop: spacing.xs },
  currentSetMeta: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: spacing.sm, fontWeight: '600' },
  upcomingCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  upcomingCardLarge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    width: '100%',
    marginTop: spacing.lg,
  },
  upcomingLabel: { color: colors.secondary, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  upcomingExercise: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 4 },
  upcomingMeta: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 4, fontWeight: '600' },
  inputRow: { flexDirection: 'row', gap: spacing.sm },
  inputBlock: { flex: 1 },
  inputLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  restWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  restTitle: { color: 'rgba(255,255,255,0.75)', fontSize: 16, fontWeight: '700' },
  restSeconds: { color: '#fff', fontSize: 96, fontWeight: '900', marginTop: spacing.sm },
  restUnit: { color: 'rgba(255,255,255,0.65)', fontSize: 18, fontWeight: '600' },
  restBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginTop: spacing.lg,
  },
  restBarFill: { height: '100%', backgroundColor: colors.secondary },
  restHint: { color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: spacing.md, textAlign: 'center' },
  secondaryBtn: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  secondaryBtnText: { color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: '700' },
  completeWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.sm },
  completeTitle: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: spacing.md },
  completeSub: { color: 'rgba(255,255,255,0.65)', fontSize: 14, textAlign: 'center', marginBottom: spacing.lg },
});

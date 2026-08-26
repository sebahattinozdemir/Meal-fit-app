import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { EXPERIENCE_OPTIONS } from '../data/programPath';
import { ExperienceLevel } from '../data/programPath';
import {
  FITNESS_GOAL_DESCRIPTIONS,
  FITNESS_GOAL_LABELS,
  FitnessGoal,
  UserProfile,
} from '../types/profile';
import { DEFAULT_PERSONALIZATION } from '../types/personalization';
import { buildRecommendations } from '../utils/recommendations';
import { colors, spacing, borderRadius } from '../constants/theme';

const GOALS: FitnessGoal[] = ['kilo_verme', 'kas_kazanma', 'kuvvet', 'genel_form'];

export function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [age, setAge] = useState('');
  const [goal, setGoal] = useState<FitnessGoal | null>(null);
  const [experience, setExperience] = useState<ExperienceLevel | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const draftProfile = useMemo((): UserProfile | null => {
    const h = parseInt(heightCm, 10);
    const w = parseInt(weightKg, 10);
    const a = parseInt(age, 10);
    if (!h || !w || !a || !goal || !experience) return null;
    return {
      heightCm: h,
      weightKg: w,
      age: a,
      goal,
      experienceLevel: experience,
      preferences: DEFAULT_PERSONALIZATION,
      onboardingComplete: true,
      updatedAt: new Date().toISOString(),
    };
  }, [heightCm, weightKg, age, goal, experience]);

  const preview = draftProfile ? buildRecommendations(draftProfile) : null;

  const validateStep = (): string | null => {
    if (step === 0) {
      const h = parseInt(heightCm, 10);
      const w = parseInt(weightKg, 10);
      const a = parseInt(age, 10);
      if (!h || h < 120 || h > 230) return 'Boy 120–230 cm arasında olmalı.';
      if (!w || w < 35 || w > 250) return 'Kilo 35–250 kg arasında olmalı.';
      if (!a || a < 14 || a > 80) return 'Yaş 14–80 arasında olmalı.';
    }
    if (step === 1 && !goal) return 'Bir hedef seç.';
    if (step === 2 && !experience) return 'Deneyim seviyeni seç.';
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) {
      Alert.alert('Eksik bilgi', err);
      return;
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const finish = async () => {
    if (!draftProfile) {
      Alert.alert('Eksik bilgi', 'Tüm alanları doldur.');
      return;
    }
    setSubmitting(true);
    try {
      await completeOnboarding(draftProfile);
    } catch {
      Alert.alert('Hata', 'Profil kaydedilemedi, tekrar dene.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.lg }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.kicker}>Hoş geldin</Text>
          <Text style={styles.title}>Sana özel plan oluşturalım</Text>
          <Text style={styles.subtitle}>
            Boy, kilo ve hedefinle antrenman ile beslenme önerilerini kişiselleştireceğiz.
          </Text>

          <View style={styles.steps}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.stepDot, i <= step && styles.stepDotActive]} />
            ))}
          </View>

          <View style={styles.card}>
            {step === 0 && (
              <>
                <Text style={styles.cardTitle}>Vücut bilgilerin</Text>
                <Field label="Boy (cm)" value={heightCm} onChangeText={setHeightCm} placeholder="175" keyboardType="number-pad" />
                <Field label="Kilo (kg)" value={weightKg} onChangeText={setWeightKg} placeholder="75" keyboardType="number-pad" />
                <Field label="Yaş" value={age} onChangeText={setAge} placeholder="28" keyboardType="number-pad" />
              </>
            )}

            {step === 1 && (
              <>
                <Text style={styles.cardTitle}>Hedefin ne?</Text>
                {GOALS.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.option, goal === g && styles.optionActive]}
                    onPress={() => setGoal(g)}
                  >
                    <Text style={[styles.optionTitle, goal === g && styles.optionTitleActive]}>
                      {FITNESS_GOAL_LABELS[g]}
                    </Text>
                    <Text style={[styles.optionSub, goal === g && styles.optionSubActive]}>
                      {FITNESS_GOAL_DESCRIPTIONS[g]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {step === 2 && (
              <>
                <Text style={styles.cardTitle}>Spor geçmişin</Text>
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.option, experience === opt.key && styles.optionActive]}
                    onPress={() => setExperience(opt.key)}
                  >
                    <Text style={[styles.optionTitle, experience === opt.key && styles.optionTitleActive]}>
                      {opt.label}
                    </Text>
                    <Text style={[styles.optionSub, experience === opt.key && styles.optionSubActive]}>
                      {opt.subtitle}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {step === 3 && preview && (
              <>
                <Text style={styles.cardTitle}>Senin için öneriler</Text>
                <View style={styles.resultBox}>
                  <Text style={styles.resultLine}>
                    BMI: <Text style={styles.resultBold}>{preview.bmi}</Text> ({preview.bmiLabel})
                  </Text>
                  <Text style={styles.resultLine}>
                    Günlük hedef: <Text style={styles.resultBold}>{preview.nutrition.calories} kcal</Text>
                    {' • '}
                    <Text style={styles.resultBold}>{preview.nutrition.protein}g protein</Text>
                  </Text>
                  <Text style={styles.resultLine}>
                    Antrenman: <Text style={styles.resultBold}>{preview.programName}</Text>
                  </Text>
                  <Text style={styles.resultReason}>{preview.programReason}</Text>
                  <Text style={styles.resultSummary}>{preview.summary}</Text>
                </View>
              </>
            )}

            <View style={styles.actions}>
              {step > 0 && (
                <TouchableOpacity style={styles.backBtn} onPress={() => setStep((s) => s - 1)}>
                  <Text style={styles.backBtnText}>Geri</Text>
                </TouchableOpacity>
              )}
              {step < 3 ? (
                <TouchableOpacity style={styles.nextBtn} onPress={next}>
                  <Text style={styles.nextBtnText}>Devam</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.nextBtn} onPress={finish} disabled={submitting}>
                  <Text style={styles.nextBtnText}>{submitting ? 'Kaydediliyor…' : 'Planımı Başlat'}</Text>
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: 'number-pad' | 'default';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl * 2 },
  kicker: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: spacing.xs },
  subtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 20, marginTop: spacing.sm },
  steps: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.md },
  stepDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)' },
  stepDotActive: { backgroundColor: '#fff' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  field: { marginBottom: spacing.md },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  option: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  optionTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  optionTitleActive: { color: colors.primaryDark },
  optionSub: { fontSize: 12, color: colors.textSecondary, marginTop: 4, lineHeight: 17 },
  optionSubActive: { color: colors.primaryDark },
  resultBox: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultLine: { fontSize: 14, color: colors.text, marginBottom: spacing.sm, lineHeight: 20 },
  resultBold: { fontWeight: '800', color: colors.primary },
  resultReason: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: spacing.sm },
  resultSummary: { fontSize: 13, color: colors.text, lineHeight: 19, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  backBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backBtnText: { fontSize: 15, fontWeight: '700', color: colors.textSecondary },
  nextBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

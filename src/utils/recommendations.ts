import { ExperienceLevel } from '../data/programPath';
import { WORKOUT_PROGRAMS } from '../data/workoutPrograms';
import { FitnessGoal, UserProfile } from '../types/profile';
import { PersonalizationPreferences } from '../types/personalization';
import { normalizePreferences } from './personalization';

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  note: string;
}

export interface ProfileRecommendation {
  bmi: number;
  bmiLabel: string;
  programId: string;
  programName: string;
  programReason: string;
  workoutDaysPerWeek: number;
  nutrition: NutritionTargets;
  summary: string;
}

function round(n: number): number {
  return Math.round(n);
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const h = heightCm / 100;
  return Math.round((weightKg / (h * h)) * 10) / 10;
}

export function getBMILabel(bmi: number): string {
  if (bmi < 18.5) return 'Zayıf';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Fazla Kilolu';
  return 'Obez';
}

function estimateBMR(weightKg: number, heightCm: number, age: number): number {
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 78;
}

function activityFactor(experience: ExperienceLevel): number {
  if (experience === 'hic') return 1.375;
  if (experience === 'alti_ay') return 1.45;
  return 1.55;
}

function goalCalorieAdjust(goal: FitnessGoal, isWorkoutDay: boolean): number {
  const base =
    goal === 'kilo_verme' ? -350 : goal === 'kas_kazanma' ? 300 : goal === 'kuvvet' ? 200 : 0;
  return base + (isWorkoutDay ? 150 : 0);
}

function proteinPerKg(goal: FitnessGoal): number {
  if (goal === 'kas_kazanma') return 2.1;
  if (goal === 'kuvvet') return 2.0;
  if (goal === 'kilo_verme') return 1.8;
  return 1.6;
}

export function getNutritionTargets(
  profile: UserProfile,
  isWorkoutDay: boolean
): NutritionTargets {
  const bmr = estimateBMR(profile.weightKg, profile.heightCm, profile.age);
  const tdee = bmr * activityFactor(profile.experienceLevel);
  let calories = round(tdee + goalCalorieAdjust(profile.goal, isWorkoutDay));
  let protein = round(profile.weightKg * proteinPerKg(profile.goal));
  let fat = round((calories * 0.25) / 9);
  let carbs = round((calories - protein * 4 - fat * 9) / 4);

  const prefs = profile.preferences ? normalizePreferences(profile.preferences) : null;
  if (prefs?.dietStyle === 'yuksek_protein') {
    protein = round(profile.weightKg * 2.2);
  }
  if (prefs?.dietStyle === 'dusuk_karb') {
    carbs = round(carbs * 0.75);
    fat = round((calories - protein * 4 - carbs * 4) / 9);
  }

  const notes: Record<FitnessGoal, string> = {
    kilo_verme: 'Hafif kalori açığı — protein yüksek tutuldu',
    kas_kazanma: 'Kas kazanımı için kalori fazlası',
    kuvvet: 'Kuvvet için yeterli enerji ve protein',
    genel_form: 'Dengeli beslenme hedefi',
  };

  return {
    calories,
    protein,
    carbs: Math.max(carbs, 0),
    fat: Math.max(fat, 0),
    note: prefs?.dietStyle === 'vejetaryen'
      ? 'Vejetaryen tercih — bitkisel protein kaynaklarına odaklan'
      : prefs?.dietStyle === 'yuksek_protein'
        ? 'Yüksek protein tercihin uygulandı'
        : prefs?.dietStyle === 'dusuk_karb'
          ? 'Düşük karbonhidrat tercihin uygulandı'
          : notes[profile.goal],
  };
}

function pickProgram(
  goal: FitnessGoal,
  experience: ExperienceLevel,
  prefs?: PersonalizationPreferences
): { id: string; reason: string } {
  const p = normalizePreferences(prefs);

  if (p.trainingPlace === 'ev') {
    if (goal === 'kilo_verme' || experience === 'hic') {
      return { id: 'kvk-aletsiz', reason: 'Ev profilin için aletsiz, yağ yakımına uygun program' };
    }
    return { id: 'kvk-evde-dambil', reason: 'Evde dambıl ile sürdürülebilir antrenman' };
  }

  if (p.trainingPlace === 'karma' && (goal === 'genel_form' || goal === 'kilo_verme')) {
    return { id: 'kvk-evde-dambil', reason: 'Karma profil — evde başlayıp salona geçişe uygun' };
  }

  if (goal === 'kilo_verme') {
    if (experience === 'hic') {
      return { id: 'kvk-aletsiz', reason: 'Başlangıç için düşük ekipmanlı, yağ yakımına uygun tempo' };
    }
    return { id: 'kvk-yeni-baslayan', reason: 'Düzenli full-body antrenman metabolizmayı destekler' };
  }

  if (goal === 'kuvvet') {
    if (experience === 'hic' || experience === 'alti_ay') {
      return { id: 'kvk-stronglifts', reason: 'Temel bileşik hareketlerle kuvvet artışı' };
    }
    if (experience === 'bir_yil') {
      return { id: 'kvk-madcow', reason: '1 yıl deneyim için progresif kuvvet programı' };
    }
    return { id: 'kvk-dogan-kuvvet', reason: 'İleri seviye kuvvet bloğu' };
  }

  if (goal === 'kas_kazanma') {
    if (experience === 'hic' || experience === 'alti_ay') {
      return { id: 'kvk-stronglifts', reason: 'Önce kuvvet tabanı, sonra hacim' };
    }
    if (experience === 'bir_yil') {
      return { id: 'kvk-dogan-hipertrofi', reason: 'Hipertrofi odaklı split program' };
    }
    return { id: 'kvk-5x5-hacim', reason: 'İleri seviye hacim programı' };
  }

  // genel_form
  if (experience === 'hic') {
    return { id: 'kvk-yeni-baslayan', reason: 'Sıfırdan güvenli ve dengeli başlangıç' };
  }
  if (experience === 'alti_ay') {
    return { id: 'kvk-evde-dambil', reason: 'Esnek, sürdürülebilir antrenman' };
  }
  return { id: 'kvk-madcow', reason: 'Dengeli kuvvet ve form gelişimi' };
}

export function recommendWorkoutDays(goal: FitnessGoal): number {
  if (goal === 'kilo_verme') return 3;
  if (goal === 'kas_kazanma') return 4;
  if (goal === 'kuvvet') return 3;
  return 3;
}

export function buildRecommendations(profile: UserProfile): ProfileRecommendation {
  const bmi = calculateBMI(profile.weightKg, profile.heightCm);
  const bmiLabel = getBMILabel(bmi);
  const pick = pickProgram(profile.goal, profile.experienceLevel, profile.preferences);
  const program = WORKOUT_PROGRAMS.find((p) => p.id === pick.id)!;
  const nutrition = getNutritionTargets(profile, true);
  const workoutDays = recommendWorkoutDays(profile.goal);

  const summary =
    profile.goal === 'kilo_verme'
      ? `BMI ${bmi} (${bmiLabel}). Haftada ${workoutDays} gün antrenman ve günlük ~${nutrition.calories} kcal hedefiyle yağ kaybını destekle.`
      : profile.goal === 'kas_kazanma'
        ? `BMI ${bmi} (${bmiLabel}). ${program.name} ile haftada ${workoutDays} gün, günde ${nutrition.protein}g protein hedefle.`
        : profile.goal === 'kuvvet'
          ? `BMI ${bmi} (${bmiLabel}). ${program.name} programı kuvvet gelişimin için uygun.`
          : `BMI ${bmi} (${bmiLabel}). Dengeli program ve ~${nutrition.calories} kcal ile formunu koru.`;

  return {
    bmi,
    bmiLabel,
    programId: program.id,
    programName: program.name,
    programReason: pick.reason,
    workoutDaysPerWeek: workoutDays,
    nutrition,
    summary,
  };
}

import { CatalogMeal, MEAL_CATALOG } from '../data/mealCatalog';
import { restDayPlan, workoutDayPlan } from '../data/meals';
import { HOME_PROGRAM_IDS } from '../data/programPath';
import { DayType, Meal, MealType } from '../types';
import {
  DEFAULT_PERSONALIZATION,
  MacroAlignment,
  PersonalizationPreferences,
  PersonalizedInsight,
  ScoredMeal,
} from '../types/personalization';
import { FitnessGoal, UserProfile } from '../types/profile';
import { BodyProgressEntry } from '../types/progress';
import { NutritionTargets, getNutritionTargets } from './recommendations';
import { getWeightDelta, sortProgressEntries } from './progressStats';

const MEAT_KEYWORDS = ['tavuk', 'hindi', 'somon', 'levrek', 'köfte', 'ton', 'balık', 'et', 'kıyma', 'dana'];
const DAIRY_KEYWORDS = ['peynir', 'süt', 'yoğurt', 'kefir', 'cottage', 'ayran', 'labne'];
const PORK_KEYWORDS = ['domuz', 'bacon', 'jambon', 'sucuk'];

const MEAL_TYPES: MealType[] = ['kahvalti', 'ogle', 'aksam', 'araOgun'];

export function normalizePreferences(
  prefs?: Partial<PersonalizationPreferences> | null
): PersonalizationPreferences {
  return { ...DEFAULT_PERSONALIZATION, ...prefs };
}

export function normalizeProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    preferences: normalizePreferences(profile.preferences),
  };
}

function maxPrepMinutes(cookingTime: PersonalizationPreferences['cookingTime']): number {
  if (cookingTime === 'hizli') return 15;
  if (cookingTime === 'normal') return 25;
  return 999;
}

function ingredientText(meal: CatalogMeal | Meal): string {
  return meal.ingredients.map((i) => i.name.toLowerCase()).join(' ');
}

export function mealViolatesPreferences(
  meal: CatalogMeal | Meal,
  prefs: PersonalizationPreferences
): boolean {
  const text = ingredientText(meal);

  if (prefs.avoidPork && PORK_KEYWORDS.some((k) => text.includes(k))) return true;
  if (prefs.avoidDairy && DAIRY_KEYWORDS.some((k) => text.includes(k))) return true;

  if (prefs.dietStyle === 'vejetaryen' && MEAT_KEYWORDS.some((k) => text.includes(k))) {
    return true;
  }

  return false;
}

function dayPlanMeals(dayType: DayType): Record<MealType, Meal> {
  return (dayType === 'spor' ? workoutDayPlan : restDayPlan).meals;
}

export function getMacroAlignment(profile: UserProfile, dayType: DayType): MacroAlignment | null {
  const targets = getNutritionTargets(profile, dayType === 'spor');
  const meals = dayPlanMeals(dayType);
  const totals = MEAL_TYPES.reduce(
    (acc, type) => ({
      calories: acc.calories + meals[type].calories,
      protein: acc.protein + meals[type].protein,
      carbs: acc.carbs + meals[type].carbs,
      fat: acc.fat + meals[type].fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const proteinGap = targets.protein - totals.protein;
  const calorieGap = targets.calories - totals.calories;
  const proteinFit = 1 - Math.min(1, Math.abs(proteinGap) / Math.max(targets.protein, 1));
  const calorieFit = 1 - Math.min(1, Math.abs(calorieGap) / Math.max(targets.calories, 1));
  const fitScore = Math.round((proteinFit * 0.55 + calorieFit * 0.45) * 100);

  let summary = 'Planın makro hedeflerinle uyumlu görünüyor.';
  if (proteinGap > 8) {
    summary = `Planda protein hedefinin ${proteinGap}g altındasın — ekstra proteinli ara öğün ekle.`;
  } else if (proteinGap < -10) {
    summary = 'Plan protein açısından hedefin üzerinde — kas kazanımı için avantajlı.';
  } else if (calorieGap > 150 && profile.goal === 'kilo_verme') {
    summary = `Kalori hedefinin ${calorieGap} kcal üzerindesin — porsiyonları biraz küçült.`;
  } else if (calorieGap < -150 && profile.goal === 'kas_kazanma') {
    summary = `Kalori hedefinin ${Math.abs(calorieGap)} kcal altındasın — ek atıştırmalık ekle.`;
  }

  return {
    ...totals,
    targetCalories: targets.calories,
    targetProtein: targets.protein,
    proteinGap,
    calorieGap,
    fitScore,
    summary,
  };
}

function scoreMeal(
  meal: CatalogMeal,
  profile: UserProfile,
  targets: NutritionTargets,
  dayType: DayType
): { score: number; reason: string } {
  const prefs = normalizePreferences(profile.preferences);
  if (mealViolatesPreferences(meal, prefs)) return { score: -1, reason: '' };

  let score = 50;
  const reasons: string[] = [];

  if (meal.dayTypes.includes(dayType)) {
    score += 12;
    reasons.push(dayType === 'spor' ? 'Spor gününe uygun' : 'Dinlenme gününe uygun');
  }

  if (meal.prepTime <= maxPrepMinutes(prefs.cookingTime)) {
    score += 10;
    if (prefs.cookingTime === 'hizli') reasons.push('Hızlı hazırlık');
  } else {
    score -= 15;
  }

  const perMealProtein = targets.protein / 4;
  if (prefs.dietStyle === 'yuksek_protein' || profile.goal === 'kas_kazanma') {
    if (meal.protein >= perMealProtein * 1.1) {
      score += 18;
      reasons.push('Yüksek protein');
    }
  }

  if (prefs.dietStyle === 'dusuk_karb' || profile.goal === 'kilo_verme') {
    if (meal.carbs <= 35) {
      score += 14;
      reasons.push('Düşük karbonhidrat');
    }
    if (meal.calories <= 450) {
      score += 8;
    }
  }

  if (prefs.dietStyle === 'vejetaryen') {
    score += 10;
    reasons.push('Vejetaryen');
  }

  if (profile.goal === 'kuvvet' && meal.protein >= 28) {
    score += 8;
    reasons.push('Kuvvet için protein');
  }

  if (meal.tags.includes('Plan')) score += 6;

  const reason = reasons.slice(0, 2).join(' · ') || 'Profiline uygun tarif';
  return { score, reason };
}

export function getPersonalizedMealPicks(
  profile: UserProfile,
  dayType: DayType,
  limit = 4
): ScoredMeal[] {
  const targets = getNutritionTargets(profile, dayType === 'spor');

  return MEAL_CATALOG.map((meal) => {
    const { score, reason } = scoreMeal(meal, profile, targets, dayType);
    return { mealId: meal.id, score, reason };
  })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export interface InsightContext {
  profile: UserProfile;
  dayType: DayType;
  isWorkoutDay: boolean;
  loggedWorkoutToday: boolean;
  workoutsThisWeek: number;
  progressEntries: BodyProgressEntry[];
  activeProgramName?: string | null;
}

export function getPersonalizedInsights(ctx: InsightContext): PersonalizedInsight[] {
  const { profile, dayType, isWorkoutDay, loggedWorkoutToday, workoutsThisWeek, progressEntries } = ctx;
  const prefs = normalizePreferences(profile.preferences);
  const insights: PersonalizedInsight[] = [];
  const alignment = getMacroAlignment(profile, dayType);
  const weightDelta = getWeightDelta(sortProgressEntries(progressEntries));

  if (isWorkoutDay && !loggedWorkoutToday) {
    insights.push({
      id: 'log-workout',
      icon: 'barbell-outline',
      accent: 'workout',
      title: 'Bugün spor günü',
      body:
        profile.goal === 'kuvvet'
          ? 'Ağırlık artışı hedefin için antrenmanı kaydetmeyi unutma — ilerleme hikayen buna bağlı.'
          : 'Antrenmanını kaydettiğinde hem grafiklerin hem hikayen güncellenir.',
      actionLabel: 'Antrenmana git',
      actionRoute: 'Spor',
    });
  }

  if (alignment) {
    if (alignment.proteinGap > 8) {
      insights.push({
        id: 'protein-gap',
        icon: 'nutrition-outline',
        accent: 'primary',
        title: `Protein hedefi: ${alignment.targetProtein}g`,
        body: alignment.summary,
        actionLabel: 'Tariflere bak',
        actionRoute: 'Yemekler',
      });
    } else if (alignment.fitScore >= 85) {
      insights.push({
        id: 'macro-fit',
        icon: 'checkmark-circle-outline',
        accent: 'success',
        title: `Plan uyumu %${alignment.fitScore}`,
        body: alignment.summary,
      });
    }
  }

  if (weightDelta !== null && profile.goal === 'kilo_verme' && weightDelta > 0.5) {
    insights.push({
      id: 'weight-up',
      icon: 'trending-up-outline',
      accent: 'secondary',
      title: 'Kilo trendi yukarı',
      body: `Başlangıca göre +${weightDelta} kg. Akşam karbonhidratını hafiflet, protein hedefini koru.`,
      actionLabel: 'Tartım ekle',
      actionRoute: 'Gelisim',
    });
  }

  if (weightDelta !== null && profile.goal === 'kas_kazanma' && weightDelta < -0.5) {
    insights.push({
      id: 'weight-down',
      icon: 'trending-down-outline',
      accent: 'secondary',
      title: 'Kilo düşüş trendi',
      body: `${Math.abs(weightDelta)} kg geride. Kas kazanımında kalori ve protein hedefini aşmayı hedefle.`,
      actionLabel: 'Gelişimi gör',
      actionRoute: 'Gelisim',
    });
  }

  if (workoutsThisWeek === 0 && isWorkoutDay) {
    insights.push({
      id: 'week-start',
      icon: 'calendar-outline',
      accent: 'primary',
      title: 'Haftanın ilk antrenmanı',
      body: 'Bu hafta henüz kayıt yok — bugün iyi bir başlangıç olabilir.',
      actionLabel: 'Programa git',
      actionRoute: 'Spor',
    });
  }

  if (prefs.trainingPlace === 'ev') {
    insights.push({
      id: 'home-training',
      icon: 'home-outline',
      accent: 'secondary',
      title: 'Ev antrenmanı modu',
      body: 'Aletsiz ve dambıl programları profiline göre önceliklendirildi.',
      actionLabel: 'Programları gör',
      actionRoute: 'Spor',
    });
  }

  if (prefs.cookingTime === 'hizli') {
    const quickCount = MEAL_CATALOG.filter(
      (m) => m.prepTime <= 15 && !mealViolatesPreferences(m, prefs)
    ).length;
    insights.push({
      id: 'quick-meals',
      icon: 'timer-outline',
      accent: 'primary',
      title: `${quickCount} hızlı tarif`,
      body: '15 dakika altı tarifler senin için üst sıralarda gösteriliyor.',
      actionLabel: 'Tariflere git',
      actionRoute: 'Yemekler',
    });
  }

  if (prefs.dietStyle === 'vejetaryen') {
    insights.push({
      id: 'vegetarian',
      icon: 'leaf-outline',
      accent: 'success',
      title: 'Vejetaryen filtre aktif',
      body: 'Et ve balık içeren tarifler önerilerden çıkarıldı.',
      actionLabel: 'Uygun tarifler',
      actionRoute: 'Yemekler',
    });
  }

  if (ctx.activeProgramName) {
    insights.push({
      id: 'active-program',
      icon: 'fitness-outline',
      accent: 'workout',
      title: `Aktif: ${ctx.activeProgramName}`,
      body:
        profile.goal === 'kuvvet'
          ? 'Her antrenmanda en az bir bileşik harekette ilerlemeyi hedefle.'
          : 'Programına sadık kalmak, kişisel planın en güçlü parçası.',
      actionLabel: 'Antrenman kaydı',
      actionRoute: 'Spor',
    });
  }

  return insights.slice(0, 4);
}

export function programMatchesPreferences(
  programId: string,
  prefs: PersonalizationPreferences
): boolean {
  if (prefs.trainingPlace === 'salon') return !HOME_PROGRAM_IDS.includes(programId);
  if (prefs.trainingPlace === 'ev') return HOME_PROGRAM_IDS.includes(programId);
  return true;
}

export function preferenceProgramNote(profile: UserProfile): string | null {
  const prefs = normalizePreferences(profile.preferences);
  if (prefs.trainingPlace === 'ev') return 'Ev / aletsiz programlar profiline göre öncelikli';
  if (prefs.dietStyle === 'yuksek_protein') return 'Protein hedefin kas koruma ve tokluk için yükseltildi';
  if (prefs.dietStyle === 'dusuk_karb') return 'Karbonhidrat hedefin hafifletildi — düşük karb tercihin';
  if (prefs.dietStyle === 'vejetaryen') return 'Vejetaryen tarifler ve et içermeyen öğünler öncelikli';
  return null;
}

export function adjustNutritionForPreferences(
  targets: NutritionTargets,
  profile: UserProfile
): NutritionTargets {
  const prefs = normalizePreferences(profile.preferences);
  let { calories, protein, carbs, fat, note } = targets;

  if (prefs.dietStyle === 'yuksek_protein') {
    protein = Math.round(profile.weightKg * 2.2);
    note = 'Yüksek protein tercihin — hedef artırıldı';
  }

  if (prefs.dietStyle === 'dusuk_karb') {
    carbs = Math.round(carbs * 0.75);
    fat = Math.round((calories - protein * 4 - carbs * 4) / 9);
    note = 'Düşük karbonhidrat tercihin uygulandı';
  }

  if (prefs.dietStyle === 'vejetaryen') {
    note = 'Vejetaryen beslenme — bitkisel protein kaynaklarına odaklan';
  }

  return { calories, protein, carbs: Math.max(carbs, 0), fat: Math.max(fat, 0), note };
}

export function goalLabel(goal: FitnessGoal): string {
  const map: Record<FitnessGoal, string> = {
    kilo_verme: 'kilo verme',
    kas_kazanma: 'kas kazanma',
    kuvvet: 'kuvvet',
    genel_form: 'form',
  };
  return map[goal];
}

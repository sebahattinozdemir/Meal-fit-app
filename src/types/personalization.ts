export type DietStyle = 'dengeli' | 'yuksek_protein' | 'dusuk_karb' | 'vejetaryen';
export type CookingTimePref = 'hizli' | 'normal' | 'uzun';
export type TrainingPlace = 'salon' | 'ev' | 'karma';

export interface PersonalizationPreferences {
  dietStyle: DietStyle;
  cookingTime: CookingTimePref;
  trainingPlace: TrainingPlace;
  avoidDairy: boolean;
  avoidPork: boolean;
}

export const DEFAULT_PERSONALIZATION: PersonalizationPreferences = {
  dietStyle: 'dengeli',
  cookingTime: 'normal',
  trainingPlace: 'salon',
  avoidDairy: false,
  avoidPork: false,
};

export const DIET_STYLE_OPTIONS: { key: DietStyle; label: string; subtitle: string }[] = [
  { key: 'dengeli', label: 'Dengeli', subtitle: 'Standart makro dağılımı' },
  { key: 'yuksek_protein', label: 'Yüksek protein', subtitle: 'Kas koruma ve tokluk odaklı' },
  { key: 'dusuk_karb', label: 'Düşük karbonhidrat', subtitle: 'Daha hafif öğünler' },
  { key: 'vejetaryen', label: 'Vejetaryen', subtitle: 'Et/balık içermeyen tarifler' },
];

export const COOKING_TIME_OPTIONS: { key: CookingTimePref; label: string; subtitle: string }[] = [
  { key: 'hizli', label: 'Hızlı (≤15 dk)', subtitle: 'Pratik tarifler' },
  { key: 'normal', label: 'Normal (≤25 dk)', subtitle: 'Dengeli hazırlık süresi' },
  { key: 'uzun', label: 'Fark etmez', subtitle: 'Lezzet öncelikli' },
];

export const TRAINING_PLACE_OPTIONS: { key: TrainingPlace; label: string; subtitle: string }[] = [
  { key: 'salon', label: 'Salon', subtitle: 'Ağırlık ve makine odaklı' },
  { key: 'ev', label: 'Ev', subtitle: 'Aletsiz / dambıl programları' },
  { key: 'karma', label: 'Karma', subtitle: 'Salon + ev birlikte' },
];

export interface PersonalizedInsight {
  id: string;
  icon: string;
  accent: 'primary' | 'workout' | 'secondary' | 'success';
  title: string;
  body: string;
  actionLabel?: string;
  actionRoute?: 'Spor' | 'Yemekler' | 'Gelisim';
}

export interface MacroAlignment {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  targetCalories: number;
  targetProtein: number;
  proteinGap: number;
  calorieGap: number;
  fitScore: number;
  summary: string;
}

export interface ScoredMeal {
  mealId: string;
  score: number;
  reason: string;
}

export type MealType = 'kahvalti' | 'ogle' | 'aksam' | 'araOgun';

export type DayType = 'spor' | 'dinlenme';

export type IngredientUnit =
  | 'g'
  | 'kg'
  | 'ml'
  | 'L'
  | 'adet'
  | 'dilim'
  | 'yemek kaşığı'
  | 'çay kaşığı'
  | 'paket'
  | 'demet'
  | 'diş';

export interface MealIngredient {
  name: string;
  amount: number;
  unit: IngredientUnit;
  note?: string;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: number;
  ingredients: MealIngredient[];
}

export interface DayMealPlan {
  dayType: DayType;
  meals: Record<MealType, Meal>;
}

export interface WeeklyPlan {
  workoutDays: number[]; // 0=Pazar, 1=Pazartesi, ...
  mealPlans: {
    spor: DayMealPlan;
    dinlenme: DayMealPlan;
  };
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  purchaseHint?: string;
  checked: boolean;
  category: 'protein' | 'sebze' | 'tahil' | 'sut' | 'diger';
}

export interface ExerciseSet {
  reps: number;
  weight: number;
}

export interface ExerciseLog {
  id: string;
  name: string;
  sets: ExerciseSet[];
}

export interface WorkoutLog {
  id: string;
  date: string;
  type: string;
  durationMinutes: number;
  exercises: ExerciseLog[];
  notes?: string;
  programId?: string;
  programDayId?: string;
  createdAt: string;
}

export type ProgramGoal = 'kas' | 'kuvvet' | 'hipertrofi' | 'dayaniklilik' | 'genel';
export type ProgramLevel = 'baslangic' | 'orta' | 'ileri';

export interface ProgramExercise {
  name: string;
  sets: number;
  reps: string;
  restSec: number;
  tip?: string;
}

export interface ProgramDay {
  id: string;
  name: string;
  focus: string;
  exercises: ProgramExercise[];
}

export interface WorkoutProgram {
  id: string;
  name: string;
  goal: ProgramGoal;
  level: ProgramLevel;
  daysPerWeek: number;
  durationWeeks: number;
  description: string;
  tags: string[];
  days: ProgramDay[];
  source?: 'builtin' | 'custom';
  createdAt?: string;
  updatedAt?: string;
}

export const PROGRAM_GOAL_LABELS: Record<ProgramGoal, string> = {
  kas: 'Kas Geliştirme',
  kuvvet: 'Kuvvet',
  hipertrofi: 'Hipertrofi',
  dayaniklilik: 'Dayanıklılık',
  genel: 'Genel Fitness',
};

export const PROGRAM_LEVEL_LABELS: Record<ProgramLevel, string> = {
  baslangic: 'Başlangıç',
  orta: 'Orta',
  ileri: 'İleri',
};

export const MEAL_LABELS: Record<MealType, string> = {
  kahvalti: 'Kahvaltı',
  ogle: 'Öğle Yemeği',
  aksam: 'Akşam Yemeği',
  araOgun: 'Ara Öğün',
};

export const DAY_NAMES = [
  'Pazar',
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
];

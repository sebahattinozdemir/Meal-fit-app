import { ExperienceLevel } from '../data/programPath';
import { PersonalizationPreferences } from './personalization';

export type FitnessGoal = 'kilo_verme' | 'kas_kazanma' | 'kuvvet' | 'genel_form';

export interface UserProfile {
  heightCm: number;
  weightKg: number;
  age: number;
  goal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  preferences: PersonalizationPreferences;
  onboardingComplete: boolean;
  updatedAt: string;
}

export const FITNESS_GOAL_LABELS: Record<FitnessGoal, string> = {
  kilo_verme: 'Kilo Vermek',
  kas_kazanma: 'Kas Kazanmak',
  kuvvet: 'Kuvvet Geliştirmek',
  genel_form: 'Formda Kalmak',
};

export const FITNESS_GOAL_DESCRIPTIONS: Record<FitnessGoal, string> = {
  kilo_verme: 'Yağ yakımı ve hafif kalori açığı',
  kas_kazanma: 'Kas kütlesi ve hacim odaklı',
  kuvvet: 'Ağırlık artışı ve güç',
  genel_form: 'Dengeli fitness ve sağlık',
};

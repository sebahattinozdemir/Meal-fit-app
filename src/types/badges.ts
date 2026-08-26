export type BadgeCategory = 'baslangic' | 'sureklilik' | 'gelisim' | 'pro';
export type BadgeRarity = 'common' | 'rare' | 'epic';

export type BadgeId =
  | 'data_owner'
  | 'first_log'
  | 'first_weight'
  | 'weekly_rhythm'
  | 'plan_loyalty'
  | 'weigh_in_discipline'
  | 'momentum_up'
  | 'workouts_10'
  | 'workouts_25'
  | 'consistency_master'
  | 'story_started'
  | 'profile_photo'
  | 'pro_member';

export interface BadgeDefinition {
  id: BadgeId;
  icon: string;
  label: string;
  description: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
}

export interface EarnedBadge extends BadgeDefinition {
  earned: boolean;
  progress?: number;
  progressLabel?: string;
}

export const BADGE_CATEGORY_LABELS: Record<BadgeCategory, string> = {
  baslangic: 'Başlangıç',
  sureklilik: 'Süreklilik',
  gelisim: 'Gelişim',
  pro: 'Pro',
};

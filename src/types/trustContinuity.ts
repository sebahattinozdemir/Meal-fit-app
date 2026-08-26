export type TrustLevel = 'baslangic' | 'olgunlasiyor' | 'guvenilir' | 'ornek';

export type ContinuityBadgeId =
  | 'first_log'
  | 'weekly_rhythm'
  | 'plan_loyalty'
  | 'weigh_in_discipline'
  | 'momentum_up'
  | 'data_owner';

export interface ContinuityBadge {
  id: ContinuityBadgeId;
  icon: string;
  label: string;
  earned: boolean;
  hint: string;
}

export interface TrustContinuitySignal {
  id: string;
  icon: string;
  tone: 'trust' | 'continuity' | 'momentum';
  text: string;
}

export interface TrustContinuityReport {
  consistencyScore: number;
  trustLevel: TrustLevel;
  trustLevelLabel: string;
  headline: string;
  subline: string;
  weeklyAdherencePct: number;
  weeklyAdherenceLabel: string;
  consecutiveActiveWeeks: number;
  weightCheckInWeeks: number;
  memberDays: number;
  workoutStreak: number;
  thisWeekWorkouts: number;
  lastWeekWorkouts: number;
  totalLogs: number;
  signals: TrustContinuitySignal[];
  badges: ContinuityBadge[];
  dataTrustNote: string;
}

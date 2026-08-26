import { BADGE_CATALOG } from '../data/badges';
import { BodyProgressEntry } from '../types/progress';
import { BadgeId, EarnedBadge } from '../types/badges';
import { WorkoutLog } from '../types';
import {
  getConsecutiveActiveWeeks,
  getWeeklyPlanAdherence,
  getWeightCheckInWeekStreak,
} from './trustContinuity';

export interface BadgeEvaluationContext {
  workoutLogs: WorkoutLog[];
  progressEntries: BodyProgressEntry[];
  workoutDays: number[];
  consistencyScore: number;
  storyEventCount: number;
  hasAvatar: boolean;
  isPro: boolean;
}

function logsInWeek(logs: WorkoutLog[], ref: Date): number {
  const start = new Date(ref);
  start.setDate(ref.getDate() - ref.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return logs.filter((log) => {
    const d = new Date(`${log.date}T12:00:00`);
    return d >= start && d < end;
  }).length;
}

function isEarned(id: BadgeId, ctx: BadgeEvaluationContext): { earned: boolean; progress?: number; progressLabel?: string } {
  const adherence = getWeeklyPlanAdherence(ctx.workoutLogs, ctx.workoutDays);
  const activeWeeks = getConsecutiveActiveWeeks(ctx.workoutLogs);
  const weighStreak = getWeightCheckInWeekStreak(ctx.progressEntries);
  const thisWeek = logsInWeek(ctx.workoutLogs, new Date());
  const lastWeekRef = new Date();
  lastWeekRef.setDate(lastWeekRef.getDate() - 7);
  const lastWeek = logsInWeek(ctx.workoutLogs, lastWeekRef);
  const workoutCount = ctx.workoutLogs.length;
  const weightCount = ctx.progressEntries.length;

  switch (id) {
    case 'data_owner':
      return { earned: true };
    case 'profile_photo':
      return { earned: ctx.hasAvatar };
    case 'first_log':
      return {
        earned: workoutCount >= 1,
        progress: Math.min(100, workoutCount * 100),
        progressLabel: workoutCount >= 1 ? undefined : '0/1 antrenman',
      };
    case 'first_weight':
      return {
        earned: weightCount >= 1,
        progress: Math.min(100, weightCount * 100),
        progressLabel: weightCount >= 1 ? undefined : '0/1 tartım',
      };
    case 'story_started':
      return {
        earned: ctx.storyEventCount >= 2,
        progress: Math.min(100, Math.round((ctx.storyEventCount / 2) * 100)),
        progressLabel: `${ctx.storyEventCount}/2 an`,
      };
    case 'weekly_rhythm':
      return {
        earned: activeWeeks >= 3,
        progress: Math.min(100, Math.round((activeWeeks / 3) * 100)),
        progressLabel: `${activeWeeks}/3 hafta`,
      };
    case 'plan_loyalty':
      return {
        earned: adherence.pct >= 80 && workoutCount >= 3,
        progress: Math.min(100, adherence.pct),
        progressLabel: `%${adherence.pct} plan uyumu`,
      };
    case 'weigh_in_discipline':
      return {
        earned: weighStreak >= 4,
        progress: Math.min(100, Math.round((weighStreak / 4) * 100)),
        progressLabel: `${weighStreak}/4 hafta`,
      };
    case 'momentum_up':
      return { earned: thisWeek > lastWeek && thisWeek >= 2 };
    case 'consistency_master':
      return {
        earned: ctx.consistencyScore >= 80,
        progress: Math.min(100, ctx.consistencyScore),
        progressLabel: `Skor ${ctx.consistencyScore}/80`,
      };
    case 'workouts_10':
      return {
        earned: workoutCount >= 10,
        progress: Math.min(100, Math.round((workoutCount / 10) * 100)),
        progressLabel: `${workoutCount}/10`,
      };
    case 'workouts_25':
      return {
        earned: workoutCount >= 25,
        progress: Math.min(100, Math.round((workoutCount / 25) * 100)),
        progressLabel: `${workoutCount}/25`,
      };
    case 'pro_member':
      return { earned: ctx.isPro };
    default:
      return { earned: false };
  }
}

export function evaluateBadges(ctx: BadgeEvaluationContext): EarnedBadge[] {
  return BADGE_CATALOG.map((def) => {
    const result = isEarned(def.id, ctx);
    return {
      ...def,
      earned: result.earned,
      progress: result.earned ? 100 : result.progress,
      progressLabel: result.earned ? undefined : result.progressLabel,
    };
  });
}

export function getEarnedBadges(badges: EarnedBadge[]): EarnedBadge[] {
  return badges.filter((b) => b.earned);
}

export function getBadgeStats(badges: EarnedBadge[]): { earned: number; total: number } {
  return { earned: badges.filter((b) => b.earned).length, total: badges.length };
}

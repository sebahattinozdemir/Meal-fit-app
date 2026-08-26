import { WorkoutLog } from '../types';
import { BodyProgressEntry } from '../types/progress';
import { UserProfile } from '../types/profile';
import {
  ContinuityBadge,
  TrustContinuityReport,
  TrustContinuitySignal,
  TrustLevel,
} from '../types/trustContinuity';
import { sortProgressEntries } from './progressStats';
import { toDateKey } from './date';

function parseDate(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00`);
}

function weekBounds(reference: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(reference);
  start.setDate(reference.getDate() - reference.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
}

function dateKey(d: Date): string {
  return d.toISOString().split('T')[0];
}

function logsInWeek(logs: WorkoutLog[], ref: Date): number {
  const { start, end } = weekBounds(ref);
  return logs.filter((log) => {
    const d = parseDate(log.date);
    return d >= start && d < end;
  }).length;
}

function entriesInWeek(entries: BodyProgressEntry[], ref: Date): number {
  const { start, end } = weekBounds(ref);
  return entries.filter((e) => {
    const d = parseDate(e.date);
    return d >= start && d < end;
  }).length;
}

export function getWeeklyPlanAdherence(
  logs: WorkoutLog[],
  workoutDayIndexes: number[],
  reference: Date = new Date()
): { pct: number; completed: number; expected: number; label: string } {
  if (workoutDayIndexes.length === 0) {
    return { pct: 0, completed: 0, expected: 0, label: 'Spor günü seçilmedi' };
  }

  const loggedDates = new Set(logs.map((l) => l.date));
  const { start } = weekBounds(reference);
  const today = new Date(reference);
  today.setHours(12, 0, 0, 0);

  let expected = 0;
  let completed = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (d > today) break;
    const dayIndex = d.getDay();
    if (!workoutDayIndexes.includes(dayIndex)) continue;
    expected += 1;
    if (loggedDates.has(dateKey(d))) completed += 1;
  }

  if (expected === 0) {
    return { pct: 100, completed: 0, expected: 0, label: 'Bu hafta planlı spor günü yok' };
  }

  const pct = Math.round((completed / expected) * 100);
  return {
    pct,
    completed,
    expected,
    label: `Bu hafta ${completed}/${expected} planlı gün tamamlandı`,
  };
}

export function getConsecutiveActiveWeeks(logs: WorkoutLog[], maxWeeks = 12): number {
  let count = 0;
  const ref = new Date();
  for (let w = 0; w < maxWeeks; w++) {
    const check = new Date(ref);
    check.setDate(ref.getDate() - w * 7);
    if (logsInWeek(logs, check) > 0) count += 1;
    else break;
  }
  return count;
}

export function getWeightCheckInWeekStreak(entries: BodyProgressEntry[], maxWeeks = 12): number {
  let count = 0;
  const ref = new Date();
  for (let w = 0; w < maxWeeks; w++) {
    const check = new Date(ref);
    check.setDate(ref.getDate() - w * 7);
    if (entriesInWeek(entries, check) > 0) count += 1;
    else break;
  }
  return count;
}

function memberDays(profile: UserProfile | null, entries: BodyProgressEntry[], logs: WorkoutLog[]): number {
  const dates: string[] = [];
  if (profile?.updatedAt) dates.push(profile.updatedAt.split('T')[0]);
  entries.forEach((e) => dates.push(e.date));
  logs.forEach((l) => dates.push(l.date));
  if (dates.length === 0) return 0;
  dates.sort();
  const start = parseDate(dates[0]);
  const today = parseDate(toDateKey());
  return Math.max(0, Math.round((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

function trustLevelFromScore(score: number): { level: TrustLevel; label: string } {
  if (score >= 80) return { level: 'ornek', label: 'Örnek süreklilik' };
  if (score >= 60) return { level: 'guvenilir', label: 'Güvenilir ritim' };
  if (score >= 30) return { level: 'olgunlasiyor', label: 'Olgunlaşıyor' };
  return { level: 'baslangic', label: 'Başlangıç' };
}

function buildBadges(input: {
  logs: WorkoutLog[];
  adherencePct: number;
  activeWeeks: number;
  weighStreak: number;
  thisWeek: number;
  lastWeek: number;
}): ContinuityBadge[] {
  const badges: ContinuityBadge[] = [
    {
      id: 'data_owner',
      icon: 'shield-checkmark-outline',
      label: 'Veri sahibi',
      earned: true,
      hint: 'Kayıtların cihazında saklanır',
    },
    {
      id: 'first_log',
      icon: 'footsteps-outline',
      label: 'İlk adım',
      earned: input.logs.length >= 1,
      hint: 'İlk antrenman kaydı',
    },
    {
      id: 'weekly_rhythm',
      icon: 'calendar-outline',
      label: 'Haftalık ritim',
      earned: input.activeWeeks >= 3,
      hint: '3 hafta üst üste aktif',
    },
    {
      id: 'plan_loyalty',
      icon: 'checkmark-done-outline',
      label: 'Plan sadakati',
      earned: input.adherencePct >= 80 && input.logs.length >= 3,
      hint: 'Haftalık plana %80+ uyum',
    },
    {
      id: 'weigh_in_discipline',
      icon: 'scale-outline',
      label: 'Tartım disiplini',
      earned: input.weighStreak >= 4,
      hint: '4 hafta üst üste tartım',
    },
    {
      id: 'momentum_up',
      icon: 'trending-up-outline',
      label: 'Ivme',
      earned: input.thisWeek > input.lastWeek && input.thisWeek >= 2,
      hint: 'Geçen haftadan daha fazla antrenman',
    },
  ];
  return badges;
}

function buildSignals(input: {
  adherence: ReturnType<typeof getWeeklyPlanAdherence>;
  activeWeeks: number;
  weighStreak: number;
  memberDays: number;
  thisWeek: number;
  lastWeek: number;
  totalLogs: number;
  workoutStreak: number;
}): TrustContinuitySignal[] {
  const signals: TrustContinuitySignal[] = [];

  signals.push({
    id: 'local-data',
    icon: 'lock-closed-outline',
    tone: 'trust',
    text: 'Antrenman ve tartım verilerin cihazında — hesabın dışında paylaşılmaz.',
  });

  if (input.activeWeeks >= 2) {
    signals.push({
      id: 'active-weeks',
      icon: 'infinite-outline',
      tone: 'continuity',
      text: `${input.activeWeeks} haftadır en az bir antrenman kaydettin — süreklilik sinyali güçleniyor.`,
    });
  }

  if (input.adherence.pct >= 70) {
    signals.push({
      id: 'adherence',
      icon: 'checkbox-outline',
      tone: 'continuity',
      text: `Planına bu hafta %${input.adherence.pct} uyum — güvenilir bir ritim kuruyorsun.`,
    });
  } else if (input.adherence.expected > 0) {
    signals.push({
      id: 'adherence-low',
      icon: 'alert-circle-outline',
      tone: 'continuity',
      text: `Bu hafta ${input.adherence.completed}/${input.adherence.expected} planlı gün tamam — küçük adımlar güven inşa eder.`,
    });
  }

  if (input.thisWeek > input.lastWeek) {
    signals.push({
      id: 'momentum',
      icon: 'arrow-up-circle-outline',
      tone: 'momentum',
      text: `Geçen haftaya göre +${input.thisWeek - input.lastWeek} antrenman — ivme yukarı.`,
    });
  }

  if (input.weighStreak >= 2) {
    signals.push({
      id: 'weigh',
      icon: 'analytics-outline',
      tone: 'trust',
      text: `${input.weighStreak} haftadır tartım verisi var — ilerleme grafiğin güvenilir.`,
    });
  }

  if (input.memberDays >= 14 && input.totalLogs >= 4) {
    signals.push({
      id: 'journey',
      icon: 'time-outline',
      tone: 'continuity',
      text: `${input.memberDays} gündür yoldasın — ${input.totalLogs} kayıt birikti.`,
    });
  }

  if (input.workoutStreak >= 2) {
    signals.push({
      id: 'streak',
      icon: 'flame-outline',
      tone: 'momentum',
      text: `${input.workoutStreak} planlı spor günü üst üste kayıt — seri devam ediyor.`,
    });
  }

  return signals.slice(0, 4);
}

export function buildTrustContinuityReport(input: {
  workoutLogs: WorkoutLog[];
  progressEntries: BodyProgressEntry[];
  workoutDays: number[];
  workoutStreak: number;
  userProfile: UserProfile | null;
}): TrustContinuityReport {
  const { workoutLogs, progressEntries, workoutDays, workoutStreak, userProfile } = input;
  const adherence = getWeeklyPlanAdherence(workoutLogs, workoutDays);
  const activeWeeks = getConsecutiveActiveWeeks(workoutLogs);
  const sortedEntries = sortProgressEntries(progressEntries);
  const weighStreak = getWeightCheckInWeekStreak(sortedEntries);
  const days = memberDays(userProfile, sortedEntries, workoutLogs);
  const thisWeek = logsInWeek(workoutLogs, new Date());
  const lastWeekRef = new Date();
  lastWeekRef.setDate(lastWeekRef.getDate() - 7);
  const lastWeek = logsInWeek(workoutLogs, lastWeekRef);

  const adherenceScore = adherence.pct;
  const weeksScore = Math.min(100, activeWeeks * 20);
  const weighScore = Math.min(100, weighStreak * 25);
  const volumeScore = Math.min(100, workoutLogs.length * 8);
  const consistencyScore = Math.round(
    adherenceScore * 0.4 + weeksScore * 0.3 + weighScore * 0.2 + volumeScore * 0.1
  );

  const { level, label } = trustLevelFromScore(consistencyScore);

  let headline = 'Güven sinyali oluşuyor';
  let subline = 'Düzenli kayıt tuttukça skorun ve güvenilirliğin artar.';

  if (consistencyScore >= 80) {
    headline = 'Güçlü süreklilik sinyali';
    subline = 'Plan, tartım ve antrenman kayıtların birbirini destekliyor.';
  } else if (consistencyScore >= 60) {
    headline = 'Güvenilir bir ritimdesin';
    subline = 'Verilerin tutarlı — hedefe giden yolu net görebiliyorsun.';
  } else if (consistencyScore >= 30) {
    headline = 'Alışkanlık kök salıyor';
    subline = 'Her kayıt güven skorunu biraz daha yükseltir.';
  } else if (workoutLogs.length === 0 && sortedEntries.length <= 1) {
    headline = 'İlk güven sinyini sen ver';
    subline = 'Bir antrenman veya tartım kaydı süreklilik sayacını başlatır.';
  }

  const badges = buildBadges({
    logs: workoutLogs,
    adherencePct: adherence.pct,
    activeWeeks,
    weighStreak,
    thisWeek,
    lastWeek,
  });

  const signals = buildSignals({
    adherence,
    activeWeeks,
    weighStreak,
    memberDays: days,
    thisWeek,
    lastWeek,
    totalLogs: workoutLogs.length + sortedEntries.length,
    workoutStreak,
  });

  return {
    consistencyScore,
    trustLevel: level,
    trustLevelLabel: label,
    headline,
    subline,
    weeklyAdherencePct: adherence.pct,
    weeklyAdherenceLabel: adherence.label,
    consecutiveActiveWeeks: activeWeeks,
    weightCheckInWeeks: weighStreak,
    memberDays: days,
    workoutStreak,
    thisWeekWorkouts: thisWeek,
    lastWeekWorkouts: lastWeek,
    totalLogs: workoutLogs.length,
    signals,
    badges,
    dataTrustNote: 'Verilerin yalnızca bu cihazda saklanır. Store sürümünde hesap yedeklemesi eklenecek.',
  };
}

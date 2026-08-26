import { WorkoutLog } from '../types';
import { BodyProgressEntry, ChartPoint } from '../types/progress';

const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

function parseDate(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00`);
}

function shortLabel(dateKey: string): string {
  const d = parseDate(dateKey);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function weekStartKey(reference: Date = new Date()): string {
  const start = new Date(reference);
  start.setDate(reference.getDate() - reference.getDay());
  start.setHours(0, 0, 0, 0);
  return start.toISOString().split('T')[0];
}

export function sortProgressEntries(entries: BodyProgressEntry[]): BodyProgressEntry[] {
  return [...entries].sort((a, b) => a.date.localeCompare(b.date));
}

export function getWeightChartPoints(entries: BodyProgressEntry[], limit = 8): ChartPoint[] {
  const sorted = sortProgressEntries(entries);
  const slice = sorted.slice(-limit);
  return slice.map((e) => ({
    label: shortLabel(e.date),
    value: e.weightKg,
    date: e.date,
  }));
}

export function getWeightDelta(entries: BodyProgressEntry[]): number | null {
  const sorted = sortProgressEntries(entries);
  if (sorted.length < 2) return null;
  const first = sorted[0].weightKg;
  const last = sorted[sorted.length - 1].weightKg;
  return Math.round((last - first) * 10) / 10;
}

export function getLatestWeight(entries: BodyProgressEntry[], fallback?: number): number | null {
  const sorted = sortProgressEntries(entries);
  if (sorted.length === 0) return fallback ?? null;
  return sorted[sorted.length - 1].weightKg;
}

export function getWeeklyWorkoutPoints(logs: WorkoutLog[], weeks = 6): ChartPoint[] {
  const points: ChartPoint[] = [];
  const now = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const ref = new Date(now);
    ref.setDate(now.getDate() - i * 7);
    const start = new Date(ref);
    start.setDate(ref.getDate() - ref.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    const count = logs.filter((log) => {
      const d = parseDate(log.date);
      return d >= start && d < end;
    }).length;

    const label = i === 0 ? 'Bu hf.' : `${start.getDate()} ${MONTHS[start.getMonth()]}`;
    points.push({ label, value: count, date: start.toISOString().split('T')[0] });
  }

  return points;
}

export function getMonthlyWorkoutCount(logs: WorkoutLog[]): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return logs.filter((log) => {
    const d = parseDate(log.date);
    return d >= start && d < end;
  }).length;
}

export function getWorkoutStreak(logs: WorkoutLog[], workoutDayIndexes: number[]): number {
  if (logs.length === 0 || workoutDayIndexes.length === 0) return 0;

  const loggedDates = new Set(logs.map((l) => l.date));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);

  for (let i = 0; i < 90; i++) {
    const day = cursor.getDay();
    const key = cursor.toISOString().split('T')[0];

    if (workoutDayIndexes.includes(day)) {
      if (loggedDates.has(key)) {
        streak += 1;
      } else if (i === 0) {
        // bugün spor günü ama kayıt yok — streak henüz başlamadı
      } else {
        break;
      }
    }

    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getTopLiftProgress(logs: WorkoutLog[], limit = 4): { name: string; maxWeight: number; sessions: number }[] {
  const map = new Map<string, { maxWeight: number; sessions: number }>();

  logs.forEach((log) => {
    log.exercises.forEach((ex) => {
      const maxSet = ex.sets.reduce((max, s) => Math.max(max, s.weight), 0);
      if (maxSet <= 0) return;
      const prev = map.get(ex.name) ?? { maxWeight: 0, sessions: 0 };
      map.set(ex.name, {
        maxWeight: Math.max(prev.maxWeight, maxSet),
        sessions: prev.sessions + 1,
      });
    });
  });

  return [...map.entries()]
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.maxWeight - a.maxWeight)
    .slice(0, limit);
}

export function getWeeklyDurationPoints(logs: WorkoutLog[], weeks = 6): ChartPoint[] {
  const points: ChartPoint[] = [];
  const now = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const ref = new Date(now);
    ref.setDate(now.getDate() - i * 7);
    const start = new Date(ref);
    start.setDate(ref.getDate() - ref.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    const minutes = logs
      .filter((log) => {
        const d = parseDate(log.date);
        return d >= start && d < end;
      })
      .reduce((sum, log) => sum + log.durationMinutes, 0);

    const label = i === 0 ? 'Bu hf.' : `${start.getDate()} ${MONTHS[start.getMonth()]}`;
    points.push({ label, value: minutes, date: start.toISOString().split('T')[0] });
  }

  return points;
}

export function seedProgressFromWeight(weightKg: number, date = new Date()): BodyProgressEntry {
  const dateKey = date.toISOString().split('T')[0];
  return {
    id: `progress-seed-${dateKey}`,
    date: dateKey,
    weightKg,
    note: 'Başlangıç ölçümü',
    createdAt: new Date().toISOString(),
  };
}

export { weekStartKey };

import { WorkoutLog } from '../types';

export interface WorkoutTimePattern {
  hour: number;
  minute: number;
  sampleSize: number;
  label: string;
}

export function inferTypicalWorkoutTime(
  logs: WorkoutLog[],
  fallbackHour = 18,
  fallbackMinute = 0
): WorkoutTimePattern {
  const minutes = logs
    .map((log) => new Date(log.createdAt))
    .filter((d) => !Number.isNaN(d.getTime()))
    .map((d) => d.getHours() * 60 + d.getMinutes());

  if (minutes.length < 2) {
    return {
      hour: fallbackHour,
      minute: fallbackMinute,
      sampleSize: minutes.length,
      label: formatTime(fallbackHour, fallbackMinute),
    };
  }

  minutes.sort((a, b) => a - b);
  const median = minutes[Math.floor(minutes.length / 2)];
  const hour = Math.floor(median / 60);
  const minute = median % 60;

  return {
    hour,
    minute,
    sampleSize: minutes.length,
    label: formatTime(hour, minute),
  };
}

export function subtractMinutes(hour: number, minute: number, delta: number): { hour: number; minute: number } {
  let total = hour * 60 + minute - delta;
  if (total < 0) total += 24 * 60;
  return { hour: Math.floor(total / 60) % 24, minute: total % 60 };
}

export function addMinutes(hour: number, minute: number, delta: number): { hour: number; minute: number } {
  const total = (hour * 60 + minute + delta) % (24 * 60);
  return { hour: Math.floor(total / 60), minute: total % 60 };
}

export function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function patternDescription(pattern: WorkoutTimePattern): string {
  if (pattern.sampleSize >= 3) {
    return `Son ${pattern.sampleSize} antrenmanına göre ~${pattern.label}`;
  }
  if (pattern.sampleSize >= 1) {
    return `Az veri — varsayılan ~${pattern.label}`;
  }
  return `Henüz kalıp yok — varsayılan ~${pattern.label}`;
}

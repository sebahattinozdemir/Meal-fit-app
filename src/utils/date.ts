import { DAY_NAMES } from '../types';

export function toDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatWorkoutDate(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`);
  const dayName = DAY_NAMES[date.getDay()];
  const day = date.getDate();
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  return `${day} ${months[date.getMonth()]} • ${dayName}`;
}

export function isSameWeek(dateKey: string, reference: Date = new Date()): boolean {
  const date = new Date(`${dateKey}T12:00:00`);
  const startOfWeek = new Date(reference);
  startOfWeek.setDate(reference.getDate() - reference.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return date >= startOfWeek && date < endOfWeek;
}

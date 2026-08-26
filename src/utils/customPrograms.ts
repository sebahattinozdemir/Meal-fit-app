import { ProgramDay, ProgramExercise, ProgramGoal, ProgramLevel, WorkoutProgram } from '../types';

export const CUSTOM_PROGRAM_PREFIX = 'custom-';
export const MAX_CUSTOM_PROGRAMS = 10;

export function isCustomProgramId(id: string): boolean {
  return id.startsWith(CUSTOM_PROGRAM_PREFIX);
}

export function createProgramDay(name = 'Gün 1'): ProgramDay {
  return {
    id: `day-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    focus: '',
    exercises: [{ name: 'Squat', sets: 3, reps: '10', restSec: 90 }],
  };
}

export function createEmptyExercise(): ProgramExercise {
  return { name: '', sets: 3, reps: '10', restSec: 90 };
}

export function createCustomProgramTemplate(): WorkoutProgram {
  const now = new Date().toISOString();
  return {
    id: `${CUSTOM_PROGRAM_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: '',
    goal: 'genel' as ProgramGoal,
    level: 'baslangic' as ProgramLevel,
    daysPerWeek: 1,
    durationWeeks: 8,
    description: '',
    tags: ['Özel'],
    source: 'custom',
    createdAt: now,
    updatedAt: now,
    days: [createProgramDay('Gün 1')],
  };
}

export interface CustomProgramValidation {
  valid: boolean;
  error?: string;
}

export function validateCustomProgram(program: WorkoutProgram): CustomProgramValidation {
  const name = program.name.trim();
  if (name.length < 2) {
    return { valid: false, error: 'Program adı en az 2 karakter olmalı.' };
  }

  if (program.days.length === 0) {
    return { valid: false, error: 'En az bir antrenman günü ekle.' };
  }

  for (const day of program.days) {
    if (!day.name.trim()) {
      return { valid: false, error: 'Tüm günlerin adı dolu olmalı.' };
    }
    if (day.exercises.length === 0) {
      return { valid: false, error: `"${day.name}" gününde en az bir hareket olmalı.` };
    }
    for (const ex of day.exercises) {
      if (!ex.name.trim()) {
        return { valid: false, error: `"${day.name}" gününde boş hareket adı var.` };
      }
      if (ex.sets < 1 || ex.sets > 20) {
        return { valid: false, error: `"${ex.name}" için set sayısı 1–20 arasında olmalı.` };
      }
    }
  }

  return { valid: true };
}

export function normalizeCustomProgram(program: WorkoutProgram): WorkoutProgram {
  const now = new Date().toISOString();
  return {
    ...program,
    name: program.name.trim(),
    description: program.description.trim(),
    daysPerWeek: program.days.length,
    tags: ['Özel'],
    source: 'custom',
    updatedAt: now,
    createdAt: program.createdAt ?? now,
    days: program.days.map((day, index) => ({
      ...day,
      id: day.id || `day-${index}-${Date.now()}`,
      name: day.name.trim() || `Gün ${index + 1}`,
      focus: day.focus.trim(),
      exercises: day.exercises.map((ex) => ({
        ...ex,
        name: ex.name.trim(),
        reps: ex.reps.trim() || '10',
        restSec: Math.max(30, Math.min(600, ex.restSec || 90)),
      })),
    })),
  };
}

export function sanitizeCustomPrograms(raw: unknown): WorkoutProgram[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is WorkoutProgram => {
      if (!item || typeof item !== 'object') return false;
      const p = item as WorkoutProgram;
      return (
        typeof p.id === 'string' &&
        isCustomProgramId(p.id) &&
        typeof p.name === 'string' &&
        Array.isArray(p.days) &&
        p.days.length > 0
      );
    })
    .slice(0, MAX_CUSTOM_PROGRAMS)
    .map((p) => normalizeCustomProgram({ ...p, source: 'custom' }));
}

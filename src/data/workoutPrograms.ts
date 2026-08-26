import { ProgramDay, ProgramGoal, WorkoutProgram } from '../types';
import { KVK_PROGRAMS } from './kasvekuvvetPrograms';

export const WORKOUT_PROGRAMS: WorkoutProgram[] = KVK_PROGRAMS;

export function getProgramById(id: string, customPrograms: WorkoutProgram[] = []): WorkoutProgram | undefined {
  return WORKOUT_PROGRAMS.find((p) => p.id === id) ?? customPrograms.find((p) => p.id === id);
}

export function mergePrograms(customPrograms: WorkoutProgram[] = []): WorkoutProgram[] {
  return [...WORKOUT_PROGRAMS, ...customPrograms];
}

export function getProgramsByGoal(
  goal: ProgramGoal | 'all',
  customPrograms: WorkoutProgram[] = []
): WorkoutProgram[] {
  const list = mergePrograms(customPrograms);
  return goal === 'all' ? list : list.filter((p) => p.goal === goal);
}

/** Haftalık spor günü sırasına göre bugünkü program gününü bul */
export function getProgramDayForToday(
  program: WorkoutProgram,
  workoutDays: number[],
  today: number = new Date().getDay()
): ProgramDay | null {
  if (!workoutDays.includes(today)) return null;
  const sorted = [...workoutDays].sort((a, b) => a - b);
  const indexInWeek = sorted.indexOf(today);
  return program.days[indexInWeek % program.days.length];
}

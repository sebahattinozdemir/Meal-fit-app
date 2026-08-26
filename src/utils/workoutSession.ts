import { ExerciseLog, ExerciseSet, ProgramDay, WorkoutProgram } from '../types';
import { isCustomProgramId } from './customPrograms';

export const BUILTIN_DEFAULT_REST_SEC = 60;

export interface WorkoutSessionStep {
  exerciseIndex: number;
  exerciseName: string;
  setNumber: number;
  totalSets: number;
  targetReps: string;
  restAfterSec: number;
  isLastSetOfExercise: boolean;
  isLastStep: boolean;
}

export interface CompletedSetRecord {
  exerciseIndex: number;
  exerciseName: string;
  setNumber: number;
  reps: number;
  weight: number;
}

export function parseTargetReps(reps: string): number {
  const match = reps.match(/\d+/);
  return match ? parseInt(match[0], 10) : 10;
}

export function getRestSecondsForExercise(
  program: WorkoutProgram,
  restSec: number | undefined
): number {
  if (isCustomProgramId(program.id)) {
    return Math.max(30, Math.min(600, restSec ?? BUILTIN_DEFAULT_REST_SEC));
  }
  return BUILTIN_DEFAULT_REST_SEC;
}

export function buildSessionSteps(program: WorkoutProgram, day: ProgramDay): WorkoutSessionStep[] {
  const steps: WorkoutSessionStep[] = [];

  day.exercises.forEach((exercise, exerciseIndex) => {
    for (let setNumber = 1; setNumber <= exercise.sets; setNumber += 1) {
      const isLastSetOfExercise = setNumber === exercise.sets;
      const isLastExercise = exerciseIndex === day.exercises.length - 1;
      const isLastStep = isLastSetOfExercise && isLastExercise;

      steps.push({
        exerciseIndex,
        exerciseName: exercise.name,
        setNumber,
        totalSets: exercise.sets,
        targetReps: exercise.reps,
        restAfterSec: isLastStep
          ? 0
          : getRestSecondsForExercise(program, exercise.restSec),
        isLastSetOfExercise,
        isLastStep,
      });
    }
  });

  return steps;
}

export function getUpcomingStep(
  steps: WorkoutSessionStep[],
  currentIndex: number
): WorkoutSessionStep | null {
  const next = steps[currentIndex + 1];
  return next ?? null;
}

export function buildExerciseLogsFromSession(
  steps: WorkoutSessionStep[],
  completedSets: CompletedSetRecord[]
): ExerciseLog[] {
  const byExercise = new Map<number, { name: string; sets: ExerciseSet[] }>();

  completedSets.forEach((record) => {
    const existing = byExercise.get(record.exerciseIndex) ?? {
      name: record.exerciseName,
      sets: [],
    };
    existing.sets[record.setNumber - 1] = { reps: record.reps, weight: record.weight };
    byExercise.set(record.exerciseIndex, existing);
  });

  return Array.from(byExercise.entries())
    .sort(([a], [b]) => a - b)
    .map(([exerciseIndex, value]) => ({
      id: `session-ex-${exerciseIndex}`,
      name: value.name,
      sets: value.sets.filter(Boolean),
    }));
}

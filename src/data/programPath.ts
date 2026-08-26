import { WorkoutLog } from '../types';
import { WORKOUT_PROGRAMS } from './workoutPrograms';

export type ExperienceLevel = 'hic' | 'alti_ay' | 'bir_yil' | 'iki_yil_plus';

export interface ExperienceOption {
  key: ExperienceLevel;
  label: string;
  subtitle: string;
  startProgramId: string;
}

/** Ana salon yolu — sırayla ilerlenir */
export const MAIN_PATH_ORDER = [
  'kvk-yeni-baslayan',
  'kvk-stronglifts',
  'kvk-madcow',
  'kvk-dogan-hipertrofi',
  'kvk-dogan-kuvvet',
  'kvk-5x5-hacim',
] as const;

/** Ev / ekipmansız alternatifler — bağımsız başlangıç */
export const HOME_PROGRAM_IDS = ['kvk-aletsiz', 'kvk-evde-dambil'];

export const EXPERIENCE_OPTIONS: ExperienceOption[] = [
  {
    key: 'hic',
    label: 'Hiç spor yapmadım',
    subtitle: 'Teknik öğren, temel oluştur',
    startProgramId: 'kvk-yeni-baslayan',
  },
  {
    key: 'alti_ay',
    label: '6 ay deneyimim var',
    subtitle: 'Temel hareketleri biliyorum',
    startProgramId: 'kvk-stronglifts',
  },
  {
    key: 'bir_yil',
    label: '1 yıl salon deneyimim var',
    subtitle: 'Squat/bench/deadlift yapabiliyorum',
    startProgramId: 'kvk-madcow',
  },
  {
    key: 'iki_yil_plus',
    label: '2+ yıl, orta-ileri seviye',
    subtitle: 'Kuvvet tabanım var, hacme geçmek istiyorum',
    startProgramId: 'kvk-dogan-hipertrofi',
  },
];

export interface ProgramUnlockRule {
  /** Önce tamamlanması gereken program */
  afterProgramId?: string;
  /** Önceki programda minimum antrenman sayısı */
  minWorkoutsOnPrevious?: number;
  /** Önceki programda minimum hafta (tahmini) */
  minWeeksOnPrevious?: number;
  /** Kilit mesajı */
  lockReason: string;
  /** Deneyim seçimiyle doğrudan açılabilir mi */
  bypassWithExperience?: boolean;
}

export const UNLOCK_RULES: Record<string, ProgramUnlockRule> = {
  'kvk-yeni-baslayan': {
    lockReason: '',
    bypassWithExperience: true,
  },
  'kvk-aletsiz': {
    lockReason: '',
    bypassWithExperience: true,
  },
  'kvk-evde-dambil': {
    lockReason: '',
    bypassWithExperience: true,
  },
  'kvk-stronglifts': {
    afterProgramId: 'kvk-yeni-baslayan',
    minWorkoutsOnPrevious: 18,
    minWeeksOnPrevious: 6,
    lockReason: 'Önce İlk Adım programında en az 6 hafta / 18 antrenman tamamla',
    bypassWithExperience: true,
  },
  'kvk-madcow': {
    afterProgramId: 'kvk-stronglifts',
    minWorkoutsOnPrevious: 24,
    minWeeksOnPrevious: 8,
    lockReason: 'Önce Demir 5×5 programında en az 8 hafta / 24 antrenman tamamla',
    bypassWithExperience: true,
  },
  'kvk-dogan-hipertrofi': {
    afterProgramId: 'kvk-madcow',
    minWorkoutsOnPrevious: 24,
    minWeeksOnPrevious: 8,
    lockReason: 'Önce Maksimum Güç 5×5 programında en az 8 hafta / 24 antrenman tamamla',
    bypassWithExperience: true,
  },
  'kvk-dogan-kuvvet': {
    afterProgramId: 'kvk-dogan-hipertrofi',
    minWorkoutsOnPrevious: 18,
    minWeeksOnPrevious: 6,
    lockReason: 'Önce Titan Split programında en az 6 hafta / 18 antrenman tamamla',
    bypassWithExperience: false,
  },
  'kvk-5x5-hacim': {
    afterProgramId: 'kvk-dogan-kuvvet',
    minWorkoutsOnPrevious: 12,
    minWeeksOnPrevious: 4,
    lockReason:
      'Önce Titan Forge programını tamamla. Bench ≈ vücut ağırlığı, squat ≈ 1.5× vücut ağırlığı hedefle.',
    bypassWithExperience: false,
  },
};

export function getWorkoutsForProgram(programId: string, logs: WorkoutLog[]): WorkoutLog[] {
  return logs.filter((l) => l.programId === programId);
}

export function getProgramProgress(programId: string, logs: WorkoutLog[]) {
  const program = WORKOUT_PROGRAMS.find((p) => p.id === programId);
  const count = getWorkoutsForProgram(programId, logs).length;
  const target = program ? Math.ceil(program.durationWeeks * program.daysPerWeek * 0.75) : 0;
  return { count, target, complete: target > 0 && count >= target };
}

export function getExperienceStartIndex(level: ExperienceLevel): number {
  const opt = EXPERIENCE_OPTIONS.find((o) => o.key === level);
  if (!opt) return 0;
  const idx = MAIN_PATH_ORDER.indexOf(opt.startProgramId as (typeof MAIN_PATH_ORDER)[number]);
  return idx >= 0 ? idx : 0;
}

export function isProgramUnlocked(
  programId: string,
  logs: WorkoutLog[],
  experienceLevel: ExperienceLevel
): { unlocked: boolean; reason: string } {
  if (HOME_PROGRAM_IDS.includes(programId)) {
    return { unlocked: true, reason: '' };
  }

  const rule = UNLOCK_RULES[programId];
  if (!rule) return { unlocked: true, reason: '' };

  const pathIndex = MAIN_PATH_ORDER.indexOf(programId as (typeof MAIN_PATH_ORDER)[number]);
  const startIndex = getExperienceStartIndex(experienceLevel);

  if (pathIndex >= 0 && pathIndex <= startIndex) {
    return { unlocked: true, reason: '' };
  }

  if (!rule.afterProgramId) {
    return { unlocked: true, reason: '' };
  }

  const prev = getProgramProgress(rule.afterProgramId, logs);
  const minWorkouts = rule.minWorkoutsOnPrevious ?? 0;

  if (prev.complete || prev.count >= minWorkouts) {
    return { unlocked: true, reason: '' };
  }

  const prevName = WORKOUT_PROGRAMS.find((p) => p.id === rule.afterProgramId)?.name ?? 'Önceki program';
  return {
    unlocked: false,
    reason: `${rule.lockReason} (${prevName}: ${prev.count}/${minWorkouts})`,
  };
}

export function getPathSteps(experienceLevel: ExperienceLevel, logs: WorkoutLog[]) {
  const startIndex = getExperienceStartIndex(experienceLevel);
  return MAIN_PATH_ORDER.map((id, index) => {
    const program = WORKOUT_PROGRAMS.find((p) => p.id === id)!;
    const { unlocked, reason } = isProgramUnlocked(id, logs, experienceLevel);
    const progress = getProgramProgress(id, logs);
    const isStart = index === startIndex;
    const isRecommended = isStart && !progress.complete;
    return { id, program, index, unlocked, reason, progress, isStart, isRecommended };
  });
}

export function getRecommendedProgramId(experienceLevel: ExperienceLevel, logs: WorkoutLog[]): string {
  const steps = getPathSteps(experienceLevel, logs);
  const active = steps.find((s) => s.unlocked && !s.progress.complete);
  if (active) return active.id;
  const lastUnlocked = [...steps].reverse().find((s) => s.unlocked);
  return lastUnlocked?.id ?? EXPERIENCE_OPTIONS.find((o) => o.key === experienceLevel)!.startProgramId;
}

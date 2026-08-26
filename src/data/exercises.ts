export const WORKOUT_TYPES = [
  'Göğüs',
  'Sırt',
  'Bacak',
  'Omuz',
  'Kol',
  'Full Body',
  'Kardiyo',
] as const;

export type WorkoutType = (typeof WORKOUT_TYPES)[number];

export const EXERCISES_BY_TYPE: Record<WorkoutType, string[]> = {
  'Göğüs': ['Bench Press', 'Incline Press', 'Dumbbell Fly', 'Push-up', 'Cable Crossover'],
  'Sırt': ['Deadlift', 'Barbell Row', 'Lat Pulldown', 'Pull-up', 'Seated Row'],
  'Bacak': ['Squat', 'Leg Press', 'Romanian Deadlift', 'Lunge', 'Leg Curl'],
  'Omuz': ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Face Pull', 'Arnold Press'],
  'Kol': ['Barbell Curl', 'Triceps Pushdown', 'Hammer Curl', 'Skull Crusher', 'Dips'],
  'Full Body': ['Squat', 'Bench Press', 'Deadlift', 'Pull-up', 'Plank'],
  'Kardiyo': ['Koşu', 'Yürüyüş', 'Bisiklet', 'Jump Rope', 'HIIT'],
};

export const WORKOUT_TYPE_ICONS: Record<WorkoutType, string> = {
  'Göğüs': 'body-outline',
  'Sırt': 'git-branch-outline',
  'Bacak': 'walk-outline',
  'Omuz': 'arrow-up-outline',
  'Kol': 'fitness-outline',
  'Full Body': 'barbell-outline',
  'Kardiyo': 'heart-outline',
};

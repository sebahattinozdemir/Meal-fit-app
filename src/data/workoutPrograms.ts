import { ProgramDay, ProgramGoal, WorkoutProgram } from '../types';

const ex = (name: string, sets: number, reps: string, restSec = 90, tip?: string) => ({
  name,
  sets,
  reps,
  restSec,
  tip,
});

export const WORKOUT_PROGRAMS: WorkoutProgram[] = [
  {
    id: 'full-body-strength-3',
    name: 'Full Body Kuvvet',
    goal: 'kuvvet',
    level: 'baslangic',
    daysPerWeek: 3,
    durationWeeks: 8,
    description: 'Temel bileşik hareketlerle güç kazan. Haftada 3 gün ideal.',
    tags: ['Squat', 'Deadlift', 'Bench'],
    days: [
      {
        id: 'fb-a',
        name: 'Gün A',
        focus: 'Alt vücut + itme',
        exercises: [
          ex('Squat', 5, '5', 180, 'Ağırlığı kademeli artır'),
          ex('Bench Press', 5, '5', 180),
          ex('Barbell Row', 3, '8', 120),
          ex('Plank', 3, '45 sn', 60),
        ],
      },
      {
        id: 'fb-b',
        name: 'Gün B',
        focus: 'Alt vücut + çekme',
        exercises: [
          ex('Deadlift', 5, '5', 180),
          ex('Overhead Press', 5, '5', 180),
          ex('Pull-up / Lat Pulldown', 3, '8', 120),
          ex('Leg Curl', 3, '12', 90),
        ],
      },
      {
        id: 'fb-c',
        name: 'Gün C',
        focus: 'Full body hacim',
        exercises: [
          ex('Front Squat', 4, '6', 150),
          ex('Incline Dumbbell Press', 4, '8', 120),
          ex('Romanian Deadlift', 3, '10', 120),
          ex('Face Pull', 3, '15', 60),
        ],
      },
    ],
  },
  {
    id: 'ppl-3day',
    name: 'Push Pull Legs (3 Gün)',
    goal: 'kas',
    level: 'orta',
    daysPerWeek: 3,
    durationWeeks: 10,
    description: 'Klasik PPL split — kas kütlesi için en popüler programlardan.',
    tags: ['PPL', 'Hipertrofi', '3 gün'],
    days: [
      {
        id: 'ppl-push',
        name: 'Push',
        focus: 'Göğüs, omuz, triceps',
        exercises: [
          ex('Bench Press', 4, '8-10', 120),
          ex('Incline Dumbbell Press', 3, '10-12', 90),
          ex('Overhead Press', 3, '8-10', 120),
          ex('Lateral Raise', 3, '12-15', 60),
          ex('Triceps Pushdown', 3, '12-15', 60),
        ],
      },
      {
        id: 'ppl-pull',
        name: 'Pull',
        focus: 'Sırt, biceps, arka omuz',
        exercises: [
          ex('Deadlift', 4, '6-8', 150),
          ex('Lat Pulldown', 4, '10-12', 90),
          ex('Seated Cable Row', 3, '10-12', 90),
          ex('Face Pull', 3, '15', 60),
          ex('Barbell Curl', 3, '10-12', 60),
        ],
      },
      {
        id: 'ppl-legs',
        name: 'Legs',
        focus: 'Quadriceps, hamstring, glute',
        exercises: [
          ex('Squat', 4, '8-10', 150),
          ex('Leg Press', 3, '12-15', 90),
          ex('Romanian Deadlift', 3, '10-12', 120),
          ex('Leg Curl', 3, '12-15', 60),
          ex('Calf Raise', 4, '15-20', 45),
        ],
      },
    ],
  },
  {
    id: 'upper-lower-3',
    name: 'Upper / Lower Split',
    goal: 'hipertrofi',
    level: 'orta',
    daysPerWeek: 3,
    durationWeeks: 8,
    description: 'Üst-alt vücut dönüşümlü. Güç ve hacim dengesi.',
    tags: ['Split', 'Denge'],
    days: [
      {
        id: 'ul-upper-a',
        name: 'Upper A',
        focus: 'Göğüs & sırt odak',
        exercises: [
          ex('Bench Press', 4, '6-8', 120),
          ex('Barbell Row', 4, '6-8', 120),
          ex('Dumbbell Shoulder Press', 3, '10-12', 90),
          ex('Lat Pulldown', 3, '10-12', 90),
          ex('Dumbbell Curl', 2, '12-15', 60),
        ],
      },
      {
        id: 'ul-lower-a',
        name: 'Lower A',
        focus: 'Quadriceps odak',
        exercises: [
          ex('Squat', 4, '6-8', 150),
          ex('Leg Press', 3, '10-12', 90),
          ex('Leg Extension', 3, '12-15', 60),
          ex('Leg Curl', 3, '10-12', 90),
          ex('Calf Raise', 4, '12-15', 45),
        ],
      },
      {
        id: 'ul-upper-b',
        name: 'Upper B',
        focus: 'Omuz & kollar',
        exercises: [
          ex('Incline Bench Press', 4, '8-10', 120),
          ex('Pull-up', 3, 'max', 120),
          ex('Lateral Raise', 4, '12-15', 60),
          ex('Skull Crusher', 3, '10-12', 60),
          ex('Hammer Curl', 3, '10-12', 60),
        ],
      },
    ],
  },
  {
    id: 'strong-5x5',
    name: 'Strong 5×5',
    goal: 'kuvvet',
    level: 'baslangic',
    daysPerWeek: 3,
    durationWeeks: 12,
    description: 'Linear progression ile maksimum kuvvet artışı. Başlangıç klasiği.',
    tags: ['5x5', 'Güç', 'Linear'],
    days: [
      {
        id: 's5-workout-a',
        name: 'Workout A',
        focus: 'Squat, Bench, Row',
        exercises: [
          ex('Squat', 5, '5', 180),
          ex('Bench Press', 5, '5', 180),
          ex('Barbell Row', 5, '5', 180),
        ],
      },
      {
        id: 's5-workout-b',
        name: 'Workout B',
        focus: 'Squat, OHP, Deadlift',
        exercises: [
          ex('Squat', 5, '5', 180),
          ex('Overhead Press', 5, '5', 180),
          ex('Deadlift', 1, '5', 180),
        ],
      },
      {
        id: 's5-workout-a2',
        name: 'Workout A (Tekrar)',
        focus: 'A günü tekrarı',
        exercises: [
          ex('Squat', 5, '5', 180),
          ex('Bench Press', 5, '5', 180),
          ex('Barbell Row', 5, '5', 180),
        ],
      },
    ],
  },
  {
    id: 'hypertrophy-bro-3',
    name: 'Bro Split (3 Gün)',
    goal: 'hipertrofi',
    level: 'orta',
    daysPerWeek: 3,
    durationWeeks: 8,
    description: 'Kas gruplarına yüksek hacim. Pump odaklı antrenman.',
    tags: ['Hacim', 'Pump'],
    days: [
      {
        id: 'bro-chest-tri',
        name: 'Göğüs & Triceps',
        focus: 'Göğüs hacmi',
        exercises: [
          ex('Flat Bench Press', 4, '8-12', 90),
          ex('Incline Dumbbell Press', 4, '10-12', 90),
          ex('Cable Fly', 3, '12-15', 60),
          ex('Dips', 3, '10-12', 90),
          ex('Triceps Rope Pushdown', 3, '12-15', 60),
        ],
      },
      {
        id: 'bro-back-bi',
        name: 'Sırt & Biceps',
        focus: 'Sırt genişliği',
        exercises: [
          ex('Pull-up / Lat Pulldown', 4, '8-12', 90),
          ex('Barbell Row', 4, '8-10', 120),
          ex('Seated Row', 3, '10-12', 90),
          ex('Straight Arm Pulldown', 3, '12-15', 60),
          ex('Incline Dumbbell Curl', 3, '10-12', 60),
        ],
      },
      {
        id: 'bro-legs',
        name: 'Bacak & Omuz',
        focus: 'Bacak hacmi',
        exercises: [
          ex('Squat', 4, '8-12', 120),
          ex('Leg Press', 4, '12-15', 90),
          ex('Walking Lunge', 3, '12/bacak', 90),
          ex('Overhead Press', 4, '8-10', 120),
          ex('Lateral Raise', 4, '15-20', 45),
        ],
      },
    ],
  },
  {
    id: 'fat-burn-circuit',
    name: 'Yağ Yakım Devre',
    goal: 'dayaniklilik',
    level: 'baslangic',
    daysPerWeek: 3,
    durationWeeks: 6,
    description: 'Kardiyo + direnç birleşimi. Kondisyon ve yağ yakımı.',
    tags: ['Devre', 'Kardiyo', 'HIIT'],
    days: [
      {
        id: 'circuit-a',
        name: 'Devre A',
        focus: 'Full body circuit',
        exercises: [
          ex('Burpee', 4, '12', 45),
          ex('Kettlebell Swing', 4, '15', 45),
          ex('Push-up', 4, '15', 45),
          ex('Goblet Squat', 4, '15', 45),
          ex('Mountain Climber', 4, '30 sn', 45),
        ],
      },
      {
        id: 'circuit-b',
        name: 'Devre B',
        focus: 'Metabolik kondisyon',
        exercises: [
          ex('Jump Squat', 4, '12', 45),
          ex('Battle Rope', 4, '30 sn', 45),
          ex('Dumbbell Thruster', 4, '12', 45),
          ex('Box Step-up', 4, '12/bacak', 45),
          ex('Plank to Push-up', 3, '10', 45),
        ],
      },
      {
        id: 'circuit-c',
        name: 'Devre C',
        focus: 'Core + kardiyo',
        exercises: [
          ex('Rowing Machine', 4, '500m', 60),
          ex('Medicine Ball Slam', 4, '15', 45),
          ex('Walking Lunge', 3, '20 adım', 45),
          ex('Bicycle Crunch', 3, '20', 30),
          ex('Jump Rope', 4, '60 sn', 45),
        ],
      },
    ],
  },
  {
    id: 'beginner-foundation',
    name: 'Başlangıç Temeli',
    goal: 'genel',
    level: 'baslangic',
    daysPerWeek: 3,
    durationWeeks: 6,
    description: 'Spora yeni başlayanlar için güvenli ve etkili program.',
    tags: ['Yeni başlayan', 'Form'],
    days: [
      {
        id: 'beg-1',
        name: 'Gün 1',
        focus: 'Temel hareketler',
        exercises: [
          ex('Goblet Squat', 3, '12', 90),
          ex('Dumbbell Bench Press', 3, '12', 90),
          ex('Lat Pulldown', 3, '12', 90),
          ex('Plank', 3, '30 sn', 60),
        ],
      },
      {
        id: 'beg-2',
        name: 'Gün 2',
        focus: 'Alt vücut + core',
        exercises: [
          ex('Leg Press', 3, '12', 90),
          ex('Romanian Deadlift (hafif)', 3, '10', 90),
          ex('Dumbbell Shoulder Press', 3, '12', 90),
          ex('Dead Bug', 3, '10/taraf', 60),
        ],
      },
      {
        id: 'beg-3',
        name: 'Gün 3',
        focus: 'Full body',
        exercises: [
          ex('Dumbbell Lunge', 3, '10/bacak', 90),
          ex('Push-up (diz destekli)', 3, '10-15', 60),
          ex('Seated Row', 3, '12', 90),
          ex('Glute Bridge', 3, '15', 60),
        ],
      },
    ],
  },
  {
    id: 'powerlifting-peaking',
    name: 'Powerlifting Peaking',
    goal: 'kuvvet',
    level: 'ileri',
    daysPerWeek: 3,
    durationWeeks: 10,
    description: 'Squat, bench, deadlift odaklı ileri seviye güç programı.',
    tags: ['SBD', 'Powerlifting'],
    days: [
      {
        id: 'pl-squat',
        name: 'Squat Günü',
        focus: 'Squat ağırlık odak',
        exercises: [
          ex('Competition Squat', 5, '3-5', 240),
          ex('Pause Squat', 3, '3', 180),
          ex('Leg Press', 3, '8', 120),
          ex('Abs Rollout', 3, '10', 60),
        ],
      },
      {
        id: 'pl-bench',
        name: 'Bench Günü',
        focus: 'Bench ağırlık odak',
        exercises: [
          ex('Competition Bench', 5, '3-5', 240),
          ex('Close Grip Bench', 3, '6', 120),
          ex('Dumbbell Row', 3, '8', 90),
          ex('Triceps Extension', 3, '12', 60),
        ],
      },
      {
        id: 'pl-deadlift',
        name: 'Deadlift Günü',
        focus: 'Deadlift ağırlık odak',
        exercises: [
          ex('Competition Deadlift', 5, '2-3', 240),
          ex('Deficit Deadlift', 3, '4', 180),
          ex('Barbell Row', 3, '6', 120),
          ex('Hamstring Curl', 3, '10', 60),
        ],
      },
    ],
  },
];

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

import { ProgramDay, ProgramGoal, ProgramLevel, WorkoutProgram } from '../types';

const BASE_URL = 'https://kasvekuvvet.net';

const ex = (name: string, sets: number, reps: string, restSec = 90, tip?: string) => ({
  name,
  sets,
  reps,
  restSec,
  tip,
});

/** kasvekuvvet.net kaynaklı program meta */
export interface KvkProgramMeta {
  slug: string;
  sourceUrl: string;
}

export const KVK_SOURCE = {
  name: 'Kas ve Kuvvet',
  website: BASE_URL,
  disclaimer: 'Program içerikleri kasvekuvvet.net sitesinden derlenmiştir.',
};

function program(
  id: string,
  slug: string,
  data: Omit<WorkoutProgram, 'id'> & { sourceSlug: string }
): WorkoutProgram & { sourceUrl: string; sourceSlug: string } {
  return {
    id,
    ...data,
    sourceUrl: `${BASE_URL}/${slug}`,
    sourceSlug: slug,
  } as WorkoutProgram & { sourceUrl: string; sourceSlug: string };
}

export type KvkWorkoutProgram = WorkoutProgram & {
  sourceUrl: string;
  sourceSlug: string;
};

export const KVK_PROGRAMS: KvkWorkoutProgram[] = [
  program('kvk-dogan-hipertrofi', 'dogan-vucut-gelistirme-programi', {
    name: 'Doğan Vücut Geliştirme (Hipertrofi)',
    goal: 'hipertrofi' as ProgramGoal,
    level: 'orta' as ProgramLevel,
    daysPerWeek: 3,
    durationWeeks: 12,
    description:
      'Charles Poliquin ve Christian Thibaudeau metodolojisine dayanan, haftada 3 gün uygulanan hipertrofi dönemi. Pazartesi-Cuma ve Çarşamba farklı.',
    tags: ['Doğan', 'Hipertrofi', '3 gün'],
    sourceSlug: 'dogan-vucut-gelistirme-programi',
    days: [
      {
        id: 'dogan-h-a',
        name: 'Gün A (Pazartesi / Cuma)',
        focus: 'Hipertrofi — tempo 4110, 90s ara',
        exercises: [
          ex('Leg Press', 2, '15', 90, 'Tempo 3010'),
          ex('Leg Curl', 3, '8', 90, 'Tempo 4110'),
          ex('Bench Press', 3, '8', 90, 'Tempo 4110'),
          ex('Underhand Pulldown', 3, '10', 90, 'Tempo 4110'),
          ex('Overhead Press', 2, '12', 90, 'Tempo 4010'),
          ex('Dumbbell Curl', 2, '8', 90, 'Tempo 4010'),
          ex('Seated Calf Raise', 2, '20', 90, 'Tempo 2010'),
          ex('Crunch', 2, '10', 60, 'Tempo 2110'),
        ],
      },
      {
        id: 'dogan-h-b',
        name: 'Gün B (Çarşamba)',
        focus: 'Hipertrofi — alternatif hareketler',
        exercises: [
          ex('Leg Press', 3, '8', 90, 'Tempo 4110'),
          ex('Romen Deadlifti', 2, '8', 90, 'Tempo 4110'),
          ex('Incline Bench Press', 2, '10', 90, 'Tempo 4110'),
          ex('Bent-Over Row', 2, '12', 90, 'Tempo 4010'),
          ex('Dumbbell Shoulder Press', 2, '12', 90, 'Tempo 4010'),
          ex('Standing Calf Raise', 3, '8', 90, 'Tempo 4010'),
          ex('Triceps Pushdown', 3, '8', 90, 'Tempo 4010'),
          ex('Reverse Crunch', 2, '10', 60, 'Tempo 2110'),
        ],
      },
    ],
  }),
  program('kvk-dogan-kuvvet', 'dogan-vucut-gelistirme-programi', {
    name: 'Doğan Vücut Geliştirme (Kuvvet)',
    goal: 'kuvvet' as ProgramGoal,
    level: 'orta' as ProgramLevel,
    daysPerWeek: 3,
    durationWeeks: 6,
    description:
      'Doğan programının kuvvet dönemi. 3 hafta hipertrofi sonrası uygulanır. Tempo 5010, dinlenme 90-120s.',
    tags: ['Doğan', 'Kuvvet', '3 gün'],
    sourceSlug: 'dogan-vucut-gelistirme-programi',
    days: [
      {
        id: 'dogan-k-a',
        name: 'Gün A (Pazartesi / Cuma)',
        focus: 'Kuvvet — ağır, tempo 5010',
        exercises: [
          ex('Leg Press', 3, '6', 90, 'Tempo 5010'),
          ex('Leg Curl', 3, '5', 120, 'Tempo 5010'),
          ex('Bench Press', 3, '5', 120, 'Tempo 5010'),
          ex('Underhand Pulldown', 3, '6', 90, 'Tempo 5010'),
          ex('Overhead Press', 3, '6', 90, 'Tempo 5010'),
          ex('Dumbbell Curl', 3, '5', 120, 'Tempo 5010'),
          ex('Seated Calf Raise', 3, '8', 90, 'Tempo 5010'),
          ex('Crunch', 3, '5', 90, 'Tempo 2110'),
        ],
      },
      {
        id: 'dogan-k-b',
        name: 'Gün B (Çarşamba)',
        focus: 'Kuvvet — alternatif hareketler',
        exercises: [
          ex('Leg Press', 3, '6', 90, 'Tempo 5010'),
          ex('Romen Deadlifti', 3, '5', 120, 'Tempo 5010'),
          ex('Incline Bench Press', 3, '5', 120, 'Tempo 5010'),
          ex('Bent-Over Row', 3, '5', 90, 'Tempo 5010'),
          ex('Dumbbell Shoulder Press', 3, '6', 90, 'Tempo 5010'),
          ex('Standing Calf Raise', 3, '5', 120, 'Tempo 5010'),
          ex('Triceps Pushdown', 3, '5', 120, 'Tempo 5010'),
          ex('Reverse Crunch', 3, '5', 90, 'Tempo 2110'),
        ],
      },
    ],
  }),
  program('kvk-yeni-baslayan', 'yeni-baslayanlar-icin-vucut-gelistirme', {
    name: 'Yeni Başlayanlar Full-Body',
    goal: 'genel' as ProgramGoal,
    level: 'baslangic' as ProgramLevel,
    daysPerWeek: 3,
    durationWeeks: 12,
    description:
      'Reg Park tarzı tüm-vücut programı. Aşama 1: 2x10 hafif kilo, teknik odak. Haftada 3 gün, günler arası dinlenme.',
    tags: ['Başlangıç', 'Full-Body', 'Reg Park'],
    sourceSlug: 'yeni-baslayanlar-icin-vucut-gelistirme',
    days: [
      {
        id: 'kvk-beg-full',
        name: 'Full-Body (Aşama 1)',
        focus: '2 set x 10 tekrar — hafif, teknik öğren',
        exercises: [
          ex('Squat', 2, '10', 120, 'Set arası 2 dk'),
          ex('Bench Press', 2, '10', 120),
          ex('Bent-Over Row', 2, '10', 120),
          ex('Overhead Press', 2, '10', 120),
          ex('Romen Deadlifti', 2, '10', 120),
          ex('Barbell Curl', 2, '10', 90),
          ex('Calf Raise', 2, '10', 90),
        ],
      },
    ],
  }),
  program('kvk-stronglifts', 'stronglifts-5x5', {
    name: 'Stronglifts 5×5',
    goal: 'kuvvet' as ProgramGoal,
    level: 'baslangic' as ProgramLevel,
    daysPerWeek: 3,
    durationWeeks: 12,
    description:
      'Klasik 5×5 kuvvet programı. A ve B antrenmanları dönüşümlü. Her antrenmanda ağırlık artışı hedeflenir.',
    tags: ['5×5', 'Kuvvet', 'StrongLifts'],
    sourceSlug: 'stronglifts-5x5',
    days: [
      {
        id: 'sl-a',
        name: 'Çalışma A',
        focus: 'Squat, Bench, Row',
        exercises: [
          ex('Squat', 5, '5', 90, 'Her antrenmanda +2 kg'),
          ex('Bench Press', 5, '5', 90),
          ex('Barbell Row', 5, '5', 90),
        ],
      },
      {
        id: 'sl-b',
        name: 'Çalışma B',
        focus: 'Squat, OHP, Deadlift',
        exercises: [
          ex('Squat', 5, '5', 90, 'Her antrenmanda +2 kg'),
          ex('Overhead Press', 5, '5', 90),
          ex('Deadlift', 1, '5', 180, 'Sadece 1 set'),
        ],
      },
    ],
  }),
  program('kvk-madcow', 'madcow-5x5-orta', {
    name: 'Madcow 5×5 Orta Seviye',
    goal: 'kuvvet' as ProgramGoal,
    level: 'orta' as ProgramLevel,
    daysPerWeek: 3,
    durationWeeks: 12,
    description:
      'Stronglifts sonrası orta seviye kuvvet programı. Haftalık %2.5 ağırlık artışı. Pazartesi ağır 5×5, Cuma 3×5.',
    tags: ['Madcow', '5×5', 'Orta'],
    sourceSlug: 'madcow-5x5-orta',
    days: [
      {
        id: 'mc-pzt',
        name: 'Pazartesi (Ağır 5×5)',
        focus: 'Squat, Bench, Barbell Row — ramping sets',
        exercises: [
          ex('Squat', 5, '5', 120, 'En ağır set Cuma 3×5 + %2.5'),
          ex('Bench Press', 5, '5', 120),
          ex('Barbell Row', 5, '5', 120),
          ex('Hyper-extension', 2, '12', 60, 'Yardımcı'),
          ex('Crunch', 4, '12', 60, 'Yardımcı'),
        ],
      },
      {
        id: 'mc-car',
        name: 'Çarşamba (Hafif)',
        focus: 'Overhead Press & Deadlift %2.5 artış',
        exercises: [
          ex('Overhead Press', 4, '5', 120),
          ex('Deadlift', 4, '5', 150),
        ],
      },
      {
        id: 'mc-cum',
        name: 'Cuma (3×5 Ağır)',
        focus: 'Pazartesi 5×5 ağırlığının %102.5\'i',
        exercises: [
          ex('Squat', 3, '5', 150),
          ex('Bench Press', 3, '5', 150),
          ex('Barbell Row', 3, '5', 150),
        ],
      },
    ],
  }),
  program('kvk-5x5-hacim', '5x5-hacim-programi', {
    name: 'İleri Seviye 5×5 Hacim',
    goal: 'hipertrofi' as ProgramGoal,
    level: 'ileri' as ProgramLevel,
    daysPerWeek: 4,
    durationWeeks: 8,
    description:
      'Christian Thibaudeau / Charles Poliquin Alman Hacim adaptasyonu. Süpersetler. BW×1 bench ve BW×1.5 squat şart.',
    tags: ['Hacim', 'Süperset', 'İleri'],
    sourceSlug: '5x5-hacim-programi',
    days: [
      {
        id: 'hacim-1',
        name: 'Gün 1 — Göğüs & Sırt',
        focus: 'Süperset A1/A2 formatı',
        exercises: [
          ex('Flat Bench Press', 5, '5', 120, 'A1 — ağır'),
          ex('Dumbbell Fly', 3, '8-10', 60, 'A2 süperset'),
          ex('Incline Bench Press', 3, '8-10', 90, 'B1'),
          ex('Lat Pulldown', 3, '10-12', 60, 'B2 süperset'),
        ],
      },
      {
        id: 'hacim-2',
        name: 'Gün 2 — Bacak & Karın',
        focus: 'Front squat + lunges süperset',
        exercises: [
          ex('Front Squat', 5, '5', 150, 'A1'),
          ex('Lunges', 3, '8/bacak', 90, 'A2 süperset'),
          ex('Leg Curl', 3, '10-12', 60, 'B2'),
          ex('Crunches', 3, '15', 45),
          ex('Plank', 3, 'max', 45),
        ],
      },
      {
        id: 'hacim-4',
        name: 'Gün 4 — Biceps & Triceps',
        focus: 'Kol hacmi',
        exercises: [
          ex('Barbell Curl', 3, '8-10', 60, 'A1'),
          ex('Dumbbell Curl', 3, '10-12', 60, 'A2'),
          ex('Weighted Dips', 3, '8-10', 90, 'C1'),
          ex('Cable Pressdown', 3, '12-15', 60, 'D2'),
        ],
      },
      {
        id: 'hacim-6',
        name: 'Gün 6 — Omuz',
        focus: 'Omuz hacmi',
        exercises: [
          ex('Overhead Press', 5, '5', 120, 'A1'),
          ex('Incline Lateral Raise', 3, '12-15', 45, 'A2'),
          ex('Alternate Dumbbell Shoulder Press', 3, '8-10', 90, 'B1'),
          ex('Cable Front Raise', 3, '12', 45, 'B2'),
        ],
      },
    ],
  }),
  program('kvk-aletsiz', 'aletsiz-vucut-gelistirme', {
    name: 'Evde Aletsiz Vücut Geliştirme',
    goal: 'genel' as ProgramGoal,
    level: 'baslangic' as ProgramLevel,
    daysPerWeek: 3,
    durationWeeks: 8,
    description: 'Ekipman gerektirmeyen vücut ağırlığı programı. Haftada 3 gün, günler arası 1 gün dinlenme.',
    tags: ['Evde', 'Aletsiz', 'Vücut ağırlığı'],
    sourceSlug: 'aletsiz-vucut-gelistirme',
    days: [
      {
        id: 'aletsiz-full',
        name: 'Full-Body Aletsiz',
        focus: 'Şınav, squat, barfiks — set arası 60s',
        exercises: [
          ex('Şınav', 3, '10', 60),
          ex('Split Squat', 2, '15', 60),
          ex('Pistol Squat', 2, '15', 60, 'Yapamazsanız split squat'),
          ex('Barfiks', 3, '10', 90, 'Yardım alabilirsiniz'),
          ex('Pike Push-Up', 3, '10', 60),
          ex('Plank', 2, 'max', 45),
          ex('Hip Thrust', 2, '10', 60),
          ex('Calf Raise', 2, '15', 45),
        ],
      },
    ],
  }),
  program('kvk-evde-dambil', 'evde-fitness-vucut-gelistirme-programi', {
    name: 'Evde Dambıl Programı',
    goal: 'kas' as ProgramGoal,
    level: 'baslangic' as ProgramLevel,
    daysPerWeek: 3,
    durationWeeks: 12,
    description:
      'Ev ortamında ayarlanabilir dambıl ile başlangıç seviyesi. 1. seviye 1-3 ay, sonra 2. seviyeye geçiş.',
    tags: ['Evde', 'Dambıl', 'Başlangıç'],
    sourceSlug: 'evde-fitness-vucut-gelistirme-programi',
    days: [
      {
        id: 'evde-ust',
        name: 'Üst Vücut Günü',
        focus: 'Omuz, göğüs, kol',
        exercises: [
          ex('Dumbbell Bench Press', 3, '10', 90),
          ex('Dumbbell Shoulder Press', 3, '10', 90),
          ex('Dumbbell Row', 3, '10', 90),
          ex('Dumbbell Curl', 2, '12', 60),
          ex('Overhead Triceps Extension', 2, '12', 60),
        ],
      },
      {
        id: 'evde-alt',
        name: 'Alt Vücut Günü',
        focus: 'Bacak, baldır, bel, karın',
        exercises: [
          ex('Goblet Squat', 3, '12', 90),
          ex('Dumbbell Lunge', 3, '10/bacak', 90),
          ex('Dumbbell RDL', 3, '10', 90),
          ex('Calf Raise', 3, '15', 60),
          ex('Plank', 3, '45 sn', 45),
        ],
      },
    ],
  }),
];

export const KVK_CATALOG: KvkProgramMeta[] = KVK_PROGRAMS.map((p) => ({
  slug: p.sourceSlug,
  sourceUrl: p.sourceUrl,
}));

export function getKvkProgramById(id: string): KvkWorkoutProgram | undefined {
  return KVK_PROGRAMS.find((p) => p.id === id);
}

export function getKvkProgramsByGoal(goal: ProgramGoal | 'all'): KvkWorkoutProgram[] {
  if (goal === 'all') return KVK_PROGRAMS;
  return KVK_PROGRAMS.filter((p) => p.goal === goal);
}

/** Site erişilebilirliğini kontrol eder; program verisi her zaman yerel katalogdan gelir */
export async function syncKvkCatalog(): Promise<{ online: boolean; programCount: number; syncedAt: string }> {
  let online = false;
  try {
    const res = await fetch(BASE_URL, { method: 'HEAD' });
    online = res.ok;
  } catch {
    online = false;
  }
  return {
    online,
    programCount: KVK_PROGRAMS.length,
    syncedAt: new Date().toISOString(),
  };
}


import { DayType, Meal, MealType } from '../types';
import { restDayPlan, workoutDayPlan } from './meals';

export interface CatalogMeal extends Meal {
  mealType: MealType;
  dayTypes: DayType[];
  tags: string[];
}

const ing = (name: string, amount: number, unit: Meal['ingredients'][0]['unit'], note?: string) => ({
  name,
  amount,
  unit,
  note,
});

/** Haftalık planda olmayan ek tarifler */
const EXTRA_MEALS: CatalogMeal[] = [
  {
    id: 'cat-protein-pancake',
    name: 'Protein Pankek',
    description: 'Yulaf ve yumurtayla hızlı, yüksek proteinli kahvaltı',
    calories: 390,
    protein: 32,
    carbs: 35,
    fat: 12,
    prepTime: 12,
    mealType: 'kahvalti',
    dayTypes: ['spor', 'dinlenme'],
    tags: ['Kahvaltı', 'Protein', 'Hızlı'],
    ingredients: [
      ing('Yulaf ezmesi', 40, 'g'),
      ing('Yumurta', 2, 'adet'),
      ing('Muz', 0.5, 'adet'),
      ing('Süt', 100, 'ml'),
      ing('Tarçın', 1, 'çay kaşığı'),
    ],
  },
  {
    id: 'cat-ton-salata',
    name: 'Ton Balıklı Yeşil Salata',
    description: 'Omega-3 ve protein açısından zengin hafif öğün',
    calories: 320,
    protein: 35,
    carbs: 18,
    fat: 12,
    prepTime: 10,
    mealType: 'ogle',
    dayTypes: ['spor', 'dinlenme'],
    tags: ['Salata', 'Protein', 'Hafif'],
    ingredients: [
      ing('Ton balığı', 120, 'g', 'suyu süzülmüş'),
      ing('Marul', 100, 'g'),
      ing('Salatalık', 0.5, 'adet'),
      ing('Zeytinyağı', 1, 'yemek kaşığı'),
      ing('Limon', 0.5, 'adet'),
    ],
  },
  {
    id: 'cat-hindi-wrap',
    name: 'Hindi Wrap',
    description: 'Taşınabilir, dengeli öğle yemeği',
    calories: 410,
    protein: 38,
    carbs: 42,
    fat: 10,
    prepTime: 15,
    mealType: 'ogle',
    dayTypes: ['spor'],
    tags: ['Wrap', 'Protein', 'Pratik'],
    ingredients: [
      ing('Tam buğday lavaş', 1, 'adet'),
      ing('Hindi göğsü', 120, 'g'),
      ing('Avokado', 0.5, 'adet'),
      ing('Domates', 0.5, 'adet'),
      ing('Marul', 50, 'g'),
    ],
  },
  {
    id: 'cat-sebze-omlet',
    name: 'Sebzeli Omlet',
    description: 'Düşük karbonhidratlı, doyurucu kahvaltı alternatifi',
    calories: 340,
    protein: 26,
    carbs: 12,
    fat: 20,
    prepTime: 12,
    mealType: 'kahvalti',
    dayTypes: ['dinlenme'],
    tags: ['Kahvaltı', 'Düşük karb'],
    ingredients: [
      ing('Yumurta', 3, 'adet'),
      ing('Ispanak', 50, 'g'),
      ing('Mantar', 50, 'g'),
      ing('Beyaz peynir', 30, 'g'),
      ing('Zeytinyağı', 1, 'yemek kaşığı'),
    ],
  },
  {
    id: 'cat-tavuk-sebze',
    name: 'Fırında Tavuk & Sebze',
    description: 'Tek tepside pratik akşam yemeği',
    calories: 460,
    protein: 42,
    carbs: 28,
    fat: 18,
    prepTime: 40,
    mealType: 'aksam',
    dayTypes: ['spor', 'dinlenme'],
    tags: ['Akşam', 'Fırın', 'Protein'],
    ingredients: [
      ing('Tavuk but', 180, 'g', 'derisiz'),
      ing('Brokoli', 150, 'g'),
      ing('Havuç', 1, 'adet'),
      ing('Patates', 150, 'g'),
      ing('Zeytinyağı', 1, 'yemek kaşığı'),
    ],
  },
  {
    id: 'cat-balik-sebze',
    name: 'Izgara Levrek & Roka',
    description: 'Hafif protein, düşük yağ akşam seçeneği',
    calories: 380,
    protein: 40,
    carbs: 8,
    fat: 16,
    prepTime: 25,
    mealType: 'aksam',
    dayTypes: ['dinlenme'],
    tags: ['Balık', 'Hafif', 'Akşam'],
    ingredients: [
      ing('Levrek fileto', 180, 'g'),
      ing('Roka', 80, 'g'),
      ing('Cherry domates', 100, 'g'),
      ing('Zeytinyağı', 1, 'yemek kaşığı'),
      ing('Limon', 0.5, 'adet'),
    ],
  },
  {
    id: 'cat-yogurt-parfait',
    name: 'Yoğurt Parfait',
    description: 'Protein ve lif dolu ara öğün',
    calories: 240,
    protein: 18,
    carbs: 28,
    fat: 8,
    prepTime: 5,
    mealType: 'araOgun',
    dayTypes: ['spor', 'dinlenme'],
    tags: ['Ara öğün', 'Hızlı', 'Protein'],
    ingredients: [
      ing('Yunan yoğurdu', 150, 'g'),
      ing('Yulaf ezmesi', 20, 'g'),
      ing('Çilek', 80, 'g'),
      ing('Bal', 1, 'yemek kaşığı'),
    ],
  },
  {
    id: 'cat-fistik-muz',
    name: 'Fıstık Ezmesi & Muz',
    description: 'Antrenman öncesi hızlı enerji',
    calories: 310,
    protein: 10,
    carbs: 38,
    fat: 14,
    prepTime: 2,
    mealType: 'araOgun',
    dayTypes: ['spor'],
    tags: ['Ara öğün', 'Enerji', 'Hızlı'],
    ingredients: [
      ing('Tam buğday ekmeği', 2, 'dilim'),
      ing('Fıstık ezmesi', 30, 'g'),
      ing('Muz', 1, 'adet'),
    ],
  },
  {
    id: 'cat-cottage-peynir',
    name: 'Cottage Peynir & Ceviz',
    description: 'Gece ara öğünü için hafif protein',
    calories: 220,
    protein: 22,
    carbs: 8,
    fat: 12,
    prepTime: 3,
    mealType: 'araOgun',
    dayTypes: ['dinlenme'],
    tags: ['Ara öğün', 'Protein', 'Gece'],
    ingredients: [
      ing('Cottage peynir', 150, 'g'),
      ing('Ceviz', 15, 'g'),
      ing('Tarçın', 1, 'çay kaşığı'),
    ],
  },
  {
    id: 'cat-kinoa-tavuk',
    name: 'Kinoa Bowl (Tavuk)',
    description: 'Kompakt öğün — meal prep uyumlu',
    calories: 495,
    protein: 40,
    carbs: 48,
    fat: 14,
    prepTime: 30,
    mealType: 'ogle',
    dayTypes: ['spor'],
    tags: ['Bowl', 'Meal prep', 'Protein'],
    ingredients: [
      ing('Tavuk göğsü', 140, 'g'),
      ing('Kinoa', 70, 'g', 'kuru'),
      ing('Avokado', 0.5, 'adet'),
      ing('Mısır', 50, 'g'),
      ing('Limon', 0.5, 'adet'),
    ],
  },
  {
    id: 'cat-mantar-risotto',
    name: 'Mantarlı Bulgur Pilavı',
    description: 'Vejetaryen dostu dinlenme günü akşamı',
    calories: 390,
    protein: 14,
    carbs: 58,
    fat: 10,
    prepTime: 35,
    mealType: 'aksam',
    dayTypes: ['dinlenme'],
    tags: ['Vejetaryen', 'Akşam', 'Bulgur'],
    ingredients: [
      ing('Bulgur', 80, 'g'),
      ing('Mantar', 150, 'g'),
      ing('Soğan', 0.5, 'adet'),
      ing('Zeytinyağı', 1, 'yemek kaşığı'),
      ing('Maydanoz', 1, 'demet', 'küçük'),
    ],
  },
  {
    id: 'cat-smoothie-protein',
    name: 'Yeşil Protein Smoothie',
    description: 'Antrenman sonrası hızlı toparlanma içeceği',
    calories: 290,
    protein: 30,
    carbs: 32,
    fat: 6,
    prepTime: 5,
    mealType: 'araOgun',
    dayTypes: ['spor'],
    tags: ['Smoothie', 'Protein', 'Antrenman sonrası'],
    ingredients: [
      ing('Protein tozu', 30, 'g'),
      ing('Ispanak', 30, 'g'),
      ing('Muz', 1, 'adet'),
      ing('Süt', 200, 'ml'),
      ing('Buz', 5, 'adet'),
    ],
  },
];

function mealsFromPlan(plan: typeof workoutDayPlan, dayType: DayType): CatalogMeal[] {
  return (Object.entries(plan.meals) as [MealType, Meal][]).map(([mealType, meal]) => ({
    ...meal,
    mealType,
    dayTypes: [dayType],
    tags: dayType === 'spor' ? ['Spor günü', 'Plan'] : ['Dinlenme günü', 'Plan'],
  }));
}

const PLAN_MEALS = [...mealsFromPlan(workoutDayPlan, 'spor'), ...mealsFromPlan(restDayPlan, 'dinlenme')];

export const MEAL_CATALOG: CatalogMeal[] = [...PLAN_MEALS, ...EXTRA_MEALS];

export const MEAL_TYPE_FILTERS: { key: MealType | 'all'; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'kahvalti', label: 'Kahvaltı' },
  { key: 'ogle', label: 'Öğle' },
  { key: 'aksam', label: 'Akşam' },
  { key: 'araOgun', label: 'Ara Öğün' },
];

export const DAY_TYPE_FILTERS: { key: DayType | 'all'; label: string }[] = [
  { key: 'all', label: 'Tüm günler' },
  { key: 'spor', label: 'Spor günü' },
  { key: 'dinlenme', label: 'Dinlenme' },
];

export function filterCatalog(
  meals: CatalogMeal[],
  mealType: MealType | 'all',
  dayType: DayType | 'all',
  search: string
): CatalogMeal[] {
  const q = search.trim().toLowerCase();
  return meals.filter((m) => {
    if (mealType !== 'all' && m.mealType !== mealType) return false;
    if (dayType !== 'all' && !m.dayTypes.includes(dayType)) return false;
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.tags.some((t) => t.toLowerCase().includes(q)) ||
      m.ingredients.some((i) => i.name.toLowerCase().includes(q))
    );
  });
}

export function getCatalogMealById(id: string): CatalogMeal | undefined {
  return MEAL_CATALOG.find((m) => m.id === id);
}

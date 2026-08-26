import { IngredientUnit, MealIngredient, ShoppingItem } from '../types';

export function categorizeIngredient(name: string): ShoppingItem['category'] {
  const lower = name.toLowerCase();
  if (['tavuk', 'somon', 'yumurta', 'peynir', 'kıyma', 'protein', 'yoğurt', 'kefir', 'köfte'].some((k) => lower.includes(k))) {
    return 'protein';
  }
  if (['domates', 'salatalık', 'brokoli', 'marul', 'maydanoz', 'soğan', 'havuç', 'muz', 'elma', 'çilek', 'yeşillik', 'sarımsak', 'limon'].some((k) => lower.includes(k))) {
    return 'sebze';
  }
  if (['yulaf', 'quinoa', 'bulgur', 'ekmek', 'chia', 'mercimek'].some((k) => lower.includes(k))) {
    return 'tahil';
  }
  if (['yoğurt', 'peynir', 'kefir'].some((k) => lower.includes(k))) {
    return 'sut';
  }
  return 'diger';
}

const UNIT_LABELS: Record<IngredientUnit, string> = {
  g: 'g',
  kg: 'kg',
  ml: 'ml',
  L: 'L',
  adet: 'adet',
  dilim: 'dilim',
  'yemek kaşığı': 'yk',
  'çay kaşığı': 'çk',
  paket: 'paket',
  demet: 'demet',
  diş: 'diş',
};

export function formatAmount(amount: number, unit: IngredientUnit): string {
  const rounded = Math.round(amount * 10) / 10;
  const display = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace('.0', '');

  if (unit === 'g' && amount >= 1000) {
    const kg = Math.round((amount / 1000) * 10) / 10;
    return `${kg} kg`;
  }
  if (unit === 'ml' && amount >= 1000) {
    const liters = Math.round((amount / 1000) * 10) / 10;
    return `${liters} L`;
  }

  const label = UNIT_LABELS[unit];
  if (unit === 'yemek kaşığı' || unit === 'çay kaşığı') {
    return `${display} ${label}`;
  }
  return `${display} ${label}`;
}

export function formatIngredient(ing: MealIngredient): string {
  const amount = formatAmount(ing.amount, ing.unit);
  if (ing.note) return `${ing.name} — ${amount} (${ing.note})`;
  return `${ing.name} — ${amount}`;
}

function purchaseHint(name: string, amount: number, unit: IngredientUnit): string | undefined {
  const lower = name.toLowerCase();

  if (unit === 'g') {
    if (lower.includes('tavuk') || lower.includes('somon')) {
      const packs = Math.ceil(amount / 500);
      return packs === 1 ? '≈ 1 paket (500 g)' : `≈ ${packs} paket (500 g)`;
    }
    if (lower.includes('kıyma')) {
      return amount <= 500 ? '≈ 1 paket (500 g)' : `≈ ${Math.ceil(amount / 500)} paket (500 g)`;
    }
    if (lower.includes('yulaf')) {
      return amount <= 500 ? '1 paket (500 g) yeterli' : '2 paket (500 g) al';
    }
    if (lower.includes('quinoa') || lower.includes('bulgur') || lower.includes('mercimek')) {
      return amount <= 500 ? '1 paket (500 g) yeterli' : `≈ ${Math.ceil(amount / 500)} paket`;
    }
  }

  if (unit === 'adet') {
    if (lower.includes('yumurta')) {
      const packs = Math.ceil(amount / 10);
      return packs === 1 ? '1 koli (10\'lu)' : `${packs} koli (10\'lu)`;
    }
    if (lower.includes('muz') || lower.includes('elma') || lower.includes('limon')) {
      return `≈ ${Math.ceil(amount)} adet al`;
    }
  }

  if (unit === 'ml' && lower.includes('kefir')) {
    return amount <= 1000 ? '1 şişe (1 L)' : `${Math.ceil(amount / 1000)} şişe (1 L)`;
  }

  return undefined;
}

export function aggregateIngredients(
  ingredients: MealIngredient[],
  dayCount: number
): Map<string, { name: string; unit: IngredientUnit; amount: number; category: ShoppingItem['category'] }> {
  const map = new Map<string, { name: string; unit: IngredientUnit; amount: number; category: ShoppingItem['category'] }>();

  for (const ing of ingredients) {
    const key = `${ing.name.toLowerCase()}|${ing.unit}`;
    const existing = map.get(key);
    if (existing) {
      existing.amount += ing.amount * dayCount;
    } else {
      map.set(key, {
        name: ing.name,
        unit: ing.unit,
        amount: ing.amount * dayCount,
        category: categorizeIngredient(ing.name),
      });
    }
  }

  return map;
}

export function buildWeeklyShoppingItems(
  workoutPlanIngredients: MealIngredient[],
  workoutDayCount: number,
  restPlanIngredients: MealIngredient[],
  restDayCount: number
): Omit<ShoppingItem, 'id' | 'checked'>[] {
  const merged = new Map<string, { name: string; unit: IngredientUnit; amount: number; category: ShoppingItem['category'] }>();

  const mergeMap = (source: Map<string, { name: string; unit: IngredientUnit; amount: number; category: ShoppingItem['category'] }>) => {
    source.forEach((value, key) => {
      const existing = merged.get(key);
      if (existing) existing.amount += value.amount;
      else merged.set(key, { ...value });
    });
  };

  mergeMap(aggregateIngredients(workoutPlanIngredients, workoutDayCount));
  mergeMap(aggregateIngredients(restPlanIngredients, restDayCount));

  return Array.from(merged.values())
    .sort((a, b) => a.name.localeCompare(b.name, 'tr'))
    .map((item) => ({
      name: item.name,
      quantity: formatAmount(item.amount, item.unit),
      purchaseHint: purchaseHint(item.name, item.amount, item.unit),
      category: item.category,
    }));
}

export function collectPlanIngredients(plan: { meals: Record<string, { ingredients: MealIngredient[] }> }): MealIngredient[] {
  return Object.values(plan.meals).flatMap((meal) => meal.ingredients);
}

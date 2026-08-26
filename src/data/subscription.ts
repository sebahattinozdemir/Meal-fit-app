export type SubscriptionPlan = 'free' | 'pro_monthly' | 'pro_yearly';

export type ProFeature =
  | 'all_programs'
  | 'program_path'
  | 'extra_recipes'
  | 'smart_reminders'
  | 'progress_advanced';

export interface SubscriptionState {
  plan: SubscriptionPlan;
  isPro: boolean;
  expiresAt: string | null;
  updatedAt: string;
}

export const FREE_PROGRAM_IDS = ['kvk-yeni-baslayan', 'kvk-aletsiz'] as const;

export const PRO_PRICE = {
  monthly: { amount: 99, currency: '₺', period: 'ay', label: 'Aylık Pro' },
  yearly: { amount: 799, currency: '₺', period: 'yıl', label: 'Yıllık Pro', badge: 'En avantajlı' },
} as const;

/** App Store Connect / Play Console product IDs — must match RevenueCat offering */
export const STORE_PRODUCT_IDS = {
  monthly: 'com.mealfit.app.pro.monthly',
  yearly: 'com.mealfit.app.pro.yearly',
  entitlement: 'pro',
} as const;

export const PRO_FEATURES: { icon: string; title: string; subtitle: string; feature: ProFeature }[] = [
  {
    icon: 'barbell',
    title: 'Tüm antrenman programları',
    subtitle: 'Demir 5×5, Titan, hacim ve ev programları',
    feature: 'all_programs',
  },
  {
    icon: 'git-network-outline',
    title: 'İlerleme yolu',
    subtitle: 'Deneyim seviyene göre kilit açma sistemi',
    feature: 'program_path',
  },
  {
    icon: 'restaurant',
    title: '20+ ekstra tarif',
    subtitle: 'Plana ek olarak tüm tarif kataloğu',
    feature: 'extra_recipes',
  },
  {
    icon: 'notifications',
    title: 'Akıllı hatırlatmalar',
    subtitle: 'Antrenman kalıbı, öğün ve seri koruma bildirimleri',
    feature: 'smart_reminders',
  },
  {
    icon: 'trending-up',
    title: 'Gelişmiş gelişim takibi',
    subtitle: 'Ağırlık rekorları ve detaylı grafikler',
    feature: 'progress_advanced',
  },
];

export const FREE_FEATURES: string[] = [
  'Haftalık yemek planı (spor + dinlenme)',
  'Alışveriş listesi (gram/adet)',
  'İlk Adım programı',
  'Antrenman kaydı',
];

export const DEFAULT_SUBSCRIPTION: SubscriptionState = {
  plan: 'free',
  isPro: false,
  expiresAt: null,
  updatedAt: new Date().toISOString(),
};

export function isFreeProgram(programId: string): boolean {
  return (FREE_PROGRAM_IDS as readonly string[]).includes(programId);
}

export function featureRequiresPro(feature: ProFeature): boolean {
  return true;
}

export function proFeatureLabel(feature: ProFeature): string {
  return PRO_FEATURES.find((f) => f.feature === feature)?.title ?? 'Pro özellik';
}

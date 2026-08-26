import Constants from 'expo-constants';

export const APP_BUNDLE_ID = 'com.mealfit.app';

export const REVENUECAT_ENTITLEMENT_ID = 'pro';

export const IAP_PRODUCT_IDS = {
  monthly: 'com.mealfit.app.pro.monthly',
  yearly: 'com.mealfit.app.pro.yearly',
} as const;

export type StorePlan = keyof typeof IAP_PRODUCT_IDS;

const extra = Constants.expoConfig?.extra ?? {};

export const LEGAL_URLS = {
  privacy:
    process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ??
    (extra.privacyPolicyUrl as string | undefined) ??
    'https://mealfit.app/privacy',
  terms:
    process.env.EXPO_PUBLIC_TERMS_URL ??
    (extra.termsUrl as string | undefined) ??
    'https://mealfit.app/terms',
  supportEmail: (extra.supportEmail as string | undefined) ?? 'support@mealfit.app',
} as const;

export const REVENUECAT_API_KEYS = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? '',
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? '',
} as const;

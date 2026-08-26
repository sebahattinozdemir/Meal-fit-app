import Constants from 'expo-constants';
import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOfferings,
  PurchasesPackage,
} from 'react-native-purchases';
import {
  IAP_PRODUCT_IDS,
  REVENUECAT_API_KEYS,
  REVENUECAT_ENTITLEMENT_ID,
  StorePlan,
} from '../constants/store';
import { PRO_PRICE } from '../data/subscription';

export type StorePrice = {
  amount: number;
  currency: string;
  period: string;
  label: string;
  badge?: string;
  priceString: string;
};

export type StorePrices = {
  monthly: StorePrice;
  yearly: StorePrice;
  source: 'store' | 'fallback';
};

let configured = false;

function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

function forceMockMode(): boolean {
  return process.env.EXPO_PUBLIC_IAP_MODE === 'mock';
}

export function isNativeStoreAvailable(): boolean {
  if (Platform.OS === 'web') return false;
  if (isExpoGo()) return false;
  if (forceMockMode()) return false;
  const key = Platform.OS === 'ios' ? REVENUECAT_API_KEYS.ios : REVENUECAT_API_KEYS.android;
  return key.length > 0;
}

function fallbackPrices(): StorePrices {
  return {
    monthly: {
      ...PRO_PRICE.monthly,
      label: PRO_PRICE.monthly.label,
      priceString: `${PRO_PRICE.monthly.currency}${PRO_PRICE.monthly.amount}/${PRO_PRICE.monthly.period}`,
    },
    yearly: {
      ...PRO_PRICE.yearly,
      label: PRO_PRICE.yearly.label,
      badge: PRO_PRICE.yearly.badge,
      priceString: `${PRO_PRICE.yearly.currency}${PRO_PRICE.yearly.amount}/${PRO_PRICE.yearly.period}`,
    },
    source: 'fallback',
  };
}

function packageForPlan(offerings: PurchasesOfferings | null, plan: StorePlan): PurchasesPackage | null {
  if (!offerings?.current) return null;
  const productId = IAP_PRODUCT_IDS[plan];
  const fromAll = offerings.current.availablePackages.find(
    (pkg) => pkg.product.identifier === productId
  );
  if (fromAll) return fromAll;

  if (plan === 'monthly') {
    return offerings.current.monthly ?? offerings.current.availablePackages[0] ?? null;
  }
  return offerings.current.annual ?? offerings.current.availablePackages[0] ?? null;
}

function priceFromPackage(
  pkg: PurchasesPackage | null,
  plan: StorePlan,
  fallback: StorePrice
): StorePrice {
  if (!pkg) return fallback;
  const period = plan === 'yearly' ? 'yıl' : 'ay';
  return {
    amount: fallback.amount,
    currency: fallback.currency,
    period,
    label: fallback.label,
    badge: fallback.badge,
    priceString: `${pkg.product.priceString}/${period}`,
  };
}

export function hasActiveProEntitlement(info: CustomerInfo | null): boolean {
  if (!info) return false;
  const entitlement = info.entitlements.active[REVENUECAT_ENTITLEMENT_ID];
  return entitlement?.isActive === true;
}

export function planFromCustomerInfo(info: CustomerInfo | null): 'pro_monthly' | 'pro_yearly' | 'free' {
  if (!hasActiveProEntitlement(info)) return 'free';
  const entitlement = info!.entitlements.active[REVENUECAT_ENTITLEMENT_ID];
  const productId = entitlement?.productIdentifier ?? '';
  if (productId.includes('yearly') || productId.includes('annual')) return 'pro_yearly';
  return 'pro_monthly';
}

export function expirationFromCustomerInfo(info: CustomerInfo | null): string | null {
  if (!info) return null;
  const entitlement = info.entitlements.active[REVENUECAT_ENTITLEMENT_ID];
  return entitlement?.expirationDate ?? null;
}

export async function configurePurchases(appUserId?: string | null): Promise<boolean> {
  if (!isNativeStoreAvailable()) return false;
  if (configured) {
    if (appUserId) {
      try {
        await Purchases.logIn(appUserId);
      } catch {
        // anonymous user is fine
      }
    }
    return true;
  }

  const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEYS.ios : REVENUECAT_API_KEYS.android;
  if (!apiKey) return false;

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  Purchases.configure({ apiKey, appUserID: appUserId ?? undefined });
  configured = true;
  return true;
}

export async function fetchStorePrices(): Promise<StorePrices> {
  const fallback = fallbackPrices();
  if (!isNativeStoreAvailable()) return fallback;

  try {
    await configurePurchases();
    const offerings = await Purchases.getOfferings();
    const monthlyPkg = packageForPlan(offerings, 'monthly');
    const yearlyPkg = packageForPlan(offerings, 'yearly');

    return {
      monthly: priceFromPackage(monthlyPkg, 'monthly', fallback.monthly),
      yearly: priceFromPackage(yearlyPkg, 'yearly', fallback.yearly),
      source: monthlyPkg || yearlyPkg ? 'store' : 'fallback',
    };
  } catch {
    return fallback;
  }
}

export async function purchaseStorePlan(plan: StorePlan): Promise<{
  success: boolean;
  customerInfo: CustomerInfo | null;
}> {
  if (!isNativeStoreAvailable()) {
    return { success: false, customerInfo: null };
  }

  await configurePurchases();
  const offerings = await Purchases.getOfferings();
  const pkg = packageForPlan(offerings, plan);
  if (!pkg) {
    throw new Error('Store ürünü bulunamadı. RevenueCat offering yapılandırmasını kontrol edin.');
  }

  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return { success: hasActiveProEntitlement(customerInfo), customerInfo };
}

export async function restoreStorePurchases(): Promise<CustomerInfo | null> {
  if (!isNativeStoreAvailable()) return null;
  await configurePurchases();
  const customerInfo = await Purchases.restorePurchases();
  return customerInfo;
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!isNativeStoreAvailable()) return null;
  await configurePurchases();
  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

export function getIapModeLabel(): 'store' | 'mock' {
  return isNativeStoreAvailable() ? 'store' : 'mock';
}

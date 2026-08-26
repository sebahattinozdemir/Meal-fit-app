import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_SUBSCRIPTION,
  ProFeature,
  SubscriptionPlan,
  SubscriptionState,
  proFeatureLabel,
} from '../data/subscription';
import { useAuth } from './AuthContext';
import {
  configurePurchases,
  expirationFromCustomerInfo,
  fetchStorePrices,
  getCustomerInfo,
  getIapModeLabel,
  hasActiveProEntitlement,
  isNativeStoreAvailable,
  planFromCustomerInfo,
  purchaseStorePlan,
  restoreStorePurchases,
  StorePrices,
} from '../services/purchases';
import {
  LEGACY_SUBSCRIPTION_KEY,
  subscriptionStorageKey,
} from '../utils/userStorage';

type PaywallTrigger = ProFeature | 'general';

interface SubscriptionContextType {
  isPro: boolean;
  plan: SubscriptionPlan;
  expiresAt: string | null;
  paywallVisible: boolean;
  paywallFeature: PaywallTrigger;
  storePrices: StorePrices;
  iapMode: 'store' | 'mock';
  showPaywall: (feature?: PaywallTrigger) => void;
  hidePaywall: () => void;
  purchasePro: (plan: 'monthly' | 'yearly') => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  canAccess: (feature: ProFeature) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function resolveSubscription(state: SubscriptionState): SubscriptionState {
  if (state.isPro && state.expiresAt && new Date(state.expiresAt) < new Date()) {
    return { ...DEFAULT_SUBSCRIPTION, updatedAt: new Date().toISOString() };
  }
  return state;
}

async function loadSubscription(userId: string | null): Promise<SubscriptionState> {
  if (!userId) return DEFAULT_SUBSCRIPTION;
  try {
    let raw = await AsyncStorage.getItem(subscriptionStorageKey(userId));
    if (!raw) {
      const legacy = await AsyncStorage.getItem(LEGACY_SUBSCRIPTION_KEY);
      if (legacy) {
        raw = legacy;
        await AsyncStorage.setItem(subscriptionStorageKey(userId), legacy);
      }
    }
    if (!raw) return DEFAULT_SUBSCRIPTION;
    const parsed = resolveSubscription({ ...DEFAULT_SUBSCRIPTION, ...(JSON.parse(raw) as SubscriptionState) });
    return parsed;
  } catch {
    return DEFAULT_SUBSCRIPTION;
  }
}

async function saveSubscription(userId: string, state: SubscriptionState): Promise<void> {
  await AsyncStorage.setItem(subscriptionStorageKey(userId), JSON.stringify(state));
}

function stateFromStore(plan: SubscriptionPlan, expiresAt: string | null): SubscriptionState {
  return {
    plan,
    isPro: plan !== 'free',
    expiresAt,
    updatedAt: new Date().toISOString(),
  };
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>(DEFAULT_SUBSCRIPTION);
  const [ready, setReady] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState<PaywallTrigger>('general');
  const [storePrices, setStorePrices] = useState<StorePrices>(() => ({
    monthly: {
      amount: 99,
      currency: '₺',
      period: 'ay',
      label: 'Aylık Pro',
      priceString: '₺99/ay',
    },
    yearly: {
      amount: 799,
      currency: '₺',
      period: 'yıl',
      label: 'Yıllık Pro',
      badge: 'En avantajlı',
      priceString: '₺799/yıl',
    },
    source: 'fallback',
  }));
  const iapMode = getIapModeLabel();

  const resolvedState = useMemo(() => resolveSubscription(state), [state]);
  const isPro = resolvedState.isPro;

  useEffect(() => {
    if (!resolvedState.isPro && state.isPro) {
      setState(resolvedState);
      if (user?.id) {
        saveSubscription(user.id, resolvedState).catch(() => undefined);
      }
    }
  }, [resolvedState, state.isPro, user?.id]);

  useEffect(() => {
    let active = true;

    (async () => {
      if (!user?.id) {
        if (active) {
          setState(DEFAULT_SUBSCRIPTION);
          setReady(true);
        }
        return;
      }

      setReady(false);
      const local = resolveSubscription(await loadSubscription(user.id));
      if (!active) return;

      if (isNativeStoreAvailable()) {
        await configurePurchases(user.id);
        const info = await getCustomerInfo();
        if (hasActiveProEntitlement(info)) {
          const synced = stateFromStore(
            planFromCustomerInfo(info),
            expirationFromCustomerInfo(info)
          );
          setState(synced);
          await saveSubscription(user.id, synced);
        } else {
          const freeState = { ...DEFAULT_SUBSCRIPTION, updatedAt: new Date().toISOString() };
          setState(freeState);
          await saveSubscription(user.id, freeState);
        }
        const prices = await fetchStorePrices();
        if (active) setStorePrices(prices);
      } else {
        setState(local);
      }

      if (active) setReady(true);
    })();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const showPaywall = useCallback((feature: PaywallTrigger = 'general') => {
    setPaywallFeature(feature);
    setPaywallVisible(true);
  }, []);

  const hidePaywall = useCallback(() => {
    setPaywallVisible(false);
  }, []);

  const applyPro = useCallback(
    async (plan: 'pro_monthly' | 'pro_yearly') => {
      if (!user?.id) return;
      const days = plan === 'pro_yearly' ? 365 : 30;
      const next: SubscriptionState = {
        plan,
        isPro: true,
        expiresAt: addDays(new Date(), days).toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setState(next);
      await saveSubscription(user.id, next);
      setPaywallVisible(false);
    },
    [user?.id]
  );

  const purchasePro = useCallback(
    async (plan: 'monthly' | 'yearly') => {
      if (!user?.id) return false;
      if (isNativeStoreAvailable()) {
        const { success, customerInfo } = await purchaseStorePlan(plan);
        if (success && customerInfo) {
          const next = stateFromStore(
            planFromCustomerInfo(customerInfo),
            expirationFromCustomerInfo(customerInfo)
          );
          setState(next);
          await saveSubscription(user.id, next);
          setPaywallVisible(false);
          return true;
        }
        return false;
      }

      await applyPro(plan === 'monthly' ? 'pro_monthly' : 'pro_yearly');
      return true;
    },
    [applyPro, user?.id]
  );

  const restorePurchases = useCallback(async () => {
    if (!user?.id) return false;

    if (isNativeStoreAvailable()) {
      const info = await restoreStorePurchases();
      if (hasActiveProEntitlement(info)) {
        const next = stateFromStore(
          planFromCustomerInfo(info),
          expirationFromCustomerInfo(info)
        );
        setState(next);
        await saveSubscription(user.id, next);
        setPaywallVisible(false);
        return true;
      }
      const freeState = { ...DEFAULT_SUBSCRIPTION, updatedAt: new Date().toISOString() };
      setState(freeState);
      await saveSubscription(user.id, freeState);
      return false;
    }

    const stored = resolveSubscription(await loadSubscription(user.id));
    setState(stored);
    return stored.isPro;
  }, [user?.id]);

  const canAccess = useCallback((_feature: ProFeature) => isPro, [isPro]);

  const value = useMemo(
    () => ({
      isPro,
      plan: resolvedState.plan,
      expiresAt: resolvedState.expiresAt,
      paywallVisible,
      paywallFeature,
      storePrices,
      iapMode,
      showPaywall,
      hidePaywall,
      purchasePro,
      restorePurchases,
      canAccess,
    }),
    [
      isPro,
      resolvedState,
      paywallVisible,
      paywallFeature,
      storePrices,
      iapMode,
      showPaywall,
      hidePaywall,
      purchasePro,
      restorePurchases,
      canAccess,
    ]
  );

  if (!ready) {
    return (
      <SubscriptionContext.Provider
        value={{
          isPro: false,
          plan: 'free',
          expiresAt: null,
          paywallVisible: false,
          paywallFeature: 'general',
          storePrices,
          iapMode,
          showPaywall,
          hidePaywall,
          purchasePro,
          restorePurchases,
          canAccess: () => false,
        }}
      >
        {children}
      </SubscriptionContext.Provider>
    );
  }

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}

export { proFeatureLabel };

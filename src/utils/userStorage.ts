export const LEGACY_PLAN_KEY = '@meal_fit_plan';
export const LEGACY_SUBSCRIPTION_KEY = '@meal_fit_subscription';

export function planStorageKey(userId: string): string {
  return `@meal_fit_plan:${userId}`;
}

export function subscriptionStorageKey(userId: string): string {
  return `@meal_fit_subscription:${userId}`;
}

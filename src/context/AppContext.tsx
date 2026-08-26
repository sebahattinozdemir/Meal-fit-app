import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from './AuthContext';
import { DEFAULT_WORKOUT_DAYS, restDayPlan, workoutDayPlan } from '../data/meals';
import { getProgramById } from '../data/workoutPrograms';
import { ShoppingItem, WorkoutLog, WorkoutProgram } from '../types';
import { DEFAULT_REMINDER_SETTINGS, ReminderSettings } from '../types/notifications';
import { PersonalizationPreferences } from '../types/personalization';
import { UserProfile } from '../types/profile';
import { BodyProgressEntry } from '../types/progress';
import { buildWeeklyShoppingItems, collectPlanIngredients } from '../utils/ingredients';
import { normalizeProfile } from '../utils/personalization';
import { seedProgressFromWeight } from '../utils/progressStats';
import {
  buildRecommendations,
  getNutritionTargets,
  NutritionTargets,
  ProfileRecommendation,
  recommendWorkoutDays,
} from '../utils/recommendations';
import { isSameWeek, toDateKey } from '../utils/date';
import { LEGACY_PLAN_KEY, planStorageKey } from '../utils/userStorage';
import {
  MAX_CUSTOM_PROGRAMS,
  normalizeCustomProgram,
  sanitizeCustomPrograms,
  validateCustomProgram,
} from '../utils/customPrograms';
import {
  ensureNotificationPermissions,
  getPermissionStatus,
  getScheduledReminderCount,
  rescheduleSmartReminders,
} from '../services/smartReminders';

const PROFILES_KEY = '@meal_fit_profiles';

export type NewWorkoutLog = Omit<WorkoutLog, 'id' | 'createdAt'>;

type ReminderToggleKey = 'workoutMorning' | 'workoutEvening' | 'weightWeekly';

interface StoredPlan {
  workoutDays: number[];
  shoppingList: ShoppingItem[];
  workoutLogs: WorkoutLog[];
  activeProgramId: string | null;
  customPrograms: WorkoutProgram[];
  progressEntries: BodyProgressEntry[];
  reminderSettings: ReminderSettings;
}

interface AppContextType {
  workoutDays: number[];
  toggleWorkoutDay: (day: number) => void;
  isWorkoutDay: (day: number) => boolean;
  getDayType: (day: number) => 'spor' | 'dinlenme';
  shoppingList: ShoppingItem[];
  toggleShoppingItem: (id: string) => void;
  generateShoppingList: () => void;
  workoutLogs: WorkoutLog[];
  addWorkoutLog: (log: NewWorkoutLog) => void;
  deleteWorkoutLog: (id: string) => void;
  getWorkoutsForDate: (date: string) => WorkoutLog[];
  getWorkoutsThisWeek: () => WorkoutLog[];
  hasWorkoutLoggedToday: () => boolean;
  activeProgramId: string | null;
  selectProgram: (programId: string) => void;
  clearProgram: () => void;
  getActiveProgram: () => WorkoutProgram | null;
  customPrograms: WorkoutProgram[];
  addCustomProgram: (program: WorkoutProgram) => string | null;
  updateCustomProgram: (program: WorkoutProgram) => boolean;
  deleteCustomProgram: (id: string) => void;
  userProfile: UserProfile | null;
  isProfileComplete: boolean;
  isProfileReady: boolean;
  completeOnboarding: (profile: UserProfile) => Promise<void>;
  updateProfilePreferences: (patch: Partial<PersonalizationPreferences>) => void;
  progressEntries: BodyProgressEntry[];
  addProgressEntry: (entry: Omit<BodyProgressEntry, 'id' | 'createdAt'>) => void;
  deleteProgressEntry: (id: string) => void;
  getRecommendations: () => ProfileRecommendation | null;
  getDailyNutritionTargets: (isWorkoutDay: boolean) => NutritionTargets | null;
  reminderSettings: ReminderSettings;
  setReminderEnabled: (enabled: boolean) => Promise<void>;
  setReminderOption: (key: ReminderToggleKey, value: boolean) => Promise<void>;
  requestReminderPermission: () => Promise<boolean>;
  reminderPermission: 'granted' | 'denied' | 'undetermined';
  scheduledReminderCount: number;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function workoutDaysFromCount(count: number): number[] {
  const presets: Record<number, number[]> = {
    3: [1, 3, 5],
    4: [1, 2, 4, 5],
    5: [1, 2, 3, 4, 5],
  };
  return presets[count] ?? DEFAULT_WORKOUT_DAYS;
}

function makeShoppingList(workoutDays: number[]): ShoppingItem[] {
  const workoutCount = workoutDays.length;
  const restCount = 7 - workoutCount;
  const raw = buildWeeklyShoppingItems(
    collectPlanIngredients(workoutDayPlan),
    workoutCount,
    collectPlanIngredients(restDayPlan),
    restCount
  );
  return raw.map((item, index) => ({
    ...item,
    id: `shop-${index}`,
    checked: false,
  }));
}

function sanitizeWorkoutDays(days: unknown): number[] {
  if (!Array.isArray(days)) return DEFAULT_WORKOUT_DAYS;
  const valid = days.filter((d) => typeof d === 'number' && d >= 0 && d <= 6);
  return valid.length > 0 ? valid : DEFAULT_WORKOUT_DAYS;
}

function sanitizeProgramId(programId: unknown, customPrograms: WorkoutProgram[]): string | null {
  if (typeof programId !== 'string' || !programId) return null;
  return getProgramById(programId, customPrograms) ? programId : null;
}

function defaultPlan(): StoredPlan {
  return {
    workoutDays: DEFAULT_WORKOUT_DAYS,
    shoppingList: [],
    workoutLogs: [],
    activeProgramId: null,
    customPrograms: [],
    progressEntries: [],
    reminderSettings: DEFAULT_REMINDER_SETTINGS,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [workoutDays, setWorkoutDays] = useState<number[]>(DEFAULT_WORKOUT_DAYS);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [activeProgramId, setActiveProgramId] = useState<string | null>(null);
  const [customPrograms, setCustomPrograms] = useState<WorkoutProgram[]>([]);
  const [progressEntries, setProgressEntries] = useState<BodyProgressEntry[]>([]);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(DEFAULT_REMINDER_SETTINGS);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileReady, setIsProfileReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reminderPermission, setReminderPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [scheduledReminderCount, setScheduledReminderCount] = useState(0);
  const planLoadedRef = useRef(false);

  const storageKey = user?.id ? planStorageKey(user.id) : null;

  const refreshReminders = useCallback(
    async (settings: ReminderSettings, days: number[], logs: WorkoutLog[], progress: BodyProgressEntry[]) => {
      const count = await rescheduleSmartReminders({
        workoutDays: days,
        settings,
        workoutLogs: logs,
        progressEntries: progress,
      });
      setScheduledReminderCount(count);
    },
    []
  );

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const raw = await AsyncStorage.getItem(PROFILES_KEY);
      const map = raw ? JSON.parse(raw) : {};
      const profile = map[userId] as UserProfile | undefined;
      setUserProfile(profile ? normalizeProfile(profile) : null);
    } catch {
      setUserProfile(null);
    } finally {
      setIsProfileReady(true);
    }
  }, []);

  const saveProfile = useCallback(async (userId: string, profile: UserProfile) => {
    const raw = await AsyncStorage.getItem(PROFILES_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[userId] = profile;
    await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(map));
  }, []);

  const loadPlan = useCallback(async (key: string) => {
    try {
      let stored = await AsyncStorage.getItem(key);
      if (!stored && key !== LEGACY_PLAN_KEY) {
        stored = await AsyncStorage.getItem(LEGACY_PLAN_KEY);
      }
      const data = stored ? JSON.parse(stored) : defaultPlan();
      const custom = sanitizeCustomPrograms(data.customPrograms);
      const days = sanitizeWorkoutDays(data.workoutDays);
      setWorkoutDays(days);
      setWorkoutLogs(Array.isArray(data.workoutLogs) ? data.workoutLogs : []);
      setActiveProgramId(sanitizeProgramId(data.activeProgramId, custom));
      setCustomPrograms(custom);
      setProgressEntries(Array.isArray(data.progressEntries) ? data.progressEntries : []);
      setReminderSettings({ ...DEFAULT_REMINDER_SETTINGS, ...data.reminderSettings });
      setShoppingList(
        Array.isArray(data.shoppingList) && data.shoppingList.length > 0
          ? data.shoppingList
          : makeShoppingList(days)
      );
    } catch {
      setWorkoutDays(DEFAULT_WORKOUT_DAYS);
      setShoppingList(makeShoppingList(DEFAULT_WORKOUT_DAYS));
    }
  }, []);

  const savePlan = useCallback(async () => {
    if (!storageKey || !planLoadedRef.current) return;
    const payload: StoredPlan = {
      workoutDays,
      shoppingList,
      workoutLogs,
      activeProgramId,
      customPrograms,
      progressEntries,
      reminderSettings,
    };
    await AsyncStorage.setItem(storageKey, JSON.stringify(payload));
  }, [
    storageKey,
    workoutDays,
    shoppingList,
    workoutLogs,
    activeProgramId,
    customPrograms,
    progressEntries,
    reminderSettings,
  ]);

  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      setIsLoading(true);
      setIsProfileReady(false);
      planLoadedRef.current = false;

      if (!user?.id) {
        setUserProfile(null);
        setIsProfileReady(true);
        setIsLoading(false);
        return;
      }

      await Promise.all([loadProfile(user.id), loadPlan(planStorageKey(user.id))]);
      if (cancelled) return;

      planLoadedRef.current = true;
      const permission = await getPermissionStatus();
      if (!cancelled) setReminderPermission(permission);
      setIsLoading(false);
    };

    boot();
    return () => {
      cancelled = true;
    };
  }, [user?.id, loadProfile, loadPlan]);

  useEffect(() => {
    if (!planLoadedRef.current || isLoading) return;
    savePlan();
  }, [savePlan, isLoading]);

  useEffect(() => {
    if (!planLoadedRef.current || isLoading) return;
    refreshReminders(reminderSettings, workoutDays, workoutLogs, progressEntries);
  }, [reminderSettings, workoutDays, workoutLogs, progressEntries, isLoading, refreshReminders]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        getPermissionStatus().then(setReminderPermission);
        getScheduledReminderCount().then(setScheduledReminderCount);
      }
    });
    return () => sub.remove();
  }, []);

  const toggleWorkoutDay = useCallback((day: number) => {
    setWorkoutDays((prev) => {
      if (prev.includes(day)) {
        if (prev.length <= 1) return prev;
        return prev.filter((d) => d !== day);
      }
      if (prev.length >= 5) return prev;
      return [...prev, day].sort((a, b) => a - b);
    });
  }, []);

  const isWorkoutDay = useCallback((day: number) => workoutDays.includes(day), [workoutDays]);

  const getDayType = useCallback(
    (day: number): 'spor' | 'dinlenme' => (workoutDays.includes(day) ? 'spor' : 'dinlenme'),
    [workoutDays]
  );

  const toggleShoppingItem = useCallback((id: string) => {
    setShoppingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  }, []);

  const generateShoppingList = useCallback(() => {
    setShoppingList(makeShoppingList(workoutDays));
  }, [workoutDays]);

  useEffect(() => {
    if (!planLoadedRef.current || isLoading) return;
    setShoppingList(makeShoppingList(workoutDays));
  }, [workoutDays, isLoading]);

  const addWorkoutLog = useCallback((log: NewWorkoutLog) => {
    const entry: WorkoutLog = {
      ...log,
      id: createId('workout'),
      createdAt: new Date().toISOString(),
      exercises: log.exercises.map((ex) => ({
        ...ex,
        id: ex.id || createId('exercise'),
      })),
    };
    setWorkoutLogs((prev) => [entry, ...prev]);
  }, []);

  const deleteWorkoutLog = useCallback((id: string) => {
    setWorkoutLogs((prev) => prev.filter((log) => log.id !== id));
  }, []);

  const getWorkoutsForDate = useCallback(
    (date: string) => workoutLogs.filter((log) => log.date === date),
    [workoutLogs]
  );

  const getWorkoutsThisWeek = useCallback(
    () => workoutLogs.filter((log) => isSameWeek(log.date)),
    [workoutLogs]
  );

  const hasWorkoutLoggedToday = useCallback(
    () => workoutLogs.some((log) => log.date === toDateKey()),
    [workoutLogs]
  );

  const selectProgram = useCallback((programId: string) => {
    setActiveProgramId(programId);
  }, []);

  const clearProgram = useCallback(() => {
    setActiveProgramId(null);
  }, []);

  const getActiveProgram = useCallback((): WorkoutProgram | null => {
    if (!activeProgramId) return null;
    return getProgramById(activeProgramId, customPrograms) ?? null;
  }, [activeProgramId, customPrograms]);

  const addCustomProgram = useCallback((program: WorkoutProgram): string | null => {
    const normalized = normalizeCustomProgram(program);
    const check = validateCustomProgram(normalized);
    if (!check.valid) return null;
    if (customPrograms.length >= MAX_CUSTOM_PROGRAMS) return null;
    setCustomPrograms((prev) => [...prev, normalized]);
    return normalized.id;
  }, [customPrograms.length]);

  const updateCustomProgram = useCallback((program: WorkoutProgram): boolean => {
    const normalized = normalizeCustomProgram(program);
    const check = validateCustomProgram(normalized);
    if (!check.valid) return false;
    setCustomPrograms((prev) => prev.map((p) => (p.id === normalized.id ? normalized : p)));
    return true;
  }, []);

  const deleteCustomProgram = useCallback((id: string) => {
    setCustomPrograms((prev) => prev.filter((p) => p.id !== id));
    setActiveProgramId((current) => (current === id ? null : current));
  }, []);

  const completeOnboarding = useCallback(
    async (profile: UserProfile) => {
      if (!user?.id) throw new Error('No user');
      const normalized = normalizeProfile({ ...profile, onboardingComplete: true });
      await saveProfile(user.id, normalized);
      setUserProfile(normalized);
      const days = workoutDaysFromCount(recommendWorkoutDays(normalized.goal));
      setWorkoutDays(days);
      setProgressEntries([seedProgressFromWeight(normalized.weightKg)]);
      const rec = buildRecommendations(normalized);
      if (rec.programId) setActiveProgramId(rec.programId);
    },
    [user?.id, saveProfile]
  );

  const updateProfilePreferences = useCallback(
    (patch: Partial<PersonalizationPreferences>) => {
      if (!userProfile || !user?.id) return;
      const next = normalizeProfile({
        ...userProfile,
        preferences: { ...userProfile.preferences, ...patch },
        updatedAt: new Date().toISOString(),
      });
      setUserProfile(next);
      saveProfile(user.id, next);
    },
    [userProfile, user?.id, saveProfile]
  );

  const addProgressEntry = useCallback((entry: Omit<BodyProgressEntry, 'id' | 'createdAt'>) => {
    const full: BodyProgressEntry = {
      ...entry,
      id: createId('progress'),
      createdAt: new Date().toISOString(),
    };
    setProgressEntries((prev) => [...prev, full]);
  }, []);

  const deleteProgressEntry = useCallback((id: string) => {
    setProgressEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const getRecommendations = useCallback((): ProfileRecommendation | null => {
    if (!userProfile) return null;
    return buildRecommendations(userProfile);
  }, [userProfile]);

  const getDailyNutritionTargets = useCallback(
    (isWorkout: boolean): NutritionTargets | null => {
      if (!userProfile) return null;
      return getNutritionTargets(userProfile, isWorkout);
    },
    [userProfile]
  );

  const setReminderEnabled = useCallback(
    async (enabled: boolean) => {
      const next = { ...reminderSettings, enabled };
      setReminderSettings(next);
      await refreshReminders(next, workoutDays, workoutLogs, progressEntries);
    },
    [reminderSettings, workoutDays, workoutLogs, progressEntries, refreshReminders]
  );

  const setReminderOption = useCallback(
    async (key: ReminderToggleKey, value: boolean) => {
      const next = { ...reminderSettings, [key]: value };
      setReminderSettings(next);
      await refreshReminders(next, workoutDays, workoutLogs, progressEntries);
    },
    [reminderSettings, workoutDays, workoutLogs, progressEntries, refreshReminders]
  );

  const requestReminderPermission = useCallback(async () => {
    const ok = await ensureNotificationPermissions();
    const status = await getPermissionStatus();
    setReminderPermission(status);
    if (ok) {
      await refreshReminders(reminderSettings, workoutDays, workoutLogs, progressEntries);
    }
    return ok;
  }, [reminderSettings, workoutDays, workoutLogs, progressEntries, refreshReminders]);

  const isProfileComplete = !!userProfile?.onboardingComplete;

  return (
    <AppContext.Provider
      value={{
        workoutDays,
        toggleWorkoutDay,
        isWorkoutDay,
        getDayType,
        shoppingList,
        toggleShoppingItem,
        generateShoppingList,
        workoutLogs,
        addWorkoutLog,
        deleteWorkoutLog,
        getWorkoutsForDate,
        getWorkoutsThisWeek,
        hasWorkoutLoggedToday,
        activeProgramId,
        selectProgram,
        clearProgram,
        getActiveProgram,
        customPrograms,
        addCustomProgram,
        updateCustomProgram,
        deleteCustomProgram,
        userProfile,
        isProfileComplete,
        isProfileReady,
        completeOnboarding,
        updateProfilePreferences,
        progressEntries,
        addProgressEntry,
        deleteProgressEntry,
        getRecommendations,
        getDailyNutritionTargets,
        reminderSettings,
        setReminderEnabled,
        setReminderOption,
        requestReminderPermission,
        reminderPermission,
        scheduledReminderCount,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

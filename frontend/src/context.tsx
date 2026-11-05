import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Activity } from '@/types/domain';
import { summariesService } from '@/services/summaries';
import { labelFromDate, todayBR } from '@/utils/date';
import { authService, User } from '@/services/auth';
import { tokenStorage } from '@/services/tokenStorage';
import { activitiesService } from '@/services/activities';
import { LandingScreen } from '@/services/preferences';

type GoalState = { value: number; month: string; year: number; monthNumber: number };

type CtxValue = {
  activities: Activity[];
  goal: GoalState;
  trash: Activity[];
  user: User | null;
  sessionLoading: boolean;
  sessionError: string | null;
  onboardingPending: boolean;
  appDataLoading: boolean;
  appDataError: string | null;
  trashLoading: boolean;
  trashError: string | null;
  landingScreen: LandingScreen;
  refreshSession: () => Promise<void>;
  dismissSessionError: () => void;
  activateSession: (user: User, onboardingPending?: boolean) => void;
  completeOnboarding: () => Promise<void>;
  refreshAppData: () => Promise<void>;
  refreshTrash: () => Promise<void>;
  setLandingScreen: (screen: LandingScreen) => Promise<void>;
  updateProfileName: (name: string) => Promise<User>;
  logout: () => Promise<void>;
  createActivity: (a: Omit<Activity, 'id' | 'status'>) => Promise<Activity>;
  updateActivity: (id: string, data: Partial<Activity>) => Promise<void>;
  duplicateActivity: (id: string) => Promise<Activity | undefined>;
  completeActivity: (id: string, data?: Partial<Pick<Activity, 'realizedValue' | 'completedAt' | 'realizedType' | 'observation'>>) => Promise<void>;
  reopenActivity: (id: string) => Promise<void>;
  cancelActivity: (id: string) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  deletePermanently: (id: string) => Promise<void>;
  restoreActivity: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  togglePriority: (id: string) => Promise<void>;
  setGoal: (value: number) => Promise<void>;
};

const Ctx = createContext<CtxValue | null>(null);

function currentGoal(): GoalState {
  const now = new Date();
  return { value: 0, month: labelFromDate(now), year: now.getFullYear(), monthNumber: now.getMonth() + 1 };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Não foi possível concluir a operação. Tente novamente.';
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => { timeout = setTimeout(() => reject(new Error(message)), timeoutMs); }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [goal, setGoalState] = useState<GoalState>(currentGoal);
  const [trash, setTrash] = useState<Activity[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [onboardingPending, setOnboardingPending] = useState(false);
  const [appDataLoading, setAppDataLoading] = useState(false);
  const [appDataError, setAppDataError] = useState<string | null>(null);
  const [trashLoading, setTrashLoading] = useState(false);
  const [trashError, setTrashError] = useState<string | null>(null);
  const [landingScreen, setLandingScreenState] = useState<LandingScreen>('home');
  const sessionRequest = useRef(0);
  const dataRequest = useRef(0);
  const trashRequest = useRef(0);
  const pendingOperations = useRef(new Map<string, Promise<unknown>>());

  function runOnce<T>(key: string, action: () => Promise<T>): Promise<T> {
    const existing = pendingOperations.current.get(key) as Promise<T> | undefined;
    if (existing) return existing;
    const request = action().finally(() => pendingOperations.current.delete(key));
    pendingOperations.current.set(key, request);
    return request;
  }

  async function loadAppData() {
    const request = ++dataRequest.current;
    setAppDataLoading(true);
    setAppDataError(null);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    try {
      const [items, summary] = await withTimeout(Promise.all([
        activitiesService.list(),
        summariesService.get(year, month),
      ]), 20000, 'O carregamento dos dados demorou mais que o esperado. Tente novamente.');
      if (request !== dataRequest.current) return;
      setActivities(items);
      setGoalState({ value: summary.goalValue ?? 0, month: labelFromDate(now), year, monthNumber: month });
    } catch (error) {
      if (request === dataRequest.current) setAppDataError(errorMessage(error));
    } finally {
      if (request === dataRequest.current) setAppDataLoading(false);
    }
  }

  async function refreshSession() {
    const request = ++sessionRequest.current;
    setSessionLoading(true);
    setSessionError(null);
    try {
      const token = await withTimeout(tokenStorage.get(), 10000, 'A leitura da sessão demorou mais que o esperado.');
      if (request !== sessionRequest.current) return;
      if (!token) {
        dataRequest.current += 1;
        setUser(null);
        setOnboardingPending(false);
        setActivities([]);
        setTrash([]);
        setGoalState(currentGoal());
        setAppDataError(null);
        setAppDataLoading(false);
        setSessionLoading(false);
        return;
      }

      const appDataPromise = loadAppData();
      const currentUser = await withTimeout(authService.me(), 15000, 'A validação da sessão demorou mais que o esperado.');
      if (request !== sessionRequest.current) return;
      setUser(currentUser);
      setLandingScreenState(currentUser.landingScreen === 'activities' ? 'activities' : 'home');
      setOnboardingPending(currentUser.onboardingCompleted === false);
      setSessionLoading(false);
      void appDataPromise;
    } catch {
      if (request !== sessionRequest.current) return;
      dataRequest.current += 1;
      try { await authService.logout(); } catch { /* Storage may also reject removal. */ }
      if (request !== sessionRequest.current) return;
      setUser(null);
      setOnboardingPending(false);
      setActivities([]);
      setTrash([]);
      setGoalState(currentGoal());
      setAppDataError(null);
      setAppDataLoading(false);
      setSessionError('Não foi possível validar sua sessão. Verifique sua conexão e tente novamente.');
      setSessionLoading(false);
    }
  }

  function activateSession(currentUser: User, needsOnboarding = currentUser.onboardingCompleted === false) {
    sessionRequest.current += 1;
    setUser(currentUser);
    setOnboardingPending(needsOnboarding);
    setLandingScreenState(currentUser.landingScreen === 'activities' ? 'activities' : 'home');
    setSessionLoading(false);
    setSessionError(null);
    setGoalState(currentGoal());
    void loadAppData();
  }

  async function refreshAppData() { if (user) await loadAppData(); }

  async function refreshTrash() {
    if (!user) return;
    const request = ++trashRequest.current;
    setTrashLoading(true);
    setTrashError(null);
    try {
      const items = await activitiesService.trash();
      if (request === trashRequest.current) setTrash(items);
    } catch (error) {
      if (request === trashRequest.current) setTrashError(errorMessage(error));
    } finally {
      if (request === trashRequest.current) setTrashLoading(false);
    }
  }

  async function setLandingScreen(screen: LandingScreen) {
    const previous = landingScreen;
    setLandingScreenState(screen);
    try {
      const updated = await authService.updatePreferences({ landingScreen: screen });
      setUser(updated);
      setLandingScreenState(updated.landingScreen === 'activities' ? 'activities' : 'home');
    } catch (error) {
      setLandingScreenState(previous);
      throw error;
    }
  }

  async function updateProfileName(name: string) {
    const updated = await authService.updateProfile({ name });
    setUser(updated);
    return updated;
  }

  async function logout() {
    sessionRequest.current += 1;
    dataRequest.current += 1;
    trashRequest.current += 1;
    setUser(null);
    setOnboardingPending(false);
    setActivities([]);
    setTrash([]);
    setGoalState(currentGoal());
    setAppDataError(null);
    setAppDataLoading(false);
    setSessionError(null);
    await authService.logout();
  }

  function dismissSessionError() { setSessionError(null); }

  async function completeOnboarding() {
    const updated = await authService.completeOnboarding();
    setUser(updated);
    setOnboardingPending(false);
  }

  useEffect(() => {
    void refreshSession();
  }, []);

  const value = useMemo<CtxValue>(() => ({
    activities, goal, trash, user, sessionLoading, sessionError, onboardingPending, appDataLoading, appDataError,
    trashLoading, trashError, landingScreen,
    refreshSession, dismissSessionError, activateSession, completeOnboarding, refreshAppData, refreshTrash,
    setLandingScreen, updateProfileName, logout,

    createActivity: async (input) => {
      const pending: Activity = { ...input, id: `pending-${Date.now()}`, status: 'PENDENTE' };
      setActivities(items => [pending, ...items]);
      try {
        const saved = await activitiesService.create(input);
        setActivities(items => items.map(item => item.id === pending.id ? saved : item));
        return saved;
      } catch (error) {
        setActivities(items => items.filter(item => item.id !== pending.id));
        throw error;
      }
    },

    updateActivity: (id, data) => runOnce(`activity:${id}`, async () => {
      const previous = activities.find(item => item.id === id);
      if (!previous) return;
      const optimistic = { ...previous, ...data };
      setActivities(items => items.map(item => item.id === id ? optimistic : item));
      try {
        const saved = await activitiesService.update(id, optimistic);
        setActivities(items => items.map(item => item.id === id ? saved : item));
      } catch (error) {
        setActivities(items => items.map(item => item.id === id ? previous : item));
        throw error;
      }
    }),

    duplicateActivity: async (id) => {
      const copy = await activitiesService.duplicate(id);
      setActivities(items => [copy, ...items]);
      return copy;
    },

    completeActivity: (id, data) => runOnce(`activity:${id}`, async () => {
      const previous = activities.find(item => item.id === id);
      if (!previous) return;
      const completion = data ?? { realizedType: previous.plannedType, realizedValue: previous.plannedValue };
      const optimistic: Activity = {
        ...previous,
        status: 'CONCLUIDA',
        completedAt: completion.completedAt ?? todayBR(),
        realizedType: completion.realizedType,
        realizedValue: completion.realizedValue,
        observation: completion.observation ?? previous.observation,
      };
      setActivities(items => items.map(item => item.id === id ? optimistic : item));
      try {
        const saved = await activitiesService.complete(id, completion);
        setActivities(items => items.map(item => item.id === id ? saved : item));
      } catch (error) {
        setActivities(items => items.map(item => item.id === id ? previous : item));
        throw error;
      }
    }),

    reopenActivity: (id) => runOnce(`activity:${id}`, async () => {
      const previous = activities.find(item => item.id === id);
      if (!previous) return;
      const optimistic: Activity = { ...previous, status: 'PENDENTE', completedAt: undefined, realizedType: undefined, realizedValue: undefined, canceledAt: undefined };
      setActivities(items => items.map(item => item.id === id ? optimistic : item));
      try {
        const saved = await activitiesService.reopen(id);
        setActivities(items => items.map(item => item.id === id ? saved : item));
      } catch (error) {
        setActivities(items => items.map(item => item.id === id ? previous : item));
        throw error;
      }
    }),

    cancelActivity: (id) => runOnce(`activity:${id}`, async () => {
      const previous = activities.find(item => item.id === id);
      if (!previous) return;
      const optimistic: Activity = { ...previous, status: 'CANCELADA' };
      setActivities(items => items.map(item => item.id === id ? optimistic : item));
      try {
        const saved = await activitiesService.cancel(id);
        setActivities(items => items.map(item => item.id === id ? saved : item));
      } catch (error) {
        setActivities(items => items.map(item => item.id === id ? previous : item));
        throw error;
      }
    }),

    deleteActivity: (id) => runOnce(`activity:${id}`, async () => {
      const previous = activities.find(item => item.id === id);
      if (!previous) return;
      setActivities(items => items.filter(item => item.id !== id));
      try {
        const deleted = await activitiesService.remove(id);
        setTrash(items => [deleted, ...items.filter(item => item.id !== id)]);
      } catch (error) {
        setActivities(items => [previous, ...items]);
        throw error;
      }
    }),

    deletePermanently: (id) => runOnce(`activity:${id}`, async () => {
      const previous = trash.find(item => item.id === id);
      if (!previous) return;
      setTrash(items => items.filter(item => item.id !== id));
      try {
        await activitiesService.deletePermanently(id);
      } catch (error) {
        setTrash(items => [previous, ...items]);
        throw error;
      }
    }),

    restoreActivity: (id) => runOnce(`activity:${id}`, async () => {
      const previous = trash.find(item => item.id === id);
      if (!previous) return;
      setTrash(items => items.filter(item => item.id !== id));
      setActivities(items => [previous, ...items]);
      try {
        const restored = await activitiesService.restore(id);
        setActivities(items => items.map(item => item.id === id ? restored : item));
      } catch (error) {
        setActivities(items => items.filter(item => item.id !== id));
        setTrash(items => [previous, ...items]);
        throw error;
      }
    }),

    toggleFavorite: (id) => runOnce(`activity:${id}`, async () => {
      const previous = activities.find(item => item.id === id);
      if (!previous) return;
      const nextValue = !previous.favorite;
      setActivities(items => items.map(item => item.id === id ? { ...item, favorite: nextValue } : item));
      try {
        const saved = await activitiesService.favorite(id, nextValue);
        setActivities(items => items.map(item => item.id === id ? saved : item));
      } catch (error) {
        setActivities(items => items.map(item => item.id === id ? previous : item));
        throw error;
      }
    }),

    togglePriority: (id) => runOnce(`activity:${id}`, async () => {
      const previous = activities.find(item => item.id === id);
      if (!previous) return;
      const nextValue = !previous.priority;
      setActivities(items => items.map(item => item.id === id ? { ...item, priority: nextValue } : item));
      try {
        const saved = await activitiesService.priority(id, nextValue);
        setActivities(items => items.map(item => item.id === id ? saved : item));
      } catch (error) {
        setActivities(items => items.map(item => item.id === id ? previous : item));
        throw error;
      }
    }),

    setGoal: (amount) => runOnce('goal', async () => {
      const previous = goal.value;
      setGoalState(current => ({ ...current, value: amount }));
      try {
        await summariesService.saveGoal(goal.year, goal.monthNumber, amount);
      } catch (error) {
        setGoalState(current => ({ ...current, value: previous }));
        throw error;
      }
    }),
  }), [activities, goal, trash, user, sessionLoading, sessionError, onboardingPending, appDataLoading, appDataError, trashLoading, trashError, landingScreen]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp deve estar dentro de AppProvider');
  return ctx;
}

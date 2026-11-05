import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { Activity } from '@/types/domain';
import { summariesService } from '@/services/summaries';
import { labelFromDate } from '@/utils/date';
import { authService, User } from '@/services/auth';
import { tokenStorage } from '@/services/tokenStorage';
import { activitiesService } from '@/services/activities';

type CtxValue = {
  activities: Activity[];
  goal: { value: number; month: string; year: number; monthNumber: number };
  trash: Activity[];
  user: User | null;
  sessionLoading: boolean;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
  createActivity: (a: Omit<Activity, 'id' | 'status'>) => Promise<Activity>;
  updateActivity: (id: string, data: Partial<Activity>) => Promise<void>;
  duplicateActivity: (id: string) => Promise<Activity | undefined>;
  completeActivity: (id: string, data?: Partial<Pick<Activity, 'realizedValue' | 'completedAt' | 'realizedType' | 'observation'>>) => Promise<void>;
  reopenActivity: (id: string) => Promise<void>;
  cancelActivity: (id: string) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  restoreActivity: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  togglePriority: (id: string) => Promise<void>;
  setGoal: (value: number) => Promise<void>;
};

const Ctx = createContext<CtxValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [goal, setGoalState] = useState(() => { const now = new Date(); return { value: 0, month: labelFromDate(now), year: now.getFullYear(), monthNumber: now.getMonth() + 1 }; });
  const [trash, setTrash] = useState<Activity[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const sessionRequest = useRef(0);

  async function refreshSession() {
    const request = ++sessionRequest.current;
    const token = await tokenStorage.get();
    if (request !== sessionRequest.current) return;
    if (!token) {
      setUser(null);
      setActivities([]);
      setTrash([]);
      const now = new Date();
      setGoalState({ value: 0, month: labelFromDate(now), year: now.getFullYear(), monthNumber: now.getMonth() + 1 });
      return;
    }
    try {
      const currentUser = await authService.me();
      if (request !== sessionRequest.current) return;
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const [items, deleted, summary] = await Promise.all([
        activitiesService.list(),
        activitiesService.trash(),
        summariesService.get(year, month),
      ]);
      if (request !== sessionRequest.current) return;
      setUser(currentUser);
      setActivities(items);
      setTrash(deleted);
      setGoalState({ value: summary.goalValue ?? 0, month: labelFromDate(now), year, monthNumber: month });
    } catch {
      if (request !== sessionRequest.current) return;
      await authService.logout();
      if (request !== sessionRequest.current) return;
      setUser(null);
      setActivities([]);
      setTrash([]);
      const now = new Date();
      setGoalState({ value: 0, month: labelFromDate(now), year: now.getFullYear(), monthNumber: now.getMonth() + 1 });
    }
  }

  async function logout() {
    sessionRequest.current += 1;
    setUser(null);
    setActivities([]);
    setTrash([]);
    const now = new Date();
    setGoalState({ value: 0, month: labelFromDate(now), year: now.getFullYear(), monthNumber: now.getMonth() + 1 });
    await authService.logout();
  }

  useEffect(() => {
    refreshSession().finally(() => setSessionLoading(false));
  }, []);

  const value = useMemo<CtxValue>(() => ({
    activities, goal, trash, user, sessionLoading, refreshSession, logout,

    createActivity: async (input) => {
      const item = await activitiesService.create(input);
      setActivities((items) => [item, ...items]);
      return item;
    },

    updateActivity: async (id, data) => {
      const current = activities.find((item) => item.id === id);
      if (!current) return;
      const updated = await activitiesService.update(id, { ...current, ...data });
      setActivities((items) => items.map((item) => item.id === id ? updated : item));
    },

    duplicateActivity: async (id) => {
      const original = activities.find((item) => item.id === id);
      if (!original) return undefined;
      const copy = await activitiesService.duplicate(id);
      setActivities((items) => [copy, ...items]);
      return copy;
    },

    completeActivity: async (id, data) => {
      const current = activities.find((item) => item.id === id);
      if (!current) return;
      const completion = data === undefined
        ? { realizedType: current.plannedType, realizedValue: current.plannedValue }
        : data;
      const updated = await activitiesService.complete(id, completion);
      setActivities((items) => items.map((item) => item.id === id ? updated : item));
    },

    reopenActivity: async (id) => {
      const updated = await activitiesService.reopen(id);
      setActivities((items) => items.map((item) => item.id === id ? updated : item));
    },

    cancelActivity: async (id) => {
      const updated = await activitiesService.cancel(id);
      setActivities((items) => items.map((item) => item.id === id ? updated : item));
    },

    deleteActivity: async (id) => {
      await activitiesService.remove(id);
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const [items, deleted, summary] = await Promise.all([
        activitiesService.list(),
        activitiesService.trash(),
        summariesService.get(year, month),
      ]);
      setActivities(items);
      setTrash(deleted);
    },

    restoreActivity: async (id) => {
      const restored = await activitiesService.restore(id);
      setActivities((items) => [restored, ...items]);
      setTrash((items) => items.filter((item) => item.id !== id));
    },

    toggleFavorite: async (id) => {
      const current = activities.find((item) => item.id === id);
      if (!current) return;
      const updated = await activitiesService.favorite(id, !current.favorite);
      setActivities((items) => items.map((item) => item.id === id ? updated : item));
    },

    togglePriority: async (id) => {
      const current = activities.find((item) => item.id === id);
      if (!current) return;
      const updated = await activitiesService.priority(id, !current.priority);
      setActivities((items) => items.map((item) => item.id === id ? updated : item));
    },

    setGoal: async (amount) => {
      await summariesService.saveGoal(goal.year, goal.monthNumber, amount);
      setGoalState((current) => ({ ...current, value: amount }));
    },
  }), [activities, goal, trash, user, sessionLoading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp deve estar dentro de AppProvider');
  return ctx;
}

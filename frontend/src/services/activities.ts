import { api } from './api';
import { Activity, ActivityStatus } from '@/types/domain';

export type ActivityDTO = {
  id: string;
  title: string;
  icon: Activity['icon'];
  date: string | null;
  time: string | null;
  priority: boolean;
  status: ActivityStatus;
  plannedType: Activity['plannedType'] | null;
  plannedValue: number | string | null;
  realizedType: Activity['realizedType'] | null;
  realizedValue: number | string | null;
  completedAt: string | null;
  description: string | null;
  observation: string | null;
  deletedAt: string | null;
  canceledAt: string | null;
  favorite: boolean;
};

function dateFromApi(value?: string | null): string | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

function dateToApi(value?: string): string | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : null;
}

export function mapActivity(dto: ActivityDTO): Activity {
  return {
    id: dto.id,
    title: dto.title,
    icon: dto.icon,
    date: dateFromApi(dto.date),
    time: dto.time?.slice(0, 5) ?? undefined,
    priority: dto.priority,
    status: dto.status,
    plannedType: dto.plannedType ?? undefined,
    plannedValue: dto.plannedValue == null ? undefined : Number(dto.plannedValue),
    realizedType: dto.realizedType ?? undefined,
    realizedValue: dto.realizedValue == null ? undefined : Number(dto.realizedValue),
    completedAt: dateFromApi(dto.completedAt),
    description: dto.description ?? undefined,
    observation: dto.observation ?? undefined,
    deletedAt: dto.deletedAt ? dateFromApi(dto.deletedAt) : undefined,
    canceledAt: dto.canceledAt ? dateFromApi(dto.canceledAt) : undefined,
    favorite: dto.favorite,
  };
}

function toRequest(data: Partial<Activity>) {
  const hasPlannedValue = data.plannedType != null && data.plannedValue != null;
  return {
    title: data.title,
    icon: data.icon,
    date: dateToApi(data.date),
    time: data.time ? `${data.time.slice(0, 5)}:00` : null,
    priority: data.priority ?? false,
    favorite: data.favorite ?? false,
    plannedImpactStatus: hasPlannedValue ? 'PLANEJADO' : 'SEM_IMPACTO',
    plannedType: hasPlannedValue ? data.plannedType : null,
    plannedValue: hasPlannedValue ? data.plannedValue : null,
    description: data.description ?? null,
    observation: data.observation ?? null,
  };
}

export const activitiesService = {
  async list(): Promise<Activity[]> {
    const result = await api<ActivityDTO[]>('/api/activities');
    return result.map(mapActivity);
  },

  async trash(): Promise<Activity[]> {
    const result = await api<ActivityDTO[]>('/api/trash');
    return result.map(mapActivity);
  },

  async create(data: Omit<Activity, 'id' | 'status'>): Promise<Activity> {
    const result = await api<ActivityDTO>('/api/activities', {
      method: 'POST',
      body: JSON.stringify(toRequest(data)),
    });
    return mapActivity(result);
  },

  async update(id: string, data: Partial<Activity>): Promise<Activity> {
    const result = await api<ActivityDTO>(`/api/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toRequest(data)),
    });
    return mapActivity(result);
  },

  async complete(id: string, data?: Partial<Activity>): Promise<Activity> {
    const hasValue = data?.realizedType != null && data?.realizedValue != null;
    const body = {
      realizedAt: dateToApi(data?.completedAt),
      realizedImpactStatus: hasValue ? 'REALIZADO' : 'SEM_IMPACTO',
      realizedType: hasValue ? data?.realizedType : null,
      realizedValue: hasValue ? data?.realizedValue : null,
      observation: data?.observation ?? null,
    };
    const result = await api<ActivityDTO>(`/api/activities/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return mapActivity(result);
  },

  async reopen(id: string): Promise<Activity> {
    const result = await api<ActivityDTO>(`/api/activities/${id}/reopen`, { method: 'POST' });
    return mapActivity(result);
  },

  async cancel(id: string): Promise<Activity> {
    const result = await api<ActivityDTO>(`/api/activities/${id}/cancel`, { method: 'POST' });
    return mapActivity(result);
  },

  async duplicate(id: string): Promise<Activity> {
    const result = await api<ActivityDTO>(`/api/activities/${id}/duplicate`, { method: 'POST' });
    return mapActivity(result);
  },

  async favorite(id: string, value: boolean): Promise<Activity> {
    const result = await api<ActivityDTO>(`/api/activities/${id}/favorite`, {
      method: 'PATCH',
      body: JSON.stringify({ value }),
    });
    return mapActivity(result);
  },

  async priority(id: string, value: boolean): Promise<Activity> {
    const result = await api<ActivityDTO>(`/api/activities/${id}/priority`, {
      method: 'PATCH',
      body: JSON.stringify({ value }),
    });
    return mapActivity(result);
  },

  async remove(id: string): Promise<void> {
    await api<ActivityDTO>(`/api/activities/${id}/trash`, { method: 'POST' });
  },

  async restore(id: string): Promise<Activity> {
    const result = await api<ActivityDTO>(`/api/trash/${id}/restore`, { method: 'POST' });
    return mapActivity(result);
  },
};

export type ActivityStatus = 'PENDENTE' | 'CONCLUIDA' | 'CANCELADA';
export type FinancialType = 'ENTRADA' | 'SAIDA';
export type ActivityIconName = 'market' | 'study' | 'work' | 'health' | 'home' | 'payment' | 'leisure' | 'other';

export type Activity = {
  id: string;
  title: string;
  icon: ActivityIconName;
  date?: string;
  time?: string;
  priority: boolean;
  status: ActivityStatus;
  plannedType?: FinancialType;
  plannedValue?: number;
  realizedType?: FinancialType;
  realizedValue?: number;
  completedAt?: string;
  description?: string;
  observation?: string;
  deletedAt?: string;
  canceledAt?: string;
  favorite?: boolean;
};

export type Goal = { value: number; month: string };

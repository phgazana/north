import { Activity, Goal } from '@/types/domain';

export const currentUser = { name: 'Paulo Gazana', email: 'paulo.gazana@email.com' };
export const mockGoal: Goal = { value: 2000, month: 'Setembro 2026' };

export const mockActivities: Activity[] = [
  { id: '1', title: 'Pagar faculdade', icon: 'study', date: '20/09/2026', time: '10:00', priority: false, status: 'PENDENTE', plannedType: 'SAIDA', plannedValue: 850, description: 'Pagamento da mensalidade referente a setembro.', observation: 'Boleto gerado no site da faculdade.', favorite: true },
  { id: '2', title: 'Consulta médica', icon: 'health', date: '20/09/2026', time: '15:00', priority: false, status: 'PENDENTE', plannedType: 'SAIDA', plannedValue: 120, description: 'Consulta agendada para acompanhamento.', favorite: false },
  { id: '3', title: 'Cinema', icon: 'leisure', date: '21/09/2026', time: '20:00', priority: true, status: 'PENDENTE', plannedType: 'SAIDA', plannedValue: 80, favorite: false },
  { id: '4', title: 'Receber freelancer', icon: 'work', date: '25/09/2026', time: '18:00', priority: true, status: 'PENDENTE', plannedType: 'ENTRADA', plannedValue: 1200, favorite: false },
  { id: '5', title: 'Pagar aluguel', icon: 'home', date: '18/09/2026', time: '09:00', priority: false, status: 'PENDENTE', plannedType: 'SAIDA', plannedValue: 1200, favorite: false },
  { id: '6', title: 'Comprar material', icon: 'market', date: '18/09/2026', time: '17:00', priority: false, status: 'CONCLUIDA', realizedType: 'SAIDA', realizedValue: 85, completedAt: '18/09/2026', observation: 'Compra realizada conforme planejado.' },
  { id: '7', title: 'Receber pagamento', icon: 'payment', date: '12/09/2026', time: '14:00', priority: true, status: 'CONCLUIDA', realizedType: 'ENTRADA', realizedValue: 500, completedAt: '12/09/2026' },
  { id: '8', title: 'Cancelar assinatura', icon: 'other', date: '10/09/2026', priority: false, status: 'CANCELADA', plannedType: 'SAIDA', plannedValue: 49, favorite: false },
];

export const monthHistory = [
  { month: 'Setembro 2026', value: 1360, goal: 2000, entries: 1200, exits: 1360 },
  { month: 'Agosto 2026', value: 2150, goal: 2000, entries: 4200, exits: 2050 },
  { month: 'Julho 2026', value: 1780, goal: 2000, entries: 3900, exits: 2120 },
  { month: 'Junho 2026', value: 1920, goal: 2000, entries: 3800, exits: 1880 },
  { month: 'Maio 2026', value: 2300, goal: 2000, entries: 4700, exits: 2400 },
];

export const trashActivities: Activity[] = [
  { id: 't1', title: 'Jantar com amigos', icon: 'leisure', date: '12/09/2026', time: '20:00', priority: false, status: 'CANCELADA', plannedType: 'SAIDA', plannedValue: 150, deletedAt: '13/09/2026' },
  { id: 't2', title: 'Curso online', icon: 'study', date: '05/09/2026', time: '19:00', priority: false, status: 'CANCELADA', plannedType: 'SAIDA', plannedValue: 200, deletedAt: '08/09/2026' },
  { id: 't3', title: 'Ida ao parque', icon: 'leisure', date: '03/09/2026', time: '14:00', priority: false, status: 'CANCELADA', deletedAt: '04/09/2026' },
];

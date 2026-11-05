const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

export function parseBRDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return undefined;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : undefined;
}

export function monthKey(value?: string): string | undefined {
  const date = parseBRDate(value);
  return date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : undefined;
}

export function monthKeyFromLabel(label: string): string | undefined {
  const match = /^(Janeiro|Fevereiro|Março|Abril|Maio|Junho|Julho|Agosto|Setembro|Outubro|Novembro|Dezembro)\s+(\d{4})$/i.exec(label.trim());
  if (!match) return undefined;
  const index = MONTHS.findIndex(m => m.toLowerCase() === match[1].toLowerCase());
  return index < 0 ? undefined : `${match[2]}-${String(index + 1).padStart(2, '0')}`;
}

export function labelFromDate(value: Date): string {
  return `${MONTHS[value.getMonth()]} ${value.getFullYear()}`;
}

export function todayBR(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

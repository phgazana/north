export function money(value:number){return value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}

export function parseMoney(value: string): number | null {
  const cleaned = value.trim().replace(/^R\$\s*/i, '').replace(/\s/g, '');
  if (!cleaned) return null;
  const normalized = cleaned.includes(',') ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
}

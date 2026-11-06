const sectionNames: Record<string, string> = {
  '': 'Início',
  index: 'Início',
  home: 'Início',
  atividades: 'Atividades',
  historico: 'Histórico',
  conta: 'Conta',
  login: 'Entrar',
  cadastro: 'Criar conta',
  'recuperar-acesso': 'Recuperar acesso',
  lixeira: 'Lixeira',
  meta: 'Metas',
  onboarding: 'Boas-vindas',
  confirmacao: 'Configuração concluída',
  mes: 'Histórico',
  atividade: 'Atividade',
};

export function pageTitleFromSegments(segments: readonly string[]): string {
  const route = segments.filter(segment => !segment.startsWith('(') && segment !== 'index');
  const firstRouteSegment = route[0] ?? '';
  const section = sectionNames[firstRouteSegment] ?? 'Página';

  return `NORTH | ${section}`;
}

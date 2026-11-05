package br.com.north.domain;

/**
 * Distingue atividade sem impacto financeiro de valor ainda não definido.
 * PLANEJADO e REALIZADO são usados conforme a coluna/contexto da atividade.
 */
public enum FinancialImpactStatus {
    SEM_IMPACTO, PLANEJADO, INDEFINIDO, REALIZADO
}

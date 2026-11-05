-- NORTH: esquema inicial. Gerenciado por Flyway; não execute alterações manuais em produção.

CREATE TYPE estado_atividade AS ENUM ('PENDENTE', 'CONCLUIDA', 'CANCELADA');
CREATE TYPE tipo_financeiro AS ENUM ('ENTRADA', 'SAIDA');
CREATE TYPE impacto_financeiro AS ENUM ('SEM_IMPACTO', 'PLANEJADO', 'INDEFINIDO', 'REALIZADO');

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(254) NOT NULL,
    senha_hash VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_usuarios_email UNIQUE (email),
    CONSTRAINT ck_usuarios_nome_nao_vazio CHECK (length(trim(nome)) > 0),
    CONSTRAINT ck_usuarios_email_nao_vazio CHECK (length(trim(email)) > 0)
);

CREATE TABLE metas_mensais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL,
    ano SMALLINT NOT NULL,
    mes SMALLINT NOT NULL,
    valor NUMERIC(14,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_metas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT uq_meta_usuario_periodo UNIQUE (usuario_id, ano, mes),
    CONSTRAINT ck_meta_ano CHECK (ano BETWEEN 2000 AND 2100),
    CONSTRAINT ck_meta_mes CHECK (mes BETWEEN 1 AND 12),
    CONSTRAINT ck_meta_valor_positivo CHECK (valor > 0)
);

CREATE TABLE atividades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL,
    titulo VARCHAR(120) NOT NULL,
    descricao VARCHAR(1000),
    observacao VARCHAR(2000),
    icone VARCHAR(32) NOT NULL DEFAULT 'other',
    data_prevista DATE,
    horario_previsto TIME,
    prioridade BOOLEAN NOT NULL DEFAULT FALSE,
    favorita BOOLEAN NOT NULL DEFAULT FALSE,
    estado estado_atividade NOT NULL DEFAULT 'PENDENTE',
    impacto_financeiro_planejado impacto_financeiro NOT NULL DEFAULT 'SEM_IMPACTO',
    tipo_financeiro_planejado tipo_financeiro,
    valor_planejado NUMERIC(14,2),
    impacto_financeiro_realizado impacto_financeiro,
    tipo_financeiro_realizado tipo_financeiro,
    valor_realizado NUMERIC(14,2),
    data_realizada DATE,
    cancelada_em TIMESTAMPTZ,
    excluida_em TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_atividades_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT ck_atividade_titulo_nao_vazio CHECK (length(trim(titulo)) > 0),
    CONSTRAINT ck_atividade_icone CHECK (icone IN ('market','study','work','health','home','payment','leisure','other')),
    CONSTRAINT ck_atividade_valor_planejado CHECK (
      (impacto_financeiro_planejado = 'SEM_IMPACTO' AND tipo_financeiro_planejado IS NULL AND valor_planejado IS NULL) OR
      (impacto_financeiro_planejado = 'INDEFINIDO' AND tipo_financeiro_planejado IS NULL AND valor_planejado IS NULL) OR
      (impacto_financeiro_planejado = 'PLANEJADO' AND tipo_financeiro_planejado IS NOT NULL AND valor_planejado IS NOT NULL AND valor_planejado > 0)
    ),
    CONSTRAINT ck_atividade_valor_realizado CHECK (
      (impacto_financeiro_realizado IS NULL AND tipo_financeiro_realizado IS NULL AND valor_realizado IS NULL) OR
      (impacto_financeiro_realizado = 'SEM_IMPACTO' AND tipo_financeiro_realizado IS NULL AND valor_realizado IS NULL) OR
      (impacto_financeiro_realizado = 'INDEFINIDO' AND tipo_financeiro_realizado IS NULL AND valor_realizado IS NULL) OR
      (impacto_financeiro_realizado = 'REALIZADO' AND tipo_financeiro_realizado IS NOT NULL AND valor_realizado IS NOT NULL AND valor_realizado > 0)
    ),
    CONSTRAINT ck_atividade_concluida_data CHECK (estado <> 'CONCLUIDA' OR (data_realizada IS NOT NULL AND impacto_financeiro_realizado IS NOT NULL)),
    CONSTRAINT ck_atividade_cancelada_data CHECK (estado <> 'CANCELADA' OR cancelada_em IS NOT NULL)
);

CREATE INDEX ix_atividades_usuario_estado_data
    ON atividades (usuario_id, estado, data_prevista) WHERE excluida_em IS NULL;
CREATE INDEX ix_atividades_usuario_data_realizada
    ON atividades (usuario_id, data_realizada) WHERE excluida_em IS NULL;
CREATE INDEX ix_atividades_usuario_favorita
    ON atividades (usuario_id, favorita) WHERE excluida_em IS NULL;
CREATE INDEX ix_atividades_lixeira
    ON atividades (usuario_id, excluida_em) WHERE excluida_em IS NOT NULL;
CREATE INDEX ix_metas_usuario_periodo
    ON metas_mensais (usuario_id, ano, mes);

-- Migration 001: Schema inicial - Sistema de Estacionamento
-- Revisado por Diana | 2025-03-19

CREATE TYPE tipo_veiculo AS ENUM ('rotativo', 'mensalista');

CREATE TABLE config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_vagas int NOT NULL DEFAULT 80 CHECK (total_vagas > 0),
  valor_hora numeric(10,2) NOT NULL DEFAULT 5.00 CHECK (valor_hora >= 0),
  fracao_minima_minutos int NOT NULL DEFAULT 15 CHECK (fracao_minima_minutos > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE mensalistas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  placa text NOT NULL UNIQUE,
  validade_ate date NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_mensalistas_placa ON mensalistas(placa);
CREATE INDEX idx_mensalistas_validade_ativo ON mensalistas(validade_ate, ativo) WHERE ativo = true;

CREATE TABLE entradas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placa text NOT NULL,
  tipo tipo_veiculo NOT NULL,
  entrada_em timestamptz NOT NULL DEFAULT now(),
  saida_em timestamptz,
  valor_pago numeric(10,2),
  mensalista_id uuid REFERENCES mensalistas(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_saida_valor CHECK (
    (tipo = 'mensalista' AND valor_pago IS NULL) OR
    (tipo = 'rotativo' AND (saida_em IS NULL OR valor_pago IS NOT NULL))
  )
);

CREATE UNIQUE INDEX idx_entradas_placa_ativa ON entradas(placa) WHERE saida_em IS NULL;
CREATE INDEX idx_entradas_entrada_em ON entradas(entrada_em);
CREATE INDEX idx_entradas_saida_em ON entradas(saida_em) WHERE saida_em IS NULL;

INSERT INTO config (total_vagas, valor_hora, fracao_minima_minutos) VALUES (80, 5.00, 15);

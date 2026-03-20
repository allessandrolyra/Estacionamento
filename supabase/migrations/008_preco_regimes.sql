-- Migration 008: Múltiplas tabelas de preço (Fase 4)
-- Regimes: comercial, noturno, fim_semana

CREATE TABLE preco_regimes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  ordem int NOT NULL DEFAULT 0,
  dia_semana int[],
  hora_inicio int NOT NULL CHECK (hora_inicio >= 0 AND hora_inicio <= 23),
  hora_fim int NOT NULL CHECK (hora_fim >= 0 AND hora_fim <= 24),
  valor_hora numeric(10,2) NOT NULL CHECK (valor_hora >= 0),
  fracao_minutos int NOT NULL DEFAULT 15 CHECK (fracao_minutos > 0),
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE preco_regimes IS 'Regimes de preço por horário e dia. dia_semana: 0=dom, 1=seg, ..., 6=sab. NULL = todos. hora_fim < hora_inicio = cruza meia-noite (ex: 22-6).';

CREATE INDEX idx_preco_regimes_ativo_ordem ON preco_regimes(ativo, ordem) WHERE ativo = true;

ALTER TABLE preco_regimes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "preco_regimes_authenticated" ON preco_regimes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- comercial: seg-sex 6h-22h | noturno: seg-sex 22h-6h | fim_semana: sab-dom 0h-24h
INSERT INTO preco_regimes (nome, ordem, dia_semana, hora_inicio, hora_fim, valor_hora, fracao_minutos) VALUES
  ('comercial', 1, ARRAY[1,2,3,4,5], 6, 22, 5.00, 15),
  ('noturno', 2, ARRAY[1,2,3,4,5], 22, 6, 3.00, 30),
  ('fim_semana', 3, ARRAY[0,6], 0, 24, 4.00, 15);

-- Migration 002: Adiciona vaga_numero para mapa visual
-- Cada entrada passa a ter uma vaga atribuída (1 a total_vagas)

ALTER TABLE entradas ADD COLUMN vaga_numero int;

-- Para entradas existentes: atribuir números sequenciais (legado)
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY entrada_em) as rn
  FROM entradas
  WHERE saida_em IS NULL
)
UPDATE entradas e SET vaga_numero = r.rn
FROM ranked r WHERE e.id = r.id;

-- Constraint: vaga_numero único entre entradas ativas
CREATE UNIQUE INDEX idx_entradas_vaga_ativa ON entradas(vaga_numero) WHERE saida_em IS NULL;

-- Para novas entradas, vaga_numero será preenchido pela aplicação

-- Migration 010: Cobrança de mensalistas (Fase 1 + 2)
-- valor_mensalidade, pagamentos_mensal, controle de vencimento

-- 1. Valor mensalidade padrão em config
ALTER TABLE config
ADD COLUMN IF NOT EXISTS valor_mensalidade numeric(10,2) NOT NULL DEFAULT 200.00 CHECK (valor_mensalidade >= 0);

-- 2. Valor individual em mensalistas (opcional, sobrescreve config)
ALTER TABLE mensalistas
ADD COLUMN IF NOT EXISTS valor_mensalidade numeric(10,2) CHECK (valor_mensalidade IS NULL OR valor_mensalidade >= 0);

-- 3. Tabela de pagamentos mensais
CREATE TABLE IF NOT EXISTS pagamentos_mensal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mensalista_id uuid NOT NULL REFERENCES mensalistas(id) ON DELETE CASCADE,
  referencia text NOT NULL,
  valor numeric(10,2) NOT NULL CHECK (valor >= 0),
  forma_pagamento text,
  pago_em timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(mensalista_id, referencia)
);

COMMENT ON COLUMN pagamentos_mensal.referencia IS 'Mês/ano da mensalidade, ex: 2025-03';
COMMENT ON COLUMN pagamentos_mensal.forma_pagamento IS 'dinheiro, cartao_debito, cartao_credito, pix, boleto';

CREATE INDEX idx_pagamentos_mensal_mensalista ON pagamentos_mensal(mensalista_id);
CREATE INDEX idx_pagamentos_mensal_referencia ON pagamentos_mensal(referencia);

ALTER TABLE pagamentos_mensal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pagamentos_mensal_authenticated" ON pagamentos_mensal FOR ALL TO authenticated USING (true) WITH CHECK (true);

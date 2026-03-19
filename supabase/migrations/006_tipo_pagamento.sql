-- Migration 006: Tipo de pagamento e relatórios
-- Permite registrar forma de pagamento para relatórios futuros

CREATE TYPE tipo_pagamento AS ENUM ('dinheiro', 'cartao_debito', 'cartao_credito', 'pix', 'outros');

ALTER TABLE entradas
ADD COLUMN tipo_pagamento tipo_pagamento;

COMMENT ON COLUMN entradas.tipo_pagamento IS 'Forma de pagamento na saída (rotativo). NULL para mensalista.';

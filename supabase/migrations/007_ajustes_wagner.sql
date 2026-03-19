-- Migration 007: Ajustes sugeridos por Wagner (Arquiteto MEQ)
-- 1. Normalizar placas existentes (consistência)
-- 2. Função atômica para registrar entrada (evita condição de corrida)
-- 3. Remover leitura anon em config (não é necessária)
-- 4. Índice para relatórios por período e tipo de pagamento

-- ============================================================
-- 0. Normalizar placas existentes (remove hífen e espaços)
-- ============================================================
UPDATE entradas SET placa = regexp_replace(regexp_replace(upper(trim(placa)), ' ', '', 'g'), '-', '', 'g');
UPDATE mensalistas SET placa = regexp_replace(regexp_replace(upper(trim(placa)), ' ', '', 'g'), '-', '', 'g');

-- ============================================================
-- 1. Função atômica: registrar_entrada_atomica
-- ============================================================
CREATE OR REPLACE FUNCTION registrar_entrada_atomica(
  p_placa text,
  p_tipo tipo_veiculo,
  p_vaga_escolhida int DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_vagas int;
  v_vaga int;
  v_mensalista_id uuid;
  v_placa_norm text;
BEGIN
  v_placa_norm := regexp_replace(upper(trim(p_placa)), '[- ]', '', 'g');
  SELECT total_vagas INTO v_total_vagas FROM config LIMIT 1;

  IF EXISTS (SELECT 1 FROM entradas WHERE placa = v_placa_norm AND saida_em IS NULL) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Placa já possui entrada ativa');
  END IF;

  IF p_tipo = 'mensalista' THEN
    SELECT id INTO v_mensalista_id FROM mensalistas
    WHERE placa = v_placa_norm AND ativo = true AND validade_ate >= current_date
    LIMIT 1;
    IF v_mensalista_id IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'Mensalista não encontrado ou fora da validade');
    END IF;
  END IF;

  IF p_vaga_escolhida IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM entradas WHERE vaga_numero = p_vaga_escolhida AND saida_em IS NULL) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'Vaga indisponível');
    END IF;
    IF p_vaga_escolhida < 1 OR p_vaga_escolhida > v_total_vagas THEN
      RETURN jsonb_build_object('ok', false, 'error', 'Vaga inválida');
    END IF;
    v_vaga := p_vaga_escolhida;
  ELSE
    SELECT v.n INTO v_vaga
    FROM generate_series(1, v_total_vagas) v(n)
    WHERE NOT EXISTS (SELECT 1 FROM entradas WHERE vaga_numero = v.n AND saida_em IS NULL)
    LIMIT 1;
    IF v_vaga IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'Estacionamento lotado');
    END IF;
  END IF;

  IF p_tipo = 'mensalista' THEN
    INSERT INTO entradas (placa, tipo, mensalista_id, vaga_numero)
    VALUES (v_placa_norm, 'mensalista', v_mensalista_id, v_vaga);
  ELSE
    INSERT INTO entradas (placa, tipo, vaga_numero)
    VALUES (v_placa_norm, 'rotativo', v_vaga);
  END IF;

  RETURN jsonb_build_object('ok', true, 'vaga', v_vaga);
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Vaga indisponível. Tente novamente.');
END;
$$;

GRANT EXECUTE ON FUNCTION registrar_entrada_atomica(text, tipo_veiculo, int) TO authenticated;

-- ============================================================
-- 2. Remover política anon em config (não é necessária)
-- ============================================================
DROP POLICY IF EXISTS "config_anon_read" ON public.config;

-- ============================================================
-- 3. Índice para relatórios por período e tipo de pagamento
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_entradas_saida_tipo_pagamento
  ON entradas(saida_em, tipo_pagamento)
  WHERE saida_em IS NOT NULL;

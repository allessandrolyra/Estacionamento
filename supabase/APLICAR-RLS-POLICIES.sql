-- ============================================================
-- APLICAR POLÍTICAS RLS - Execute no Supabase SQL Editor
-- ============================================================
--
-- Corrige: Dashboard em branco, "nada acontece", dados não carregam.
-- Permite usuários autenticados acessarem config, mensalistas, entradas.
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.config TO anon, authenticated;
GRANT ALL ON public.mensalistas TO anon, authenticated;
GRANT ALL ON public.entradas TO anon, authenticated;

ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensalistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entradas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "config_all" ON public.config;
DROP POLICY IF EXISTS "config_select" ON public.config;
DROP POLICY IF EXISTS "config_update" ON public.config;
DROP POLICY IF EXISTS "config_anon_select" ON public.config;
DROP POLICY IF EXISTS "config_anon_read" ON public.config;
DROP POLICY IF EXISTS "mensalistas_all" ON public.mensalistas;
DROP POLICY IF EXISTS "entradas_all" ON public.entradas;

CREATE POLICY "config_all" ON public.config FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "mensalistas_all" ON public.mensalistas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "entradas_all" ON public.entradas FOR ALL TO authenticated USING (true) WITH CHECK (true);

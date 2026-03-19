-- Migration 004: Políticas RLS para config, mensalistas, entradas
-- Permite usuários autenticados (admin e operador) acessarem os dados.
-- Execute no Supabase SQL Editor se o Dashboard ou outras telas não carregarem.

-- Garantir permissões no schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.config TO anon, authenticated;
GRANT ALL ON public.mensalistas TO anon, authenticated;
GRANT ALL ON public.entradas TO anon, authenticated;

-- Habilitar RLS e criar políticas (permite acesso a usuários autenticados)
ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensalistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entradas ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "config_all" ON public.config;
DROP POLICY IF EXISTS "config_select" ON public.config;
DROP POLICY IF EXISTS "config_update" ON public.config;
DROP POLICY IF EXISTS "config_anon_select" ON public.config;
DROP POLICY IF EXISTS "mensalistas_all" ON public.mensalistas;
DROP POLICY IF EXISTS "entradas_all" ON public.entradas;

-- Config: leitura para anon (login), tudo para autenticados
CREATE POLICY "config_all" ON public.config FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "config_anon_read" ON public.config FOR SELECT TO anon USING (true);

-- Mensalistas e entradas: acesso total para autenticados
CREATE POLICY "mensalistas_all" ON public.mensalistas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "entradas_all" ON public.entradas FOR ALL TO authenticated USING (true) WITH CHECK (true);

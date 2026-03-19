-- ============================================================
-- CORRIGIR: "Database error querying schema" no login
-- ============================================================
--
-- Execute no Supabase SQL Editor.
--
-- Causa: usuários criados via SQL podem ter colunas token como NULL.
-- O Supabase Auth exige strings vazias, não NULL.
-- ============================================================

-- Corrigir tokens NULL em auth.users (causa do "Database error querying schema")
UPDATE auth.users SET confirmation_token = '' WHERE confirmation_token IS NULL;
UPDATE auth.users SET recovery_token = '' WHERE recovery_token IS NULL;
UPDATE auth.users SET email_change = '' WHERE email_change IS NULL;

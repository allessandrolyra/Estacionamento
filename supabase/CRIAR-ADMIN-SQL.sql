-- ============================================================
-- CRIAR USUÁRIO ADMIN PADRÃO - Execute no Supabase SQL Editor
-- ============================================================
--
-- Como usar:
-- 1. Acesse Supabase > SQL Editor
-- 2. Cole este script
-- 3. Clique em Run
--
-- Credenciais criadas:
--   Email: admin@estacionamento.local
--   Senha: Admin@123
--
-- Depois do primeiro login, altere a senha em Admin > Usuários
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  v_user_id UUID := gen_random_uuid();
  v_email TEXT := 'admin@estacionamento.local';
  v_encrypted_pw TEXT := crypt('Admin@123', gen_salt('bf'));
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
    RAISE NOTICE 'Admin já existe. Email: % | Senha: Admin@123', v_email;
    RETURN;
  END IF;

  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token, email_change,
    created_at, updated_at
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    v_email,
    v_encrypted_pw,
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"admin"}',
    '', '', '',
    NOW(),
    NOW()
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_user_id,
    v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', v_email),
    'email',
    v_user_id::text,
    NOW(),
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Admin criado! Email: % | Senha: Admin@123', v_email;
END $$;

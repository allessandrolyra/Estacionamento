-- ============================================================
-- FUNÇÃO PARA LISTAR USUÁRIOS - Execute no Supabase SQL Editor
-- ============================================================
--
-- Resolve "Database error finding users" - alternativa à API Admin.
-- Usa SQL direto em auth.users. Apenas Admin pode chamar.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_users_for_admin()
RETURNS TABLE (
  id uuid,
  email text,
  role text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') != 'admin' THEN
    RAISE EXCEPTION 'Acesso negado: apenas admin';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::text,
    COALESCE(u.raw_user_meta_data->>'role', 'operador')::text,
    u.created_at
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_users_for_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_users_for_admin() TO service_role;

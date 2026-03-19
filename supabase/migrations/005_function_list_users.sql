-- Migration 005: Função para listar usuários (alternativa à API Admin)
-- Resolve "Database error finding users" - usa SQL direto em auth.users

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
  -- Apenas admin pode chamar
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

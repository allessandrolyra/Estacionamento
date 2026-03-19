import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com service_role — APENAS server-side.
 * Usado para: criar usuários, listar usuários, atualizar roles.
 * NUNCA exponha SUPABASE_SERVICE_ROLE_KEY no client.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios");
  }
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

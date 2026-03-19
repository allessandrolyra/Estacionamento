import { createClient } from "@/lib/supabase/server";
import { listUsers } from "./actions";
import { UsuariosClient } from "./usuarios-client";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage() {
  let users: { id: string; email: string; role: "admin" | "operador"; createdAt: string }[] = [];
  let currentUserId = "";
  let error = "";

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    currentUserId = user?.id ?? "";

    users = await listUsers();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Database error") || msg.includes("finding users") || msg.includes("service_role")) {
      error = "Erro ao listar usuários. Configure SUPABASE_SERVICE_ROLE_KEY no Vercel (Settings > Environment Variables). Obtenha em Supabase > Project Settings > API > service_role.";
    } else {
      error = msg || "Erro ao carregar usuários. Verifique SUPABASE_SERVICE_ROLE_KEY.";
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: "1.5rem" }}>Gestão de usuários</h1>
      {error && (
        <p className="dash-msg error" style={{ marginBottom: "1rem" }}>
          {error}
        </p>
      )}
      <UsuariosClient users={users} currentUserId={currentUserId} />
    </div>
  );
}

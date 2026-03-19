import { listUsers } from "./actions";
import { UsuariosClient } from "./usuarios-client";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage() {
  let users: { id: string; email: string; role: "admin" | "operador"; createdAt: string }[] = [];
  let error = "";

  try {
    users = await listUsers();
  } catch (e) {
    error = e instanceof Error ? e.message : "Erro ao carregar usuários. Verifique se SUPABASE_SERVICE_ROLE_KEY está configurado no .env.local.";
  }

  return (
    <div>
      <h1 style={{ marginBottom: "1.5rem" }}>Gestão de usuários</h1>
      {error && (
        <p className="dash-msg error" style={{ marginBottom: "1rem" }}>
          {error}
        </p>
      )}
      <UsuariosClient users={users} />
    </div>
  );
}

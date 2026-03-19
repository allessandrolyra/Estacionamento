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
    error = e instanceof Error ? e.message : "Erro ao carregar usuários.";
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

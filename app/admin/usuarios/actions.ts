"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type Role = "admin" | "operador";

export async function listUsers() {
  // Usa função SQL (get_users_for_admin) - evita erro "Database error finding users" da API Admin
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_users_for_admin");
  if (error) {
    if (error.message.includes("does not exist") || error.code === "42883") {
      throw new Error(
        "Execute o SQL em supabase/FUNCAO-LISTAR-USUARIOS.sql no Supabase SQL Editor para criar a função get_users_for_admin."
      );
    }
    throw new Error(error.message);
  }
  return (data ?? []).map((u: { id: string; email: string; role: string; created_at: string }) => ({
    id: u.id,
    email: u.email ?? "",
    role: (u.role as Role) ?? "operador",
    createdAt: u.created_at,
  }));
}

export async function createUser(formData: FormData) {
  const email = formData.get("email")?.toString()?.trim();
  const password = formData.get("password")?.toString()?.trim();
  const role = (formData.get("role")?.toString() as Role) ?? "operador";

  if (!email || !password) throw new Error("Email e senha são obrigatórios.");
  if (password.length < 6) throw new Error("Senha deve ter no mínimo 6 caracteres.");

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role },
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/usuarios");
}

export async function updateUserRole(userId: string, role: Role) {
  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { role },
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/usuarios");
}

export async function deleteUser(userId: string, users: { id: string; role: Role }[]) {
  const admins = users.filter((u) => u.role === "admin");
  const userToDelete = users.find((u) => u.id === userId);
  if (userToDelete?.role === "admin" && admins.length <= 1) {
    throw new Error("Não é possível excluir o último admin do sistema.");
  }
  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/usuarios");
}

export async function resetUserPassword(userId: string, newPassword: string) {
  if (newPassword.length < 6) throw new Error("Senha deve ter no mínimo 6 caracteres.");
  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/usuarios");
}

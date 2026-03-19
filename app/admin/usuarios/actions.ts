"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type Role = "admin" | "operador";

export async function listUsers() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 100 });
  if (error) throw new Error(error.message);
  return data.users.map((u) => ({
    id: u.id,
    email: u.email ?? "",
    role: (u.user_metadata?.role as Role) ?? "operador",
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

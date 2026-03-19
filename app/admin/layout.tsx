import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "../dashboard/logout-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const role = user.user_metadata?.role;
  if (role !== "admin") redirect("/dashboard");

  return (
    <div className="dash-layout">
      <header className="dash-header admin-header">
        <nav className="dash-nav">
          <Link href="/admin/dashboard" className="dash-nav-main">Admin</Link>
          <Link href="/admin/dashboard">Dashboard</Link>
          <Link href="/dashboard">Operações</Link>
          <Link href="/admin/mapa">Mapa de Vagas</Link>
          <Link href="/admin/mensalistas">Mensalistas</Link>
          <Link href="/admin/config">Config</Link>
          <Link href="/admin/usuarios">Usuários</Link>
        </nav>
        <LogoutButton />
      </header>
      <main className="dash-main">{children}</main>
    </div>
  );
}

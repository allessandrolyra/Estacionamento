import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "./logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const isAdmin = user.user_metadata?.role === "admin";

  return (
    <div className="dash-layout">
      <header className="dash-header">
        <nav className="dash-nav">
          <Link href="/dashboard" className="dash-nav-main">Estacionamento</Link>
          <Link href="/dashboard/mapa">Mapa de Vagas</Link>
          {isAdmin && (
            <>
              <Link href="/admin/fechamento">Fechamento</Link>
              <Link href="/admin/dashboard">Admin</Link>
            </>
          )}
        </nav>
        <LogoutButton />
      </header>
      <main className="dash-main">{children}</main>
    </div>
  );
}

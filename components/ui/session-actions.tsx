"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Users } from "lucide-react";

async function handleLogout(router: ReturnType<typeof useRouter>, redirectTo?: string) {
  const supabase = createClient();
  await supabase.auth.signOut();
  router.push(redirectTo ?? "/login");
  router.refresh();
}

export function SessionActions() {
  const router = useRouter();

  return (
    <div className="session-actions">
      <button
        type="button"
        className="session-btn session-btn-switch"
        onClick={() => handleLogout(router, "/login?trocar=1")}
        title="Trocar de usuário"
      >
        <Users size={18} aria-hidden />
        <span>Trocar usuário</span>
      </button>
      <button
        type="button"
        className="session-btn session-btn-logout"
        onClick={() => handleLogout(router)}
        title="Sair do sistema"
      >
        <LogOut size={18} aria-hidden />
        <span>Sair</span>
      </button>
    </div>
  );
}

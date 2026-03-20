"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  MapPin,
  Users,
  BarChart3,
  Receipt,
  Search,
  Settings,
  UserCog,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { LogoutButton } from "@/app/dashboard/logout-button";

const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard", label: "Operações", icon: Car },
  { href: "/admin/mapa", label: "Mapa", icon: MapPin },
  { href: "/admin/mensalistas", label: "Mensalistas", icon: Users },
  { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/admin/fechamento", label: "Fechamento", icon: Receipt },
  { href: "/admin/historico", label: "Consulta Placa", icon: Search },
  { href: "/admin/config", label: "Config", icon: Settings },
  { href: "/admin/usuarios", label: "Usuários", icon: UserCog },
];

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const NavLink = ({ href, label, icon: Icon }: (typeof LINKS)[0]) => {
    const isActive = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        onClick={() => setDrawerOpen(false)}
        className={`admin-nav-link ${isActive ? "active" : ""}`}
      >
        <Icon size={20} aria-hidden />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link href="/admin/dashboard" className="admin-sidebar-brand">
            Admin
          </Link>
        </div>
        <nav className="admin-sidebar-nav">
          {LINKS.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <LogoutButton />
        </div>
      </aside>

      <button
        type="button"
        className="admin-sidebar-toggle"
        onClick={() => setDrawerOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu size={24} />
      </button>

      <div className={`admin-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="admin-drawer-header">
          <span>Menu</span>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={22} />
          </button>
        </div>
        <nav className="admin-drawer-nav">
          {LINKS.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>
        <div className="admin-drawer-footer">
          <LogoutButton />
        </div>
      </div>

      {drawerOpen && (
        <div
          className="admin-drawer-backdrop"
          onClick={() => setDrawerOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setDrawerOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Fechar menu"
        />
      )}

      <main className="admin-main">{children}</main>
    </div>
  );
}

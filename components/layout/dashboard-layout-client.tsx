"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, MapPin, Receipt, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";
import { SessionActions } from "@/components/ui/session-actions";

interface Props {
  isAdmin: boolean;
  children: React.ReactNode;
}

export function DashboardLayoutClient({ isAdmin, children }: Props) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const links = [
    { href: "/dashboard", label: "Operações", icon: Car },
    { href: "/dashboard/mapa", label: "Mapa de Vagas", icon: MapPin },
    ...(isAdmin
      ? [
          { href: "/admin/fechamento", label: "Fechamento", icon: Receipt },
          { href: "/admin/dashboard", label: "Admin", icon: LayoutDashboard },
        ]
      : []),
  ];

  const NavLink = ({ href, label, icon: Icon }: (typeof links)[0]) => {
    const isActive = pathname === href || pathname.startsWith(href + "/");
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
          <Link href="/dashboard" className="admin-sidebar-brand">
            Estacionamento
          </Link>
        </div>
        <nav className="admin-sidebar-nav">
          {links.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <SessionActions />
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
          {links.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>
        <div className="admin-drawer-footer">
          <SessionActions />
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

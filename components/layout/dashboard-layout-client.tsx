"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, MapPin, Receipt, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";
import { LogoutButton } from "@/app/dashboard/logout-button";

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
        className={`dash-nav-link ${isActive ? "active" : ""}`}
      >
        <Icon size={18} aria-hidden />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="dash-layout">
      <header className="dash-header">
        <div className="dash-header-start">
          <div className="dash-header-nav-desktop">
            {links.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </div>
          <button
            type="button"
            className="dash-header-toggle"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={24} />
          </button>
        </div>
        <LogoutButton />
      </header>

      <div className={`dash-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="dash-drawer-header">
          <span>Menu</span>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={22} />
          </button>
        </div>
        <nav className="dash-drawer-nav">
          {links.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>
      </div>

      {drawerOpen && (
        <div
          className="dash-drawer-backdrop"
          onClick={() => setDrawerOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setDrawerOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Fechar menu"
        />
      )}

      <main className="dash-main">{children}</main>
    </div>
  );
}

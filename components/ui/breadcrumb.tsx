import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Item {
  label: string;
  href?: string;
}

interface Props {
  items: Item[];
}

export function Breadcrumb({ items }: Props) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {i > 0 && <ChevronRight size={16} className="breadcrumb-sep" aria-hidden />}
          {item.href ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            <span style={{ color: "var(--color-primary)" }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

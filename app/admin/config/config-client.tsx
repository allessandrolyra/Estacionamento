"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  id?: string;
  totalVagas: number;
  valorHora: number;
  fracaoMinima: number;
}

export function ConfigClient({ id, totalVagas, valorHora, fracaoMinima }: Props) {
  const [total, setTotal] = useState(totalVagas);
  const [valor, setValor] = useState(valorHora);
  const [fracao, setFracao] = useState(fracaoMinima);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const supabase = createClient();
    if (!id) {
      setMsg("Config não encontrada. Execute a migration no Supabase.");
      return;
    }
    const { error } = await supabase
      .from("config")
      .update({ total_vagas: total, valor_hora: valor, fracao_minima_minutos: fracao })
      .eq("id", id);
    if (error) {
      setMsg(error.message);
      return;
    }
    setMsg("Salvo!");
    router.refresh();
  }

  return (
    <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.9rem" }}>Total de vagas</label>
          <input
            type="number"
            min={1}
            value={total}
            onChange={(e) => setTotal(parseInt(e.target.value) || 80)}
            style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.9rem" }}>Valor por hora (R$)</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={valor}
            onChange={(e) => setValor(parseFloat(e.target.value) || 0)}
            style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.9rem" }}>Fração mínima (minutos)</label>
          <input
            type="number"
            min={1}
            value={fracao}
            onChange={(e) => setFracao(parseInt(e.target.value) || 15)}
            style={{ width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        </div>
        <button type="submit" style={{ padding: "0.6rem 1.5rem", background: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Salvar
        </button>
      </form>
      {msg && <p style={{ marginTop: "1rem", padding: "0.5rem", background: "#f0fdf4", borderRadius: "4px" }}>{msg}</p>}
    </div>
  );
}

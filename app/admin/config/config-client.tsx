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
    <div className="dash-form-card config-form">
      <form onSubmit={handleSubmit}>
        <div className="dash-field">
          <label>Total de vagas</label>
          <input
            type="number"
            min={1}
            className="dash-input"
            value={total}
            onChange={(e) => setTotal(parseInt(e.target.value) || 80)}
          />
        </div>
        <div className="dash-field">
          <label>Valor por hora (R$)</label>
          <input
            type="number"
            min={0}
            step={0.01}
            className="dash-input"
            value={valor}
            onChange={(e) => setValor(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="dash-field">
          <label>Fração mínima (minutos)</label>
          <input
            type="number"
            min={1}
            className="dash-input"
            value={fracao}
            onChange={(e) => setFracao(parseInt(e.target.value) || 15)}
          />
        </div>
        <button type="submit" className="dash-btn dash-btn-primary">
          Salvar
        </button>
      </form>
      {msg && (
        <p className={`dash-msg ${msg === "Salvo!" ? "success" : "error"}`} style={{ marginTop: "1rem" }}>
          {msg}
        </p>
      )}
    </div>
  );
}

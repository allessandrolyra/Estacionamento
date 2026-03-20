"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Regime {
  id: string;
  nome: string;
  valor_hora: number;
  fracao_minutos: number;
}

interface Props {
  regimes: Regime[];
}

const LABELS: Record<string, string> = {
  comercial: "Comercial (seg–sex 6h–22h)",
  noturno: "Noturno (seg–sex 22h–6h)",
  fim_semana: "Fim de semana (sáb–dom)",
};

export function RegimesClient({ regimes: initial }: Props) {
  const [regimes, setRegimes] = useState(initial);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function handleSave(id: string, valorHora: number, fracaoMinutos: number) {
    setMsg("");
    const supabase = createClient();
    const { error } = await supabase
      .from("preco_regimes")
      .update({ valor_hora: valorHora, fracao_minutos: fracaoMinutos, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      setMsg(error.message);
      return;
    }
    setRegimes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, valor_hora: valorHora, fracao_minutos: fracaoMinutos } : r))
    );
    setMsg("Regime salvo!");
    router.refresh();
  }

  return (
    <div className="dash-form-card config-form" style={{ marginTop: "1.5rem" }}>
      <h2>Tabelas de preço</h2>
      <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1rem" }}>
        O valor é aplicado conforme o horário de saída. Se nenhum regime se aplicar, usa o valor padrão acima.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {regimes.map((r) => (
          <RegimeRow
            key={r.id}
            regime={r}
            onSave={(vh, fm) => handleSave(r.id, vh, fm)}
          />
        ))}
      </div>
      {regimes.length === 0 && (
        <p style={{ color: "#64748b" }}>
          Nenhum regime configurado. Execute a migration 008 no Supabase.
        </p>
      )}
      {msg && (
        <p className={`dash-msg ${msg.includes("salvo") ? "success" : "error"}`} style={{ marginTop: "1rem" }}>
          {msg}
        </p>
      )}
    </div>
  );
}

function RegimeRow({
  regime,
  onSave,
}: {
  regime: Regime;
  onSave: (valorHora: number, fracaoMinutos: number) => void;
}) {
  const [valorHora, setValorHora] = useState(regime.valor_hora);
  const [fracaoMin, setFracaoMin] = useState(regime.fracao_minutos);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
        alignItems: "flex-end",
        padding: "1rem",
        background: "#f8fafc",
        borderRadius: "8px",
      }}
    >
      <div style={{ minWidth: "180px" }}>
        <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
          {LABELS[regime.nome] ?? regime.nome}
        </label>
      </div>
      <div className="dash-field" style={{ margin: 0, minWidth: "100px" }}>
        <label>R$/hora</label>
        <input
          type="number"
          min={0}
          step={0.01}
          className="dash-input"
          value={valorHora}
          onChange={(e) => setValorHora(parseFloat(e.target.value) || 0)}
        />
      </div>
      <div className="dash-field" style={{ margin: 0, minWidth: "100px" }}>
        <label>Fração (min)</label>
        <input
          type="number"
          min={1}
          className="dash-input"
          value={fracaoMin}
          onChange={(e) => setFracaoMin(parseInt(e.target.value) || 15)}
        />
      </div>
      <button
        type="button"
        className="dash-btn dash-btn-primary"
        onClick={() => onSave(valorHora, fracaoMin)}
      >
        Salvar
      </button>
    </div>
  );
}

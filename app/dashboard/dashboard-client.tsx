"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { registrarEntrada, registrarSaida } from "@/lib/services/entrada-service";
import type { TipoVeiculo } from "@/lib/types";

interface Props {
  total: number;
  ocupadas: number;
  disponiveis: number;
  lotado: boolean;
}

export function DashboardClient({ total, ocupadas, disponiveis, lotado }: Props) {
  const [vagas, setVagas] = useState({ total, ocupadas, disponiveis, lotado });
  const [placaEntrada, setPlacaEntrada] = useState("");
  const [tipoEntrada, setTipoEntrada] = useState<TipoVeiculo>("rotativo");
  const [placaSaida, setPlacaSaida] = useState("");
  const [msg, setMsg] = useState("");
  const [valorPago, setValorPago] = useState<number | null>(null);

  useEffect(() => {
    setVagas({ total, ocupadas, disponiveis, lotado });
  }, [total, ocupadas, disponiveis, lotado]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("vagas")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "entradas" },
        async () => {
          const { data: c } = await supabase.from("config").select("total_vagas").single();
          const { count } = await supabase
            .from("entradas")
            .select("*", { count: "exact", head: true })
            .is("saida_em", null);
          const t = c?.total_vagas ?? 80;
          const o = count ?? 0;
          const d = Math.max(0, t - o);
          setVagas({ total: t, ocupadas: o, disponiveis: d, lotado: d === 0 });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleEntrada(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const r = await registrarEntrada(placaEntrada.trim(), tipoEntrada);
    if (r.ok) {
      const lado = r.vaga && r.vaga <= 40 ? "esquerdo" : "direito";
      setMsg(r.vaga ? `Entrada registrada! Vaga ${r.vaga} (${lado})` : "Entrada registrada!");
      setPlacaEntrada("");
    } else {
      setMsg(r.error || "Erro");
    }
  }

  async function handleSaida(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setValorPago(null);
    const r = await registrarSaida(placaSaida.trim());
    if (r.ok) {
      setMsg("Saída registrada!");
      if (r.valorPago != null) setValorPago(r.valorPago);
      setPlacaSaida("");
    } else {
      setMsg(r.error || "Erro");
    }
  }

  return (
    <div className="dash-container">
      {vagas.lotado && (
        <div className="dash-alert-lotado">LOTADO</div>
      )}

      <div className="dash-stats">
        <div className="dash-stat-card">
          <div className="dash-stat-value total">{vagas.total}</div>
          <div className="dash-stat-label">Total</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-value disponiveis">{vagas.disponiveis}</div>
          <div className="dash-stat-label">Disponíveis</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-value ocupadas">{vagas.ocupadas}</div>
          <div className="dash-stat-label">Ocupadas</div>
        </div>
      </div>

      <div className="dash-forms">
        <div className="dash-form-card">
          <h2>Entrada</h2>
          <form onSubmit={handleEntrada}>
            <div className="dash-field">
              <label>Placa</label>
              <input
                type="text"
                className="dash-input"
                value={placaEntrada}
                onChange={(e) => setPlacaEntrada(e.target.value.toUpperCase())}
                placeholder="ABC-1234"
                maxLength={8}
                disabled={vagas.lotado}
              />
            </div>
            <div className="dash-field">
              <label>Tipo</label>
              <select
                className="dash-input"
                value={tipoEntrada}
                onChange={(e) => setTipoEntrada(e.target.value as TipoVeiculo)}
              >
                <option value="rotativo">Rotativo</option>
                <option value="mensalista">Mensalista</option>
              </select>
            </div>
            <button
              type="submit"
              className="dash-btn dash-btn-entrada"
              disabled={vagas.lotado}
            >
              Registrar Entrada
            </button>
          </form>
        </div>

        <div className="dash-form-card">
          <h2>Saída</h2>
          <form onSubmit={handleSaida}>
            <div className="dash-field">
              <label>Placa</label>
              <input
                type="text"
                className="dash-input"
                value={placaSaida}
                onChange={(e) => setPlacaSaida(e.target.value.toUpperCase())}
                placeholder="ABC-1234"
                maxLength={8}
              />
            </div>
            {valorPago != null && (
              <p className="dash-valor-pago">Valor: R$ {valorPago.toFixed(2)}</p>
            )}
            <button type="submit" className="dash-btn dash-btn-saida">
              Registrar Saída
            </button>
          </form>
        </div>
      </div>

      {msg && (
        <p className={`dash-msg ${msg.includes("Erro") ? "error" : "success"}`}>{msg}</p>
      )}
    </div>
  );
}

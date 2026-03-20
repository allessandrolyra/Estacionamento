"use client";

import { useState } from "react";
import { buscarHistoricoPorPlaca, type EntradaHistorico } from "@/lib/services/historico-service";

function formatarDataBR(d: string) {
  return new Date(d).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function tempoMinutos(entrada: string, saida: string | null): string {
  if (!saida) return "Em uso";
  return `${Math.ceil((new Date(saida).getTime() - new Date(entrada).getTime()) / 60000)} min`;
}

function labelPagamento(tipo: string | null, tipoVeiculo: string): string {
  if (tipoVeiculo === "mensalista") return "Isento";
  if (!tipo) return "-";
  const labels: Record<string, string> = {
    dinheiro: "Dinheiro",
    cartao_debito: "Cartão Débito",
    cartao_credito: "Cartão Crédito",
    pix: "PIX",
  };
  return labels[tipo] ?? tipo;
}

export function HistoricoClient() {
  const [placa, setPlaca] = useState("");
  const [entradas, setEntradas] = useState<EntradaHistorico[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [buscou, setBuscou] = useState(false);

  async function handleBuscar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro("");
    setBuscou(true);
    try {
      const r = await buscarHistoricoPorPlaca(placa.trim());
      if (r.ok) {
        setEntradas(r.entradas);
      } else {
        setErro(r.error);
        setEntradas([]);
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="dash-container">
      <h1 className="page-title">Consulta por Placa</h1>

      <div className="dash-form-card">
        <h2>Buscar</h2>
        <form onSubmit={handleBuscar}>
          <div className="dash-field">
            <label>Placa</label>
            <input
              type="text"
              className="dash-input"
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              placeholder="ABC-1234 ou ABC1D23"
              maxLength={8}
              disabled={carregando}
            />
          </div>
          <button
            type="submit"
            className="dash-btn dash-btn-entrada"
            disabled={carregando || !placa.trim()}
          >
            {carregando ? "Buscando..." : "Buscar"}
          </button>
        </form>
      </div>

      {erro && (
        <div className="dash-msg error" style={{ marginTop: "1rem" }}>
          {erro}
        </div>
      )}

      {buscou && !carregando && (
        <div className="dash-form-card" style={{ marginTop: "1.5rem" }}>
          <h2>
            {entradas.length > 0
              ? `${entradas.length} registro(s) encontrado(s)`
              : "Nenhum registro encontrado"}
          </h2>
          {entradas.length > 0 && (
            <div className="relatorios-table-wrap">
              <table className="admin-usuarios-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Vaga</th>
                    <th>Entrada</th>
                    <th>Saída</th>
                    <th>Tempo</th>
                    <th>Valor</th>
                    <th>Pagamento</th>
                  </tr>
                </thead>
                <tbody>
                  {entradas.map((e) => (
                    <tr key={e.id}>
                      <td>{e.tipo}</td>
                      <td>{e.vaga_numero ?? "-"}</td>
                      <td>{formatarDataBR(e.entrada_em)}</td>
                      <td>
                        {e.saida_em ? formatarDataBR(e.saida_em) : "—"}
                      </td>
                      <td>{tempoMinutos(e.entrada_em, e.saida_em)}</td>
                      <td>
                        R$ {(e.valor_pago ?? 0).toFixed(2)}
                      </td>
                      <td>
                        {labelPagamento(e.tipo_pagamento, e.tipo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

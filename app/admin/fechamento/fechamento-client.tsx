"use client";

import { useState, useEffect, useCallback } from "react";
import {
  buscarRelatorio,
  type EntradaRelatorio,
  type ResumoRelatorio,
} from "@/lib/services/relatorio-service";
import { Breadcrumb } from "@/components/ui/breadcrumb";

function formatarDataBR(d: string) {
  return new Date(d).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function tempoMinutos(entrada: string, saida: string): number {
  return Math.ceil(
    (new Date(saida).getTime() - new Date(entrada).getTime()) / 60000
  );
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

export function FechamentoClient() {
  const hoje = new Date().toISOString().slice(0, 10);
  const [data, setData] = useState(hoje);
  const [entradas, setEntradas] = useState<EntradaRelatorio[]>([]);
  const [resumo, setResumo] = useState<ResumoRelatorio | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const r = await buscarRelatorio({
        dataInicial: data,
        dataFinal: data,
      });
      setEntradas(r.entradas);
      setResumo(r.resumo);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao carregar");
    } finally {
      setCarregando(false);
    }
  }, [data]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function handleImprimir() {
    const janela = window.open("", "_blank", "width=800,height=600");
    if (!janela) return;
    const dataBR = new Date(data + "T12:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    janela.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Fechamento de Caixa - ${data}</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 2rem; font-size: 14px; }
          h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
          .subtitulo { color: #666; margin-bottom: 1.5rem; }
          .resumo { display: flex; gap: 2rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
          .resumo-item { padding: 0.75rem 1rem; background: #f1f5f9; border-radius: 8px; }
          .resumo-item strong { display: block; font-size: 1.25rem; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 0.5rem; border-bottom: 1px solid #e2e8f0; text-align: left; }
          th { background: #f8fafc; font-weight: 600; }
          @media print { body { padding: 1rem; } }
        </style>
      </head>
      <body>
        <h1>Fechamento de Caixa</h1>
        <p class="subtitulo">Estacionamento — ${dataBR}</p>
        <div class="resumo">
          <div class="resumo-item"><strong>R$ ${resumo?.totalRecebido.toFixed(2) ?? "0,00"}</strong>Total recebido</div>
          <div class="resumo-item"><strong>${resumo?.quantidadeSaidas ?? 0}</strong>Saídas</div>
          <div class="resumo-item"><strong>R$ ${resumo?.valorMedio.toFixed(2) ?? "0,00"}</strong>Valor médio</div>
        </div>
        ${(resumo?.porTipoPagamento ?? []).map((p) => `<div class="resumo-item"><strong>R$ ${p.valor.toFixed(2)}</strong>${p.tipo} (${p.quantidade})</div>`).join("")}
        <h2 style="margin-top: 1.5rem; font-size: 1.1rem;">Movimentação</h2>
        <table>
          <thead><tr><th>Placa</th><th>Tipo</th><th>Entrada</th><th>Saída</th><th>Tempo</th><th>Valor</th><th>Pagamento</th></tr></thead>
          <tbody>
            ${entradas.map((e) => `
              <tr>
                <td>${e.placa}</td>
                <td>${e.tipo}</td>
                <td>${formatarDataBR(e.entrada_em)}</td>
                <td>${formatarDataBR(e.saida_em)}</td>
                <td>${tempoMinutos(e.entrada_em, e.saida_em)} min</td>
                <td>R$ ${(e.valor_pago ?? 0).toFixed(2)}</td>
                <td>${labelPagamento(e.tipo_pagamento, e.tipo)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <p style="margin-top: 1.5rem; font-size: 0.85rem; color: #64748b;">Impresso em ${new Date().toLocaleString("pt-BR")}</p>
      </body>
      </html>
    `);
    janela.document.close();
    janela.focus();
    setTimeout(() => {
      janela.print();
      janela.close();
    }, 250);
  }

  return (
    <div className="dash-container">
      <Breadcrumb items={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Fechamento de Caixa" }]} />
      <h1 className="page-title">Fechamento de Caixa</h1>

      <div className="dash-form-card">
        <div className="dash-field" style={{ maxWidth: "200px" }}>
          <label>Data</label>
          <input
            type="date"
            className="dash-input"
            value={data}
            onChange={(e) => setData(e.target.value)}
            disabled={carregando}
          />
        </div>
      </div>

      {erro && (
        <div className="dash-msg error" style={{ marginTop: "1rem" }}>
          {erro}
        </div>
      )}

      {carregando && (
        <p style={{ marginTop: "1rem", color: "#64748b" }}>Carregando...</p>
      )}

      {!carregando && resumo && (
        <>
          <div className="dash-stats" style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}>
            <div className="dash-stat-card">
              <div className="dash-stat-value total">
                R$ {resumo.totalRecebido.toFixed(2)}
              </div>
              <div className="dash-stat-label">Total recebido</div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-value ocupadas">{resumo.quantidadeSaidas}</div>
              <div className="dash-stat-label">Saídas</div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-value disponiveis">
                R$ {resumo.valorMedio.toFixed(2)}
              </div>
              <div className="dash-stat-label">Valor médio</div>
            </div>
          </div>

          {resumo.porTipoPagamento.length > 0 && (
            <div className="dash-form-card" style={{ marginBottom: "1.5rem" }}>
              <h2>Por tipo de pagamento</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                {resumo.porTipoPagamento.map((p) => (
                  <div
                    key={p.tipo}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "#f1f5f9",
                      borderRadius: "8px",
                      fontSize: "0.95rem",
                    }}
                  >
                    <strong>{p.tipo}:</strong> R$ {p.valor.toFixed(2)} ({p.quantidade})
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="dash-form-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <h2 style={{ margin: 0 }}>Movimentação ({entradas.length} registros)</h2>
              <button
                type="button"
                className="dash-btn dash-btn-primary"
                style={{ width: "auto", minWidth: "140px" }}
                onClick={handleImprimir}
                disabled={carregando || entradas.length === 0}
              >
                Imprimir
              </button>
            </div>
            <div className="relatorios-table-wrap">
              <table className="admin-usuarios-table">
                <thead>
                  <tr>
                    <th>Placa</th>
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
                      <td>{e.placa}</td>
                      <td>{e.tipo}</td>
                      <td>{e.vaga_numero ?? "-"}</td>
                      <td>{formatarDataBR(e.entrada_em)}</td>
                      <td>{formatarDataBR(e.saida_em)}</td>
                      <td>{tempoMinutos(e.entrada_em, e.saida_em)} min</td>
                      <td>R$ {(e.valor_pago ?? 0).toFixed(2)}</td>
                      <td>{labelPagamento(e.tipo_pagamento, e.tipo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {entradas.length === 0 && !carregando && (
              <div className="dash-empty-state">
                <span className="dash-empty-state-icon" aria-hidden>📄</span>
                <p style={{ margin: 0 }}>Nenhuma movimentação nesta data</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

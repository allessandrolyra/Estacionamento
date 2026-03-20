"use client";

import { useState, useEffect } from "react";
import {
  buscarRelatorio,
  exportarCSV,
  type FiltrosRelatorio,
  type EntradaRelatorio,
  type ResumoRelatorio,
} from "@/lib/services/relatorio-service";
import { FeedbackMessage } from "@/components/ui/feedback-message";

const ITENS_POR_PAGINA = 20;

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

export function RelatoriosClient() {
  const hoje = new Date().toISOString().slice(0, 10);
  const primeiroDia = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  const [filtros, setFiltros] = useState<FiltrosRelatorio>({
    dataInicial: primeiroDia,
    dataFinal: hoje,
    tipoPagamento: "todos",
    tipoVeiculo: "todos",
  });
  const [entradas, setEntradas] = useState<EntradaRelatorio[]>([]);
  const [resumo, setResumo] = useState<ResumoRelatorio | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [pagina, setPagina] = useState(1);

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      const { entradas: e, resumo: r } = await buscarRelatorio(filtros);
      setEntradas(e);
      setResumo(r);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao carregar");
    } finally {
      setCarregando(false);
      setPagina(1);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const paginadas = entradas.slice(
    (pagina - 1) * ITENS_POR_PAGINA,
    pagina * ITENS_POR_PAGINA
  );
  const totalPaginas = Math.ceil(entradas.length / ITENS_POR_PAGINA);

  function handleExportar() {
    const csv = exportarCSV(entradas);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${filtros.dataInicial}-${filtros.dataFinal}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImprimir() {
    const janela = window.open("", "_blank", "width=900,height=700");
    if (!janela) return;
    const dataIniBR = new Date(filtros.dataInicial + "T12:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const dataFimBR = new Date(filtros.dataFinal + "T12:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const cores = ["#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6", "#64748b"];
    const porTipo = (resumo?.porTipoPagamento ?? []).filter((p) => p.valor > 0);
    const total = resumo?.totalRecebido ?? 1;
    let acc = 0;
    const graficoPizza =
      porTipo.length > 0 && total > 0
        ? porTipo
            .map((p, i) => {
              const pct = (p.valor / total) * 100;
              const start = acc;
              acc += pct;
              return `${cores[i % cores.length]} ${start}% ${acc}%`;
            })
            .join(", ")
        : "transparent 0% 100%";
    janela.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Relatório - ${filtros.dataInicial} a ${filtros.dataFinal}</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 2rem; font-size: 13px; }
          h1 { font-size: 1.4rem; margin-bottom: 0.25rem; }
          .subtitulo { color: #666; margin-bottom: 1.5rem; }
          .resumo { display: flex; gap: 1.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
          .resumo-item { padding: 0.6rem 1rem; background: #f1f5f9; border-radius: 8px; }
          .resumo-item strong { display: block; font-size: 1.15rem; }
          .graficos { display: flex; gap: 2rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: flex-start; }
          .grafico-pizza { width: 180px; height: 180px; border-radius: 50%; background: conic-gradient(${graficoPizza}); flex-shrink: 0; }
          .grafico-legenda { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; }
          .legenda-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; }
          .legenda-cor { width: 12px; height: 12px; border-radius: 3px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { padding: 0.4rem 0.5rem; border-bottom: 1px solid #e2e8f0; text-align: left; }
          th { background: #f8fafc; font-weight: 600; }
          @media print { body { padding: 1rem; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <h1>Relatório de Movimentação</h1>
        <p class="subtitulo">Estacionamento — ${dataIniBR} a ${dataFimBR}</p>
        <div class="resumo">
          <div class="resumo-item"><strong>R$ ${resumo?.totalRecebido.toFixed(2) ?? "0,00"}</strong>Total recebido</div>
          <div class="resumo-item"><strong>${resumo?.quantidadeSaidas ?? 0}</strong>Saídas</div>
          <div class="resumo-item"><strong>R$ ${resumo?.valorMedio.toFixed(2) ?? "0,00"}</strong>Valor médio</div>
        </div>
        ${porTipo.length > 0 && total > 0 ? `
        <div class="graficos">
          <div class="grafico-pizza" aria-hidden="true"></div>
          <div class="grafico-legenda">
            ${porTipo.map((p, i) => {
              const pct = total > 0 ? (p.valor / total) * 100 : 0;
              return `<span class="legenda-item"><span class="legenda-cor" style="background:${cores[i % cores.length]}"></span>${p.tipo}: ${pct.toFixed(1)}% (R$ ${p.valor.toFixed(2)})</span>`;
            }).join("")}
          </div>
        </div>
        ` : ""}
        <h2 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Movimentação (${entradas.length} registros)</h2>
        <table>
          <thead><tr><th>Placa</th><th>Tipo</th><th>Vaga</th><th>Entrada</th><th>Saída</th><th>Tempo</th><th>Valor</th><th>Pagamento</th></tr></thead>
          <tbody>
            ${entradas.map((e) => `
              <tr>
                <td>${e.placa}</td>
                <td>${e.tipo}</td>
                <td>${e.vaga_numero ?? "-"}</td>
                <td>${formatarDataBR(e.entrada_em)}</td>
                <td>${formatarDataBR(e.saida_em)}</td>
                <td>${tempoMinutos(e.entrada_em, e.saida_em)} min</td>
                <td>R$ ${(e.valor_pago ?? 0).toFixed(2)}</td>
                <td>${labelPagamento(e.tipo_pagamento, e.tipo)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <p style="margin-top: 1rem; font-size: 0.8rem; color: #64748b;">Impresso em ${new Date().toLocaleString("pt-BR")}</p>
      </body>
      </html>
    `);
    janela.document.close();
    janela.focus();
    setTimeout(() => {
      janela.print();
      janela.close();
    }, 300);
  }

  const maxValor = Math.max(
    ...(resumo?.porTipoPagamento.map((p) => p.valor) ?? [1]),
    1
  );

  return (
    <div className="dash-container relatorios-container">
      <h1 className="page-title">Relatórios</h1>

      <div className="relatorios-filtros dash-form-card">
        <h2>Filtros</h2>
        <div className="relatorios-filtros-grid">
          <div className="dash-field">
            <label>Data inicial</label>
            <input
              type="date"
              className="dash-input"
              value={filtros.dataInicial}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, dataInicial: e.target.value }))
              }
            />
          </div>
          <div className="dash-field">
            <label>Data final</label>
            <input
              type="date"
              className="dash-input"
              value={filtros.dataFinal}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, dataFinal: e.target.value }))
              }
            />
          </div>
          <div className="dash-field">
            <label>Tipo de pagamento</label>
            <select
              className="dash-input"
              value={filtros.tipoPagamento ?? "todos"}
              onChange={(e) =>
                setFiltros((f) => ({
                  ...f,
                  tipoPagamento: e.target.value as FiltrosRelatorio["tipoPagamento"],
                }))
              }
            >
              <option value="todos">Todos</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao_debito">Cartão Débito</option>
              <option value="cartao_credito">Cartão Crédito</option>
              <option value="pix">PIX</option>
            </select>
          </div>
          <div className="dash-field">
            <label>Tipo de veículo</label>
            <select
              className="dash-input"
              value={filtros.tipoVeiculo ?? "todos"}
              onChange={(e) =>
                setFiltros((f) => ({
                  ...f,
                  tipoVeiculo: e.target.value as FiltrosRelatorio["tipoVeiculo"],
                }))
              }
            >
              <option value="todos">Todos</option>
              <option value="rotativo">Rotativo</option>
              <option value="mensalista">Mensalista</option>
            </select>
          </div>
        </div>
        <div className="relatorios-filtros-actions">
          <button
            type="button"
            className="dash-btn dash-btn-entrada"
            onClick={carregar}
            disabled={carregando}
          >
            {carregando ? "Carregando..." : "Filtrar"}
          </button>
          <button
            type="button"
            className="dash-btn"
            style={{ background: "#059669" }}
            onClick={handleExportar}
            disabled={carregando || entradas.length === 0}
          >
            Exportar CSV
          </button>
          <button
            type="button"
            className="dash-btn"
            style={{ background: "#dc2626" }}
            onClick={handleImprimir}
            disabled={carregando || entradas.length === 0}
          >
            Imprimir / PDF
          </button>
        </div>
      </div>

      <FeedbackMessage message={erro} type="error" />

      {resumo && (
        <div className="relatorios-resumo">
          <div className="dash-stats" style={{ marginBottom: "1.5rem" }}>
            <div className="dash-stat-card">
              <div className="dash-stat-value total">
                R$ {resumo.totalRecebido.toFixed(2)}
              </div>
              <div className="dash-stat-label">Total recebido</div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-value ocupadas">
                {resumo.quantidadeSaidas}
              </div>
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
            <div className="relatorios-graficos dash-form-card">
              <h2>Por tipo de pagamento</h2>
              <div className="relatorios-graficos-grid">
                <div className="relatorio-grafico-pizza-wrap">
                  <div
                    className="relatorio-grafico-pizza"
                    style={{
                      background: `conic-gradient(${(() => {
                        const porTipoPizza = resumo.porTipoPagamento.filter((p) => p.valor > 0);
                        const totalPizza = resumo.totalRecebido || 1;
                        if (porTipoPizza.length === 0 || totalPizza <= 0) return "transparent 0% 100%";
                        const cores = ["#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6", "#64748b"];
                        let acc = 0;
                        return porTipoPizza
                          .map((p, i) => {
                            const pct = (p.valor / totalPizza) * 100;
                            const start = acc;
                            acc += pct;
                            return `${cores[i % cores.length]} ${start}% ${acc}%`;
                          })
                          .join(", ");
                      })()})`,
                    }}
                    aria-hidden
                  />
                  <span className="relatorio-grafico-pizza-center">
                    R$ {(resumo.totalRecebido ?? 0).toFixed(0)}
                  </span>
                </div>
                <div className="relatorio-grafico-barras">
                  {resumo.porTipoPagamento.map((p) => (
                    <div key={p.tipo} className="grafico-barra-item">
                      <span className="grafico-barra-label">{p.tipo}</span>
                      <div className="grafico-barra-track">
                        <div
                          className="grafico-barra-fill"
                          style={{
                            width: `${(p.valor / maxValor) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="grafico-barra-valor">
                        R$ {p.valor.toFixed(2)} ({p.quantidade})
                      </span>
                    </div>
                  ))}
                </div>
                <div className="relatorio-grafico-stacked">
                  {resumo.porTipoPagamento.map((p, i) => {
                    const pct =
                      resumo.totalRecebido > 0
                        ? (p.valor / resumo.totalRecebido) * 100
                        : 0;
                    const cores = [
                      "#0ea5e9",
                      "#10b981",
                      "#f59e0b",
                      "#8b5cf6",
                      "#64748b",
                    ];
                    return (
                      <div
                        key={p.tipo}
                        className="grafico-stacked-item"
                        style={{
                          backgroundColor: cores[i % cores.length],
                          width: `${pct || 0.5}%`,
                        }}
                        title={`${p.tipo}: ${pct.toFixed(1)}%`}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="grafico-stacked-legenda">
                {resumo.porTipoPagamento.map((p, i) => {
                  const pct =
                    resumo.totalRecebido > 0
                      ? (p.valor / resumo.totalRecebido) * 100
                      : 0;
                  const cores = [
                    "#0ea5e9",
                    "#10b981",
                    "#f59e0b",
                    "#8b5cf6",
                    "#64748b",
                  ];
                  return (
                    <span key={p.tipo} className="grafico-stacked-legenda-item">
                      <span
                        className="grafico-stacked-cor"
                        style={{ backgroundColor: cores[i % cores.length] }}
                      />
                      {p.tipo}: {pct.toFixed(1)}%
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="dash-form-card" style={{ marginTop: "1.5rem" }}>
        <h2>Entradas no período ({entradas.length} registros)</h2>
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
              {paginadas.map((e) => (
                <tr key={e.id}>
                  <td>{e.placa}</td>
                  <td>{e.tipo}</td>
                  <td>{e.vaga_numero ?? "-"}</td>
                  <td>{formatarDataBR(e.entrada_em)}</td>
                  <td>{formatarDataBR(e.saida_em)}</td>
                  <td>{tempoMinutos(e.entrada_em, e.saida_em)} min</td>
                  <td>
                    R$ {(e.valor_pago ?? 0).toFixed(2)}
                  </td>
                  <td>
                    {e.tipo_pagamento
                      ? e.tipo_pagamento.replace("_", " ")
                      : e.tipo === "mensalista"
                        ? "Isento"
                        : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {entradas.length === 0 && !carregando && (
          <div className="dash-empty-state">
            <span className="dash-empty-state-icon" aria-hidden>📊</span>
            <p style={{ margin: 0 }}>Nenhum registro no período</p>
          </div>
        )}
        {totalPaginas > 1 && (
          <div className="relatorios-paginacao">
            <button
              type="button"
              className="dash-btn"
              style={{ padding: "0.4rem 0.8rem" }}
              disabled={pagina <= 1}
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            <span>
              Página {pagina} de {totalPaginas}
            </span>
            <button
              type="button"
              className="dash-btn"
              style={{ padding: "0.4rem 0.8rem" }}
              disabled={pagina >= totalPaginas}
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

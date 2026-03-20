"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  registrarEntrada,
  registrarSaida,
  calcularSaida,
  getVagasDisponiveis,
} from "@/lib/services/entrada-service";
import type { TipoVeiculo } from "@/lib/types";
import type { TipoPagamento, SaidaPreview } from "@/lib/services/entrada-service";
import { Breadcrumb } from "@/components/ui/breadcrumb";

interface Props {
  total: number;
  ocupadas: number;
  disponiveis: number;
  lotado: boolean;
}

interface EntradaAtiva {
  id: string;
  placa: string;
  tipo: string;
  entrada_em: string;
  vaga_numero: number | null;
}

const TIPOS_PAGAMENTO: { value: TipoPagamento; label: string }[] = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao_debito", label: "Cartão Débito" },
  { value: "cartao_credito", label: "Cartão Crédito" },
  { value: "pix", label: "PIX" },
];

export function DashboardClient({ total, ocupadas, disponiveis, lotado }: Props) {
  const [vagas, setVagas] = useState({ total, ocupadas, disponiveis, lotado });
  const [placaEntrada, setPlacaEntrada] = useState("");
  const [tipoEntrada, setTipoEntrada] = useState<TipoVeiculo>("rotativo");
  const [vagaEscolhida, setVagaEscolhida] = useState<number | "auto">("auto");
  const [vagasDisponiveis, setVagasDisponiveis] = useState<number[]>([]);
  const [entradasAtivas, setEntradasAtivas] = useState<EntradaAtiva[]>([]);
  const [placaSaida, setPlacaSaida] = useState("");
  const [saidaPreview, setSaidaPreview] = useState<SaidaPreview | null>(null);
  const [tipoPagamento, setTipoPagamento] = useState<TipoPagamento>("dinheiro");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setVagas({ total, ocupadas, disponiveis, lotado });
  }, [total, ocupadas, disponiveis, lotado]);

  function recarregarVagasDisponiveis() {
    getVagasDisponiveis().then(setVagasDisponiveis);
  }

  useEffect(() => {
    recarregarVagasDisponiveis();
  }, [vagas.disponiveis]);

  function carregarEntradasAtivas() {
    const supabase = createClient();
    supabase
      .from("entradas")
      .select("id, placa, tipo, entrada_em, vaga_numero")
      .is("saida_em", null)
      .order("entrada_em", { ascending: false })
      .then(({ data }) => setEntradasAtivas(data ?? []));
  }

  useEffect(() => {
    carregarEntradasAtivas();
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
          carregarEntradasAtivas();
          recarregarVagasDisponiveis();
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
    const vaga = vagaEscolhida === "auto" ? undefined : vagaEscolhida;
    const r = await registrarEntrada(placaEntrada.trim(), tipoEntrada, vaga);
    if (r.ok) {
      const lado = r.vaga && r.vaga <= 40 ? "esquerdo" : "direito";
      setMsg(r.vaga ? `Entrada registrada! Vaga ${r.vaga} (${lado})` : "Entrada registrada!");
      setPlacaEntrada("");
    } else {
      setMsg(r.error || "Erro");
    }
  }

  async function handleConsultarSaida(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setSaidaPreview(null);
    const r = await calcularSaida(placaSaida.trim());
    if (r.ok) {
      setSaidaPreview(r.preview);
    } else {
      setMsg(r.error || "Erro");
    }
  }

  async function handleConfirmarSaida(e: React.FormEvent) {
    e.preventDefault();
    if (!saidaPreview) return;
    setMsg("");
    const r = await registrarSaida(saidaPreview.placa, saidaPreview.valorPago > 0 ? tipoPagamento : undefined);
    if (r.ok) {
      setMsg("Saída registrada!");
      setPlacaSaida("");
      setSaidaPreview(null);
    } else {
      setMsg(r.error || "Erro");
    }
  }

  function cancelarSaida() {
    setSaidaPreview(null);
    setMsg("");
  }

  return (
    <div className="dash-container">
      <Breadcrumb items={[{ label: "Operações" }]} />
      <h1 className="page-title">Operações</h1>
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
            <div className="dash-field">
              <label>Vaga (apenas disponíveis)</label>
              <select
                className="dash-input"
                value={vagaEscolhida}
                onChange={(e) =>
                  setVagaEscolhida(e.target.value === "auto" ? "auto" : Number(e.target.value))
                }
                onFocus={recarregarVagasDisponiveis}
                disabled={vagas.lotado}
              >
                <option value="auto">Automático (melhor opção)</option>
                {vagasDisponiveis.map((v) => (
                  <option key={v} value={v}>
                    Vaga {v}
                  </option>
                ))}
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
          {!saidaPreview ? (
            <form onSubmit={handleConsultarSaida}>
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
              <button type="submit" className="dash-btn dash-btn-saida">
                Consultar valor
              </button>
            </form>
          ) : (
            <form onSubmit={handleConfirmarSaida}>
              <div className="dash-saida-preview">
                <p><strong>Placa:</strong> {saidaPreview.placa}</p>
                <p><strong>Vaga:</strong> {saidaPreview.vaga ?? "-"}</p>
                <p><strong>Entrada:</strong> {new Date(saidaPreview.entradaEm).toLocaleString("pt-BR")}</p>
                <p><strong>Tempo:</strong> {saidaPreview.tempoMinutos} min</p>
                <p><strong>Valor a cobrar:</strong> R$ {saidaPreview.valorPago.toFixed(2)}</p>
              </div>
              {saidaPreview.valorPago > 0 && (
                <div className="dash-field">
                  <label>Tipo de pagamento</label>
                  <select
                    className="dash-input"
                    value={tipoPagamento}
                    onChange={(e) => setTipoPagamento(e.target.value as TipoPagamento)}
                  >
                    {TIPOS_PAGAMENTO.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              )}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button type="submit" className="dash-btn dash-btn-saida">
                  Confirmar saída
                </button>
                <button type="button" className="dash-btn" style={{ background: "#666" }} onClick={cancelarSaida}>
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="dash-form-card" style={{ marginTop: "1.5rem" }}>
        <h2>Entradas ativas</h2>
        <table className="admin-usuarios-table">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Vaga</th>
              <th>Tipo</th>
              <th>Hora entrada</th>
            </tr>
          </thead>
          <tbody>
            {entradasAtivas.map((e) => (
              <tr key={e.id}>
                <td>{e.placa}</td>
                <td>{e.vaga_numero ?? "-"}</td>
                <td>{e.tipo}</td>
                <td>{new Date(e.entrada_em).toLocaleString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {entradasAtivas.length === 0 && (
          <div className="dash-empty-state">
            <span className="dash-empty-state-icon" aria-hidden>📋</span>
            <p style={{ margin: 0 }}>Nenhuma entrada ativa no momento</p>
          </div>
        )}
      </div>

      {msg && (
        <p className={`dash-msg ${msg.includes("Erro") ? "error" : "success"}`}>{msg}</p>
      )}
    </div>
  );
}

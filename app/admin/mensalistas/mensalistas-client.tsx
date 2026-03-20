"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { validarPlaca, normalizarPlaca } from "@/lib/utils/placa";
import { FeedbackMessage } from "@/components/ui/feedback-message";
import {
  registrarPagamento,
  calcularStatusValidade,
  type FormaPagamentoMensal,
} from "@/lib/services/mensalista-cobranca-service";
import { criarMensalista } from "@/lib/services/mensalista-service";

interface Mensalista {
  id: string;
  nome: string;
  placa: string;
  validade_ate: string;
  ativo: boolean;
  valor_mensalidade?: number | null;
}

const FORMAS_PAGAMENTO: { value: FormaPagamentoMensal; label: string }[] = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao_debito", label: "Cartão Débito" },
  { value: "cartao_credito", label: "Cartão Crédito" },
  { value: "pix", label: "PIX" },
  { value: "boleto", label: "Boleto" },
];

function formatarValidade(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function MensalistasClient({
  initial,
  valorMensalidadePadrao = 200,
}: {
  initial: Mensalista[];
  valorMensalidadePadrao?: number;
}) {
  const [mensalistas, setMensalistas] = useState(initial);
  useEffect(() => {
    setMensalistas(initial);
  }, [initial]);
  const [nome, setNome] = useState("");
  const [placa, setPlaca] = useState("");
  const [validade, setValidade] = useState("");
  const [valorMensal, setValorMensal] = useState<number | "">("");
  const [msg, setMsg] = useState("");
  const [pagamentoAberto, setPagamentoAberto] = useState<string | null>(null);
  const [pagamentoRef, setPagamentoRef] = useState("");
  const [pagamentoValor, setPagamentoValor] = useState("");
  const [pagamentoForma, setPagamentoForma] = useState<FormaPagamentoMensal>("dinheiro");
  const router = useRouter();

  const mesAtual = new Date().toISOString().slice(0, 7);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const placaNorm = normalizarPlaca(placa);
    if (!validarPlaca(placaNorm)) {
      setMsg("Placa inválida. Use formato ABC-1234 ou ABC1D23");
      return;
    }
    try {
      await criarMensalista(
        nome,
        placaNorm,
        validade,
        valorMensal === "" ? null : Number(valorMensal)
      );
      setMsg("Cadastrado!");
      setNome("");
      setPlaca("");
      setValidade("");
      setValorMensal("");
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erro ao cadastrar");
    }
  }

  async function handleInativar(id: string) {
    const supabase = createClient();
    await supabase.from("mensalistas").update({ ativo: false }).eq("id", id);
    router.refresh();
  }

  async function handleRegistrarPagamento(mensalistaId: string) {
    setMsg("");
    const ref = pagamentoRef || mesAtual;
    const valor = parseFloat(pagamentoValor);
    if (isNaN(valor) || valor <= 0) {
      setMsg("Informe um valor válido");
      return;
    }
    const r = await registrarPagamento(mensalistaId, ref, valor, pagamentoForma);
    if (r.ok) {
      setMsg(`Pagamento registrado! Validade estendida até ${formatarValidade(r.novaValidade)}`);
      setPagamentoAberto(null);
      setPagamentoRef(mesAtual);
      setPagamentoValor("");
      router.refresh();
    } else {
      setMsg(r.error);
    }
  }

  function abrirPagamento(m: Mensalista) {
    setPagamentoAberto(m.id);
    setPagamentoRef(mesAtual);
    const valor = m.valor_mensalidade ?? valorMensalidadePadrao;
    setPagamentoValor(valor.toString());
    setPagamentoForma("dinheiro");
    setMsg("");
  }

  return (
    <div>
      <div
        className="dash-form-card"
        style={{ marginBottom: "1.5rem" }}
      >
        <h2 style={{ marginBottom: "1rem", fontSize: "1rem" }}>Novo mensalista</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.85rem" }}>Nome</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="dash-input"
              style={{ padding: "0.5rem", minWidth: "140px" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.85rem" }}>Placa</label>
            <input
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              required
              maxLength={8}
              className="dash-input"
              style={{ padding: "0.5rem", minWidth: "100px" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.85rem" }}>Validade até</label>
            <input
              type="date"
              value={validade}
              onChange={(e) => setValidade(e.target.value)}
              required
              className="dash-input"
              style={{ padding: "0.5rem" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.85rem" }}>
              Valor (R$) <span style={{ color: "#64748b", fontWeight: "normal" }}>opcional</span>
            </label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={valorMensal}
              onChange={(e) => setValorMensal(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
              placeholder={valorMensalidadePadrao.toString()}
              className="dash-input"
              style={{ padding: "0.5rem", width: "90px" }}
            />
          </div>
          <button type="submit" className="dash-btn dash-btn-entrada">
            Cadastrar
          </button>
          <FeedbackMessage message={msg} type={msg === "Cadastrado!" || msg.includes("registrado") ? "success" : "error"} />
        </form>
      </div>

      <div className="dash-form-card">
        <h2 style={{ marginBottom: "1rem", fontSize: "1rem" }}>Lista de mensalistas</h2>
        <div className="relatorios-table-wrap">
          <table className="admin-usuarios-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Placa</th>
                <th>Validade</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {mensalistas.map((m) => {
                const { status, diasAteVencer } = calcularStatusValidade(m.validade_ate);
                const valorExibir = m.valor_mensalidade ?? valorMensalidadePadrao;
                const statusLabel =
                  status === "vencido"
                    ? "Vencido"
                    : status === "vence_em_breve"
                      ? `Vence em ${diasAteVencer} dia(s)`
                      : "Em dia";
                const statusClass =
                  status === "vencido"
                    ? "mensalista-status-vencido"
                    : status === "vence_em_breve"
                      ? "mensalista-status-alerta"
                      : "mensalista-status-ok";

                return (
                  <tr key={m.id}>
                    <td>{m.nome}</td>
                    <td>{m.placa}</td>
                    <td>{formatarValidade(m.validade_ate)}</td>
                    <td>R$ {valorExibir.toFixed(2)}</td>
                    <td>
                      <span className={statusClass}>{statusLabel}</span>
                    </td>
                    <td>
                      {m.ativo && (
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                          <button
                            type="button"
                            className="dash-btn"
                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", background: "#10b981", color: "white" }}
                            onClick={() => abrirPagamento(m)}
                          >
                            Registrar pagamento
                          </button>
                          <button
                            type="button"
                            className="dash-btn"
                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", background: "#fef2f2", color: "#dc2626" }}
                            onClick={() => handleInativar(m.id)}
                          >
                            Inativar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {pagamentoAberto && (
          <div
            className="dash-form-card"
            style={{ marginTop: "1rem", background: "#f8fafc", border: "1px solid #e2e8f0" }}
          >
            <h3 style={{ marginBottom: "0.75rem", fontSize: "0.95rem" }}>Registrar pagamento</h3>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>Mês/ano (referência)</label>
                <input
                  type="month"
                  className="dash-input"
                  value={pagamentoRef}
                  onChange={(e) => setPagamentoRef(e.target.value)}
                  style={{ padding: "0.5rem" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>Valor (R$)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className="dash-input"
                  value={pagamentoValor}
                  onChange={(e) => setPagamentoValor(e.target.value)}
                  style={{ padding: "0.5rem", width: "100px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>Forma de pagamento</label>
                <select
                  className="dash-input"
                  value={pagamentoForma}
                  onChange={(e) => setPagamentoForma(e.target.value as FormaPagamentoMensal)}
                  style={{ padding: "0.5rem" }}
                >
                  {FORMAS_PAGAMENTO.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="dash-btn dash-btn-entrada"
                onClick={() => handleRegistrarPagamento(pagamentoAberto)}
              >
                Confirmar
              </button>
              <button
                type="button"
                className="dash-btn"
                style={{ background: "#64748b" }}
                onClick={() => setPagamentoAberto(null)}
              >
                Cancelar
              </button>
            </div>
            <FeedbackMessage message={msg} type={msg.includes("registrado") ? "success" : "error"} />
          </div>
        )}
        {mensalistas.length === 0 && (
          <div className="dash-empty-state">
            <span className="dash-empty-state-icon" aria-hidden>👥</span>
            <p style={{ margin: 0 }}>Nenhum mensalista cadastrado</p>
          </div>
        )}
      </div>
    </div>
  );
}

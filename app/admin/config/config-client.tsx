"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FeedbackMessage } from "@/components/ui/feedback-message";

interface Props {
  id?: string;
  totalVagas: number;
  valorHora: number;
  fracaoMinima: number;
  valorMensalidade?: number;
}

export function ConfigClient({ id, totalVagas, valorHora, fracaoMinima, valorMensalidade = 200 }: Props) {
  const [total, setTotal] = useState(totalVagas);
  const [valor, setValor] = useState(valorHora);
  const [fracao, setFracao] = useState(fracaoMinima);
  const [valorMensal, setValorMensal] = useState(valorMensalidade);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    setValorMensal(valorMensalidade);
  }, [valorMensalidade]);

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
      .update({ total_vagas: total, valor_hora: valor, fracao_minima_minutos: fracao, valor_mensalidade: valorMensal })
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
        <div className="dash-field">
          <label>Valor mensalidade padrão (R$)</label>
          <input
            type="number"
            min={0}
            step={0.01}
            className="dash-input"
            value={valorMensal}
            onChange={(e) => setValorMensal(parseFloat(e.target.value) || 0)}
          />
        </div>
        <button type="submit" className="dash-btn dash-btn-primary">
          Salvar
        </button>
        <FeedbackMessage message={msg} type={msg === "Salvo!" ? "success" : "error"} />
      </form>
    </div>
  );
}

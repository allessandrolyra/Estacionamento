"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Vaga {
  numero: number;
  lado: "esquerdo" | "direito";
  placa?: string;
  tipo?: string;
  entrada_em?: string;
}

function formatarTempo(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function calcularValor(
  entradaEm: string,
  valorHora: number,
  fracaoMin: number,
  tipo: string
): number {
  if (tipo === "mensalista") return 0;
  const diffMin = Math.ceil(
    (Date.now() - new Date(entradaEm).getTime()) / 60000
  );
  const fracoes = Math.max(1, Math.ceil(diffMin / fracaoMin));
  return (valorHora / (60 / fracaoMin)) * fracoes;
}

interface Props {
  vagas: Vaga[];
  valorHora: number;
  fracaoMin: number;
}

export function MapaVagasClient({ vagas: initial, valorHora, fracaoMin }: Props) {
  const [vagas, setVagas] = useState(initial);

  useEffect(() => {
    setVagas(initial);
  }, [initial]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("mapa-vagas")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "entradas" },
        () => window.location.reload()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const esquerdo = vagas.filter((v) => v.lado === "esquerdo");
  const direito = vagas.filter((v) => v.lado === "direito");

  const VagaCard = ({ v }: { v: Vaga }) => {
    const ocupada = !!v.placa;
    const tempoMin =
      v.entrada_em &&
      Math.ceil((Date.now() - new Date(v.entrada_em).getTime()) / 60000);
    const valor =
      v.entrada_em && v.tipo
        ? calcularValor(v.entrada_em, valorHora, fracaoMin, v.tipo)
        : 0;
    const tooltipText =
      ocupada && v.entrada_em
        ? `Tempo: ${formatarTempo(tempoMin ?? 0)}\nValor: R$ ${valor.toFixed(2)}`
        : undefined;

    return (
      <div
        className={`vaga-card ${ocupada ? "vaga-ocupada" : "vaga-livre"}`}
        title={tooltipText}
      >
        <span className="vaga-numero">Vaga {v.numero}</span>
        {ocupada ? (
          <div className="vaga-ocupada-content">
            <span className="vaga-placa">{v.placa}</span>
            <span className="vaga-tipo">
              {v.tipo === "mensalista" ? "Mensalista" : "Rotativo"}
            </span>
          </div>
        ) : (
          <span className="vaga-vazia">Livre</span>
        )}
        {ocupada && tooltipText && (
          <span className="vaga-tooltip">
            {formatarTempo(tempoMin ?? 0)}
            {v.tipo === "rotativo" ? ` • R$ ${valor.toFixed(2)}` : " • Isento"}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="mapa-container">
      <div className="mapa-header">
        <h1>Mapa de Vagas</h1>
        <p className="mapa-subtitle">
          Verde = disponível, vermelho = ocupada. Passe o mouse na vaga ocupada para ver tempo e valor.
        </p>
      </div>

      <div className="mapa-grid">
        <section className="mapa-lado">
          <h2 className="mapa-lado-titulo">
            <span className="mapa-lado-icon">←</span> Lado Esquerdo
            <span className="mapa-lado-range">1–{esquerdo.length}</span>
          </h2>
          <div className="mapa-vagas-grid">
            {esquerdo.map((v) => (
              <VagaCard key={v.numero} v={v} />
            ))}
          </div>
        </section>

        <section className="mapa-lado">
          <h2 className="mapa-lado-titulo">
            <span className="mapa-lado-icon">→</span> Lado Direito
            <span className="mapa-lado-range">{esquerdo.length + 1}–{vagas.length}</span>
          </h2>
          <div className="mapa-vagas-grid">
            {direito.map((v) => (
              <VagaCard key={v.numero} v={v} />
            ))}
          </div>
        </section>
      </div>

      <div className="mapa-legenda">
        <div className="legenda-item">
          <div className="legenda-box legenda-livre" />
          <span>Disponível</span>
        </div>
        <div className="legenda-item">
          <div className="legenda-box legenda-ocupada" />
          <span>Ocupada</span>
        </div>
      </div>
    </div>
  );
}

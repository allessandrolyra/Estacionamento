"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Vaga {
  numero: number;
  lado: "esquerdo" | "direito";
  placa?: string;
  tipo?: string;
}

export function MapaVagasClient({ vagas: initial }: { vagas: Vaga[] }) {
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
    return () => supabase.removeChannel(channel);
  }, []);

  const esquerdo = vagas.filter((v) => v.lado === "esquerdo");
  const direito = vagas.filter((v) => v.lado === "direito");

  const VagaCard = ({ v }: { v: Vaga }) => {
    const ocupada = !!v.placa;
    return (
      <div className={`vaga-card ${ocupada ? "vaga-ocupada" : "vaga-livre"}`}>
        <span className="vaga-numero">Vaga {v.numero}</span>
        {ocupada ? (
          <div>
            <span className="vaga-placa">{v.placa}</span>
            <span className="vaga-tipo">{v.tipo === "mensalista" ? "Mensalista" : "Rotativo"}</span>
          </div>
        ) : (
          <span className="vaga-vazia">Livre</span>
        )}
      </div>
    );
  };

  return (
    <div className="mapa-container">
      <div className="mapa-header">
        <h1>Mapa de Vagas</h1>
        <p className="mapa-subtitle">
          Visualização em tempo real — verde = disponível, vermelho = ocupada
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

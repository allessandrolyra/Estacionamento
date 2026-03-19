import { createClient } from "@/lib/supabase/server";
import { MapaVagasClient } from "@/app/dashboard/mapa/mapa-client";

export const dynamic = "force-dynamic";

export default async function AdminMapaPage() {
  const supabase = await createClient();
  const { data: config } = await supabase
    .from("config")
    .select("total_vagas, valor_hora, fracao_minima_minutos")
    .single();
  const total = config?.total_vagas ?? 80;

  const { data: entradas } = await supabase
    .from("entradas")
    .select("vaga_numero, placa, tipo, entrada_em")
    .is("saida_em", null)
    .not("vaga_numero", "is", null);

  const mapa = new Map<
    number,
    { placa: string; tipo: string; entrada_em: string }
  >();
  (entradas ?? []).forEach((e) => {
    if (e.vaga_numero)
      mapa.set(e.vaga_numero, {
        placa: e.placa,
        tipo: e.tipo,
        entrada_em: e.entrada_em,
      });
  });

  const vagas: {
    numero: number;
    lado: "esquerdo" | "direito";
    placa?: string;
    tipo?: string;
    entrada_em?: string;
  }[] = [];
  const metade = Math.ceil(total / 2);
  for (let i = 1; i <= total; i++) {
    const info = mapa.get(i);
    vagas.push({
      numero: i,
      lado: i <= metade ? "esquerdo" : "direito",
      placa: info?.placa,
      tipo: info?.tipo,
      entrada_em: info?.entrada_em,
    });
  }

  return (
    <MapaVagasClient
      vagas={vagas}
      valorHora={config?.valor_hora ?? 5}
      fracaoMin={config?.fracao_minima_minutos ?? 15}
    />
  );
}

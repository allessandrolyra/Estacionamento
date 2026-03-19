import { createClient } from "@/lib/supabase/server";
import { MapaVagasClient } from "./mapa-client";

export const dynamic = "force-dynamic";

export default async function MapaVagasPage() {
  const supabase = await createClient();
  const { data: config } = await supabase.from("config").select("total_vagas").single();
  const total = config?.total_vagas ?? 80;

  const { data: entradas } = await supabase
    .from("entradas")
    .select("vaga_numero, placa, tipo")
    .is("saida_em", null)
    .not("vaga_numero", "is", null);

  const mapa = new Map<number, { placa: string; tipo: string }>();
  (entradas ?? []).forEach((e) => {
    if (e.vaga_numero) mapa.set(e.vaga_numero, { placa: e.placa, tipo: e.tipo });
  });

  const vagas: { numero: number; lado: "esquerdo" | "direito"; placa?: string; tipo?: string }[] = [];
  const metade = Math.ceil(total / 2);
  for (let i = 1; i <= total; i++) {
    const info = mapa.get(i);
    vagas.push({
      numero: i,
      lado: i <= metade ? "esquerdo" : "direito",
      placa: info?.placa,
      tipo: info?.tipo,
    });
  }

  return <MapaVagasClient vagas={vagas} />;
}

import { createClient } from "@/lib/supabase/client";
import { getMapaVagas, type VagaMapa } from "./entrada-service";

export async function fetchMapaCompleto(): Promise<{
  vagas: VagaMapa[];
  valorHora: number;
  fracaoMin: number;
}> {
  const supabase = createClient();
  const { data: config } = await supabase
    .from("config")
    .select("valor_hora, fracao_minima_minutos")
    .single();
  const vagas = await getMapaVagas();
  return {
    vagas,
    valorHora: config?.valor_hora ?? 5,
    fracaoMin: config?.fracao_minima_minutos ?? 15,
  };
}

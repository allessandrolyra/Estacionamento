import { createClient } from "@/lib/supabase/client";

export async function getVagas() {
  const supabase = createClient();
  const { data: config } = await supabase
    .from("config")
    .select("total_vagas")
    .single();

  const { count } = await supabase
    .from("entradas")
    .select("*", { count: "exact", head: true })
    .is("saida_em", null);

  const total = config?.total_vagas ?? 80;
  const ocupadas = count ?? 0;
  const disponiveis = Math.max(0, total - ocupadas);

  return { total, ocupadas, disponiveis, lotado: disponiveis === 0 };
}

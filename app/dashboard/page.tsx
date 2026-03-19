import { createClient } from "@/lib/supabase/server";
import { getVagas } from "@/lib/services/vaga-service";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: config } = await supabase.from("config").select("total_vagas").single();
  const { count } = await supabase
    .from("entradas")
    .select("*", { count: "exact", head: true })
    .is("saida_em", null);

  const total = config?.total_vagas ?? 80;
  const ocupadas = count ?? 0;
  const disponiveis = Math.max(0, total - ocupadas);

  return (
    <DashboardClient
      total={total}
      ocupadas={ocupadas}
      disponiveis={disponiveis}
      lotado={disponiveis === 0}
    />
  );
}

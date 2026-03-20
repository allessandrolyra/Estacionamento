import { createClient } from "@/lib/supabase/server";
import { ConfigClient } from "./config-client";
import { RegimesClient } from "./regimes-client";

export const dynamic = "force-dynamic";

export default async function ConfigPage() {
  const supabase = await createClient();
  const { data: config } = await supabase.from("config").select("*").single();
  const { data: regimes } = await supabase
    .from("preco_regimes")
    .select("*")
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  return (
    <div className="dash-container config-page">
      <h1 className="page-title">Configuração</h1>
      <ConfigClient
        id={config?.id}
        totalVagas={config?.total_vagas ?? 80}
        valorHora={config?.valor_hora ?? 5}
        fracaoMinima={config?.fracao_minima_minutos ?? 15}
        valorMensalidade={config?.valor_mensalidade ?? 200}
      />
      <RegimesClient regimes={(regimes ?? []) as { id: string; nome: string; valor_hora: number; fracao_minutos: number }[]} />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { ConfigClient } from "./config-client";

export const dynamic = "force-dynamic";

export default async function ConfigPage() {
  const supabase = await createClient();
  const { data: config } = await supabase.from("config").select("*").single();

  return (
    <div className="dash-container config-page">
      <h1 className="page-title">Configuração</h1>
      <ConfigClient
        id={config?.id}
        totalVagas={config?.total_vagas ?? 80}
        valorHora={config?.valor_hora ?? 5}
        fracaoMinima={config?.fracao_minima_minutos ?? 15}
      />
    </div>
  );
}

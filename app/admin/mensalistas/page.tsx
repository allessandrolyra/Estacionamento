import { createClient } from "@/lib/supabase/server";
import { MensalistasClient } from "./mensalistas-client";

export const dynamic = "force-dynamic";

export default async function MensalistasPage() {
  const supabase = await createClient();
  const { data: mensalistas } = await supabase
    .from("mensalistas")
    .select("*")
    .order("nome");
  const { data: config } = await supabase.from("config").select("valor_mensalidade").single();

  return (
    <div className="dash-container">
      <h1 className="page-title">Mensalistas</h1>
      <MensalistasClient
        initial={mensalistas ?? []}
        valorMensalidadePadrao={config?.valor_mensalidade ?? 200}
      />
    </div>
  );
}

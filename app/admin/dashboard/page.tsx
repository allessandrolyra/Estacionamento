import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: config } = await supabase.from("config").select("total_vagas").single();
  const { count } = await supabase
    .from("entradas")
    .select("*", { count: "exact", head: true })
    .is("saida_em", null);

  const hoje = new Date().toISOString().slice(0, 10);
  const { data: faturamento } = await supabase
    .from("entradas")
    .select("valor_pago")
    .not("saida_em", "is", null)
    .gte("saida_em", `${hoje}T00:00:00`)
    .lt("saida_em", `${hoje}T23:59:59`);

  const totalFaturamento = faturamento?.reduce((s, e) => s + (e.valor_pago ?? 0), 0) ?? 0;

  const { data: entradasAtivas } = await supabase
    .from("entradas")
    .select("id, placa, tipo, entrada_em")
    .is("saida_em", null)
    .order("entrada_em", { ascending: false });

  const total = config?.total_vagas ?? 80;
  const ocupadas = count ?? 0;
  const disponiveis = Math.max(0, total - ocupadas);

  return (
    <div style={{ maxWidth: "900px" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Painel Admin</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ background: "white", padding: "1rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{total}</div>
          <div style={{ fontSize: "0.85rem", color: "#666" }}>Total vagas</div>
        </div>
        <div style={{ background: "white", padding: "1rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#16a34a" }}>{disponiveis}</div>
          <div style={{ fontSize: "0.85rem", color: "#666" }}>Disponíveis</div>
        </div>
        <div style={{ background: "white", padding: "1rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#dc2626" }}>{ocupadas}</div>
          <div style={{ fontSize: "0.85rem", color: "#666" }}>Ocupadas</div>
        </div>
        <div style={{ background: "white", padding: "1rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#2563eb" }}>
            R$ {totalFaturamento.toFixed(2)}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#666" }}>Faturamento hoje</div>
        </div>
      </div>

      <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>Entradas ativas</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>Placa</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>Tipo</th>
              <th style={{ textAlign: "left", padding: "0.5rem" }}>Entrada</th>
            </tr>
          </thead>
          <tbody>
            {entradasAtivas?.map((e) => (
              <tr key={e.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "0.5rem" }}>{e.placa}</td>
                <td style={{ padding: "0.5rem" }}>{e.tipo}</td>
                <td style={{ padding: "0.5rem" }}>
                  {new Date(e.entrada_em).toLocaleString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!entradasAtivas || entradasAtivas.length === 0) && (
          <p style={{ padding: "1rem", color: "#666" }}>Nenhuma entrada ativa</p>
        )}
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  let total = 80;
  let ocupadas = 0;
  let disponiveis = 80;
  let totalFaturamento = 0;
  let valorTotalRecebido = 0;
  let entradasAtivas: { id: string; placa: string; tipo: string; entrada_em: string; vaga_numero: number | null }[] = [];
  let error = "";

  try {
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

    totalFaturamento = faturamento?.reduce((s, e) => s + (e.valor_pago ?? 0), 0) ?? 0;

    const { data: totalRecebido } = await supabase
      .from("entradas")
      .select("valor_pago")
      .not("saida_em", "is", null);
    valorTotalRecebido = totalRecebido?.reduce((s, e) => s + (e.valor_pago ?? 0), 0) ?? 0;

    const { data: entradas } = await supabase
      .from("entradas")
      .select("id, placa, tipo, entrada_em, vaga_numero")
      .is("saida_em", null)
      .order("entrada_em", { ascending: false });

    total = config?.total_vagas ?? 80;
    ocupadas = count ?? 0;
    disponiveis = Math.max(0, total - ocupadas);
    entradasAtivas = entradas ?? [];
  } catch (e) {
    error = e instanceof Error ? e.message : "Erro ao carregar dados. Execute o SQL em supabase/APLICAR-RLS-POLICIES.sql no Supabase.";
  }

  return (
    <div className="dash-container">
      <h1 className="page-title">Painel Admin</h1>

      {error && (
        <div className="dash-msg error" style={{ marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <div className="dash-stats" style={{ marginBottom: "2rem" }}>
        <div className="dash-stat-card">
          <div className="dash-stat-value total">{total}</div>
          <div className="dash-stat-label">Total vagas</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-value disponiveis">{disponiveis}</div>
          <div className="dash-stat-label">Disponíveis</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-value ocupadas">{ocupadas}</div>
          <div className="dash-stat-label">Ocupadas</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-value total">R$ {totalFaturamento.toFixed(2)}</div>
          <div className="dash-stat-label">Faturamento hoje</div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-value total">R$ {valorTotalRecebido.toFixed(2)}</div>
          <div className="dash-stat-label">Valor total recebido</div>
        </div>
      </div>

      <div className="dash-form-card">
        <h2>Entradas ativas</h2>
        <table className="admin-usuarios-table">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Vaga</th>
              <th>Tipo</th>
              <th>Hora entrada</th>
            </tr>
          </thead>
          <tbody>
            {entradasAtivas.map((e) => (
              <tr key={e.id}>
                <td>{e.placa}</td>
                <td>{e.vaga_numero ?? "-"}</td>
                <td>{e.tipo}</td>
                <td>{new Date(e.entrada_em).toLocaleString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {entradasAtivas.length === 0 && (
          <div className="dash-empty-state">
            <span className="dash-empty-state-icon" aria-hidden>📋</span>
            <p style={{ margin: 0 }}>Nenhuma entrada ativa</p>
          </div>
        )}
      </div>
    </div>
  );
}

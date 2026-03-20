import { createClient } from "@/lib/supabase/client";

export type FormaPagamentoMensal =
  | "dinheiro"
  | "cartao_debito"
  | "cartao_credito"
  | "pix"
  | "boleto";

export interface MensalistaComStatus {
  id: string;
  nome: string;
  placa: string;
  validade_ate: string;
  ativo: boolean;
  valor_mensalidade: number | null;
  status: "em_dia" | "vence_em_breve" | "vencido";
  dias_ate_vencer: number;
}

export function calcularStatusValidade(validadeAte: string): {
  status: "em_dia" | "vence_em_breve" | "vencido";
  diasAteVencer: number;
} {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const validade = new Date(validadeAte + "T23:59:59");
  const diffMs = validade.getTime() - hoje.getTime();
  const diasAteVencer = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diasAteVencer < 0) {
    return { status: "vencido", diasAteVencer };
  }
  if (diasAteVencer <= 7) {
    return { status: "vence_em_breve", diasAteVencer };
  }
  return { status: "em_dia", diasAteVencer };
}

export async function obterValorMensalidadePadrao(): Promise<number> {
  const supabase = createClient();
  const { data } = await supabase.from("config").select("valor_mensalidade").single();
  return data?.valor_mensalidade ?? 200;
}

export async function registrarPagamento(
  mensalistaId: string,
  referencia: string,
  valor: number,
  formaPagamento?: FormaPagamentoMensal
): Promise<{ ok: true; novaValidade: string } | { ok: false; error: string }> {
  const supabase = createClient();

  const { data: mensalista } = await supabase
    .from("mensalistas")
    .select("validade_ate")
    .eq("id", mensalistaId)
    .single();

  if (!mensalista) return { ok: false, error: "Mensalista não encontrado" };

  const { error: errInsert } = await supabase.from("pagamentos_mensal").insert({
    mensalista_id: mensalistaId,
    referencia,
    valor,
    forma_pagamento: formaPagamento ?? null,
  });

  if (errInsert) {
    if (errInsert.code === "23505") {
      return { ok: false, error: "Mensalidade deste mês já foi paga" };
    }
    return { ok: false, error: errInsert.message };
  }

  const [ano, mes] = referencia.split("-").map(Number);
  const ultimoDia = new Date(ano, mes, 0).getDate();
  const novaValidade = `${ano}-${String(mes).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;

  const validadeAtual = new Date(mensalista.validade_ate + "T23:59:59");
  const novaValidadeDate = new Date(novaValidade + "T23:59:59");
  const dataFinal = novaValidadeDate > validadeAtual ? novaValidade : mensalista.validade_ate;

  const { error: errUpdate } = await supabase
    .from("mensalistas")
    .update({ validade_ate: dataFinal, updated_at: new Date().toISOString() })
    .eq("id", mensalistaId);

  if (errUpdate) return { ok: false, error: errUpdate.message };

  return { ok: true, novaValidade: dataFinal };
}

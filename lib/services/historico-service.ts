import { createClient } from "@/lib/supabase/client";
import { normalizarPlaca, validarPlaca } from "@/lib/utils/placa";

export interface EntradaHistorico {
  id: string;
  placa: string;
  tipo: string;
  vaga_numero: number | null;
  entrada_em: string;
  saida_em: string | null;
  valor_pago: number | null;
  tipo_pagamento: string | null;
}

export async function buscarHistoricoPorPlaca(
  placa: string
): Promise<{ ok: true; entradas: EntradaHistorico[] } | { ok: false; error: string }> {
  const placaNorm = normalizarPlaca(placa);
  if (!validarPlaca(placaNorm)) {
    return { ok: false, error: "Placa inválida. Use formato ABC-1234 ou ABC1D23" };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("entradas")
    .select("id, placa, tipo, vaga_numero, entrada_em, saida_em, valor_pago, tipo_pagamento")
    .eq("placa", placaNorm)
    .order("entrada_em", { ascending: false });

  if (error) {
    return { ok: false, error: error.message };
  }

  return {
    ok: true,
    entradas: (data ?? []) as EntradaHistorico[],
  };
}

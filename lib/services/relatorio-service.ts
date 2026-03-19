import { createClient } from "@/lib/supabase/client";

export type TipoPagamentoFiltro = "todos" | "dinheiro" | "cartao_debito" | "cartao_credito" | "pix";
export type TipoVeiculoFiltro = "todos" | "rotativo" | "mensalista";

export interface FiltrosRelatorio {
  dataInicial: string;
  dataFinal: string;
  tipoPagamento?: TipoPagamentoFiltro;
  tipoVeiculo?: TipoVeiculoFiltro;
}

export interface EntradaRelatorio {
  id: string;
  placa: string;
  tipo: string;
  vaga_numero: number | null;
  entrada_em: string;
  saida_em: string;
  valor_pago: number | null;
  tipo_pagamento: string | null;
}

export interface ResumoRelatorio {
  totalRecebido: number;
  quantidadeSaidas: number;
  valorMedio: number;
  porTipoPagamento: { tipo: string; valor: number; quantidade: number }[];
}

export async function buscarRelatorio(
  filtros: FiltrosRelatorio
): Promise<{ entradas: EntradaRelatorio[]; resumo: ResumoRelatorio }> {
  const supabase = createClient();

  const dataInicio = `${filtros.dataInicial}T00:00:00`;
  const dataFim = `${filtros.dataFinal}T23:59:59.999`;

  let query = supabase
    .from("entradas")
    .select("id, placa, tipo, vaga_numero, entrada_em, saida_em, valor_pago, tipo_pagamento")
    .not("saida_em", "is", null)
    .gte("saida_em", dataInicio)
    .lte("saida_em", dataFim)
    .order("saida_em", { ascending: false });

  if (filtros.tipoVeiculo && filtros.tipoVeiculo !== "todos") {
    query = query.eq("tipo", filtros.tipoVeiculo);
  }

  if (filtros.tipoPagamento && filtros.tipoPagamento !== "todos") {
    query = query.eq("tipo_pagamento", filtros.tipoPagamento);
  }

  const { data: entradas, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const lista = (entradas ?? []) as EntradaRelatorio[];

  const comValor = lista.filter((e) => (e.valor_pago ?? 0) > 0);
  const totalRecebido = comValor.reduce((s, e) => s + (e.valor_pago ?? 0), 0);
  const quantidadeSaidas = lista.length;
  const valorMedio = quantidadeSaidas > 0 ? totalRecebido / quantidadeSaidas : 0;

  const tiposPagamento = ["dinheiro", "cartao_debito", "cartao_credito", "pix"] as const;
  const labels: Record<string, string> = {
    dinheiro: "Dinheiro",
    cartao_debito: "Cartão Débito",
    cartao_credito: "Cartão Crédito",
    pix: "PIX",
  };

  const porTipoPagamento = tiposPagamento.map((tipo) => {
    const itens = lista.filter((e) => e.tipo_pagamento === tipo);
    const valor = itens.reduce((s, e) => s + (e.valor_pago ?? 0), 0);
    return {
      tipo: labels[tipo] ?? tipo,
      valor,
      quantidade: itens.length,
    };
  });

  const mensalistas = lista.filter((e) => e.tipo === "mensalista");
  if (mensalistas.length > 0) {
    porTipoPagamento.push({
      tipo: "Mensalista (isento)",
      valor: 0,
      quantidade: mensalistas.length,
    });
  }

  return {
    entradas: lista,
    resumo: {
      totalRecebido,
      quantidadeSaidas,
      valorMedio,
      porTipoPagamento: porTipoPagamento.filter((p) => p.quantidade > 0),
    },
  };
}

const LABELS_PAGAMENTO: Record<string, string> = {
  dinheiro: "Dinheiro",
  cartao_debito: "Cartão Débito",
  cartao_credito: "Cartão Crédito",
  pix: "PIX",
};

export function exportarCSV(entradas: EntradaRelatorio[]): string {
  const headers = [
    "Placa",
    "Tipo",
    "Vaga",
    "Entrada",
    "Saída",
    "Tempo (min)",
    "Valor",
    "Tipo Pagamento",
  ];
  const rows = entradas.map((e) => {
    const entradaEm = new Date(e.entrada_em);
    const saidaEm = new Date(e.saida_em);
    const tempoMin = Math.ceil((saidaEm.getTime() - entradaEm.getTime()) / 60000);
    const valor = e.valor_pago != null ? e.valor_pago.toFixed(2) : "0,00";
    const tipoPag = e.tipo_pagamento
      ? (LABELS_PAGAMENTO[e.tipo_pagamento] ?? e.tipo_pagamento)
      : e.tipo === "mensalista"
        ? "Isento"
        : "-";
    return [
      e.placa,
      e.tipo,
      e.vaga_numero ?? "",
      entradaEm.toLocaleString("pt-BR"),
      saidaEm.toLocaleString("pt-BR"),
      tempoMin,
      valor.replace(".", ","),
      tipoPag,
    ].join(";");
  });
  const csv = [headers.join(";"), ...rows].join("\n");
  return "\uFEFF" + csv;
}

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

export interface PagamentoMensalRelatorio {
  id: string;
  mensalista_nome: string;
  placa: string;
  referencia: string;
  valor: number;
  forma_pagamento: string | null;
  pago_em: string;
}

const LABELS_PAGAMENTO_FULL: Record<string, string> = {
  dinheiro: "Dinheiro",
  cartao_debito: "Cartão Débito",
  cartao_credito: "Cartão Crédito",
  pix: "PIX",
  boleto: "Boleto",
};

const LABELS_PAGAMENTO: Record<string, string> = { ...LABELS_PAGAMENTO_FULL };

export async function buscarRelatorio(
  filtros: FiltrosRelatorio
): Promise<{
  entradas: EntradaRelatorio[];
  pagamentosMensal: PagamentoMensalRelatorio[];
  resumo: ResumoRelatorio;
}> {
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

  let pagamentosMensal: PagamentoMensalRelatorio[] = [];
  if (filtros.tipoVeiculo !== "rotativo") {
    try {
      let pagQuery = supabase
        .from("pagamentos_mensal")
        .select("id, referencia, valor, forma_pagamento, pago_em, mensalistas(nome, placa)")
        .gte("pago_em", dataInicio)
        .lte("pago_em", dataFim)
        .order("pago_em", { ascending: false });

      if (filtros.tipoPagamento && filtros.tipoPagamento !== "todos") {
        pagQuery = pagQuery.eq("forma_pagamento", filtros.tipoPagamento);
      }

      const { data: pagamentos } = await pagQuery;
      if (pagamentos) {
        pagamentosMensal = pagamentos.map((p: Record<string, unknown>) => {
          const m = p.mensalistas as { nome: string; placa: string } | null;
          return {
            id: p.id as string,
            mensalista_nome: m?.nome ?? "-",
            placa: m?.placa ?? "-",
            referencia: p.referencia as string,
            valor: p.valor as number,
            forma_pagamento: p.forma_pagamento as string | null,
            pago_em: p.pago_em as string,
          };
        });
      }
    } catch {
      // Tabela pagamentos_mensal pode não existir (migration 010 não aplicada)
    }
  }

  const totalRotativo = lista.filter((e) => (e.valor_pago ?? 0) > 0).reduce((s, e) => s + (e.valor_pago ?? 0), 0);
  const totalMensalistas = pagamentosMensal.reduce((s, p) => s + p.valor, 0);
  const totalRecebido = totalRotativo + totalMensalistas;
  const quantidadeSaidas = lista.length;
  const valorMedio = quantidadeSaidas > 0 ? totalRecebido / quantidadeSaidas : 0;

  const tiposPagamento = ["dinheiro", "cartao_debito", "cartao_credito", "pix", "boleto"] as const;

  const porTipoPagamento = tiposPagamento.map((tipo) => {
    const itensEntrada = lista.filter((e) => e.tipo_pagamento === tipo);
    const itensPagamento = pagamentosMensal.filter((p) => p.forma_pagamento === tipo);
    const valorEntrada = itensEntrada.reduce((s, e) => s + (e.valor_pago ?? 0), 0);
    const valorPagamento = itensPagamento.reduce((s, p) => s + p.valor, 0);
    return {
      tipo: LABELS_PAGAMENTO_FULL[tipo] ?? tipo,
      valor: valorEntrada + valorPagamento,
      quantidade: itensEntrada.length + itensPagamento.length,
    };
  });

  const mensalistasIsentos = lista.filter((e) => e.tipo === "mensalista");
  if (mensalistasIsentos.length > 0) {
    porTipoPagamento.push({
      tipo: "Mensalista (isento na saída)",
      valor: 0,
      quantidade: mensalistasIsentos.length,
    });
  }

  if (pagamentosMensal.length > 0) {
    const valorTotalMensal = pagamentosMensal.reduce((s, p) => s + p.valor, 0);
    porTipoPagamento.push({
      tipo: "Mensalistas (mensalidade)",
      valor: valorTotalMensal,
      quantidade: pagamentosMensal.length,
    });
  }

  return {
    entradas: lista,
    pagamentosMensal,
    resumo: {
      totalRecebido,
      quantidadeSaidas,
      valorMedio,
      porTipoPagamento: porTipoPagamento.filter((p) => p.quantidade > 0 || p.valor > 0),
    },
  };
}

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
  let csv = [headers.join(";"), ...rows].join("\n");

  return "\uFEFF" + csv;
}

export function exportarCSVCompleto(
  entradas: EntradaRelatorio[],
  pagamentosMensal?: PagamentoMensalRelatorio[]
): string {
  let csv = exportarCSV(entradas);
  if (pagamentosMensal && pagamentosMensal.length > 0) {
    const headersPag = ["Nome", "Placa", "Referência", "Valor", "Forma Pagamento", "Data Pagamento"];
    const rowsPag = pagamentosMensal.map((p) => {
      const forma = p.forma_pagamento ? (LABELS_PAGAMENTO[p.forma_pagamento] ?? p.forma_pagamento) : "-";
      return [
        p.mensalista_nome,
        p.placa,
        p.referencia,
        p.valor.toFixed(2).replace(".", ","),
        forma,
        new Date(p.pago_em).toLocaleString("pt-BR"),
      ].join(";");
    });
    csv += "\n\n--- Pagamentos de Mensalistas ---\n" + [headersPag.join(";"), ...rowsPag].join("\n");
  }
  return csv.startsWith("\uFEFF") ? csv : "\uFEFF" + csv;
}

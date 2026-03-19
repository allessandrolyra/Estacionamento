import { createClient } from "@/lib/supabase/client";
import type { TipoVeiculo } from "@/lib/types";

export type TipoPagamento = "dinheiro" | "cartao_debito" | "cartao_credito" | "pix" | "outros";

export async function getVagasDisponiveis(): Promise<number[]> {
  const supabase = createClient();
  const { data: config } = await supabase.from("config").select("total_vagas").single();
  const total = config?.total_vagas ?? 80;

  const { data: ocupadas } = await supabase
    .from("entradas")
    .select("vaga_numero")
    .not("vaga_numero", "is", null)
    .is("saida_em", null);

  const usadas = new Set((ocupadas ?? []).map((e) => e.vaga_numero));
  const disponiveis: number[] = [];
  for (let v = 1; v <= total; v++) {
    if (!usadas.has(v)) disponiveis.push(v);
  }
  return disponiveis;
}

export async function getMapaVagas() {
  const supabase = createClient();
  const { data: config } = await supabase.from("config").select("total_vagas").single();
  const total = config?.total_vagas ?? 80;

  const { data: entradas } = await supabase
    .from("entradas")
    .select("vaga_numero, placa, tipo")
    .is("saida_em", null)
    .not("vaga_numero", "is", null);

  const mapa = new Map<number, { placa: string; tipo: string }>();
  (entradas ?? []).forEach((e) => {
    if (e.vaga_numero) mapa.set(e.vaga_numero, { placa: e.placa, tipo: e.tipo });
  });

  const vagas: { numero: number; lado: "esquerdo" | "direito"; placa?: string; tipo?: string }[] = [];
  const metade = Math.ceil(total / 2);
  for (let i = 1; i <= total; i++) {
    const info = mapa.get(i);
    vagas.push({
      numero: i,
      lado: i <= metade ? "esquerdo" : "direito",
      placa: info?.placa,
      tipo: info?.tipo,
    });
  }
  return vagas;
}

async function buscarProximaVagaLivre(): Promise<number | null> {
  const disponiveis = await getVagasDisponiveis();
  return disponiveis[0] ?? null;
}

export async function registrarEntrada(placa: string, tipo: TipoVeiculo, vagaEscolhida?: number) {
  const supabase = createClient();
  let vaga: number | null;

  if (vagaEscolhida != null) {
    const disponiveis = await getVagasDisponiveis();
    if (!disponiveis.includes(vagaEscolhida)) {
      return { ok: false, error: "Vaga indisponível" };
    }
    vaga = vagaEscolhida;
  } else {
    vaga = await buscarProximaVagaLivre();
  }

  if (vaga === null) return { ok: false, error: "Estacionamento lotado" };

  if (tipo === "mensalista") {
    const { data: mensalista } = await supabase
      .from("mensalistas")
      .select("id")
      .eq("placa", placa.toUpperCase())
      .eq("ativo", true)
      .gte("validade_ate", new Date().toISOString().slice(0, 10))
      .single();

    if (!mensalista) {
      return { ok: false, error: "Mensalista não encontrado ou fora da validade" };
    }

    const { error } = await supabase.from("entradas").insert({
      placa: placa.toUpperCase(),
      tipo: "mensalista",
      mensalista_id: mensalista.id,
      vaga_numero: vaga,
    });
    if (error) {
      if (error.code === "23505") return { ok: false, error: "Placa já possui entrada ativa" };
      return { ok: false, error: error.message };
    }
    return { ok: true, vaga };
  }

  const { error } = await supabase.from("entradas").insert({
    placa: placa.toUpperCase(),
    tipo: "rotativo",
    vaga_numero: vaga,
  });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "Placa já possui entrada ativa" };
    return { ok: false, error: error.message };
  }
  return { ok: true, vaga };
}

export interface SaidaPreview {
  placa: string;
  vaga: number | null;
  tipo: string;
  entradaEm: string;
  tempoMinutos: number;
  valorPago: number;
}

export async function calcularSaida(placa: string): Promise<{ ok: true; preview: SaidaPreview } | { ok: false; error: string }> {
  const supabase = createClient();
  const { data: entrada } = await supabase
    .from("entradas")
    .select("id, tipo, entrada_em, vaga_numero")
    .eq("placa", placa.toUpperCase())
    .is("saida_em", null)
    .single();

  if (!entrada) return { ok: false, error: "Entrada não encontrada" };

  const { data: config } = await supabase.from("config").select("*").single();
  const valorHora = config?.valor_hora ?? 5;
  const fracaoMin = config?.fracao_minima_minutos ?? 15;

  const entradaEm = new Date(entrada.entrada_em);
  const saidaEm = new Date();
  const diffMs = saidaEm.getTime() - entradaEm.getTime();
  const diffMin = Math.ceil(diffMs / 60000);

  let valorPago = 0;
  if (entrada.tipo === "rotativo") {
    const fracoes = Math.max(1, Math.ceil(diffMin / fracaoMin));
    valorPago = (valorHora / (60 / fracaoMin)) * fracoes;
  }

  return {
    ok: true,
    preview: {
      placa: placa.toUpperCase(),
      vaga: entrada.vaga_numero,
      tipo: entrada.tipo,
      entradaEm: entrada.entrada_em,
      tempoMinutos: diffMin,
      valorPago,
    },
  };
}

export async function registrarSaida(placa: string, tipoPagamento?: TipoPagamento) {
  const supabase = createClient();
  const { data: entrada } = await supabase
    .from("entradas")
    .select("id, tipo, entrada_em")
    .eq("placa", placa.toUpperCase())
    .is("saida_em", null)
    .single();

  if (!entrada) return { ok: false, error: "Entrada não encontrada" };

  const { data: config } = await supabase.from("config").select("*").single();
  const valorHora = config?.valor_hora ?? 5;
  const fracaoMin = config?.fracao_minima_minutos ?? 15;

  let valorPago: number | null = null;
  if (entrada.tipo === "rotativo") {
    const saidaEm = new Date();
    const entradaEm = new Date(entrada.entrada_em);
    const diffMs = saidaEm.getTime() - entradaEm.getTime();
    const diffMin = Math.ceil(diffMs / 60000);
    const fracoes = Math.max(1, Math.ceil(diffMin / fracaoMin));
    valorPago = (valorHora / (60 / fracaoMin)) * fracoes;
  }

  const updateData: Record<string, unknown> = {
    saida_em: new Date().toISOString(),
    valor_pago: valorPago,
  };
  if (valorPago != null && tipoPagamento) {
    updateData.tipo_pagamento = tipoPagamento;
  }

  const { error } = await supabase
    .from("entradas")
    .update(updateData)
    .eq("id", entrada.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true, valorPago };
}

export async function getValorTotalRecebido(): Promise<number> {
  const supabase = createClient();
  const { data } = await supabase
    .from("entradas")
    .select("valor_pago")
    .not("saida_em", "is", null);
  return (data ?? []).reduce((s, e) => s + (e.valor_pago ?? 0), 0);
}

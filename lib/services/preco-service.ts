import { createClient } from "@/lib/supabase/client";

export interface PrecoRegime {
  id: string;
  nome: string;
  ordem: number;
  dia_semana: number[] | null;
  hora_inicio: number;
  hora_fim: number;
  valor_hora: number;
  fracao_minutos: number;
}

function diaSemanaJS(d: Date): number {
  return d.getDay();
}

function horaAtual(d: Date): number {
  return d.getHours();
}

function regimeAplica(regime: PrecoRegime, d: Date): boolean {
  const dia = diaSemanaJS(d);
  const h = horaAtual(d);

  if (regime.dia_semana != null && regime.dia_semana.length > 0) {
    if (!regime.dia_semana.includes(dia)) return false;
  }

  const fim = regime.hora_fim === 24 ? 24 : regime.hora_fim;
  if (regime.hora_inicio <= regime.hora_fim) {
    return h >= regime.hora_inicio && h < fim;
  }
  return h >= regime.hora_inicio || h < regime.hora_fim;
}

export async function obterRegimeVigente(saidaEm: Date): Promise<PrecoRegime | null> {
  const supabase = createClient();
  const { data: regimes } = await supabase
    .from("preco_regimes")
    .select("*")
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  if (!regimes || regimes.length === 0) return null;

  const lista = regimes as PrecoRegime[];
  const match = lista.find((r) => regimeAplica(r, saidaEm));
  return match ?? null;
}

export async function obterParametrosPreco(saidaEm: Date): Promise<{
  valorHora: number;
  fracaoMin: number;
}> {
  const regime = await obterRegimeVigente(saidaEm);
  if (regime) {
    return {
      valorHora: regime.valor_hora,
      fracaoMin: regime.fracao_minutos,
    };
  }

  const supabase = createClient();
  const { data: config } = await supabase.from("config").select("valor_hora, fracao_minima_minutos").single();
  return {
    valorHora: config?.valor_hora ?? 5,
    fracaoMin: config?.fracao_minima_minutos ?? 15,
  };
}

export function calcularValorRotativo(
  entradaEm: Date,
  saidaEm: Date,
  valorHora: number,
  fracaoMin: number
): number {
  const diffMin = Math.ceil((saidaEm.getTime() - entradaEm.getTime()) / 60000);
  const fracoes = Math.max(1, Math.ceil(diffMin / fracaoMin));
  return (valorHora / (60 / fracaoMin)) * fracoes;
}

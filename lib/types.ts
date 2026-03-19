export type TipoVeiculo = "rotativo" | "mensalista";

export interface Config {
  id: string;
  total_vagas: number;
  valor_hora: number;
  fracao_minima_minutos: number;
  updated_at: string;
}

export interface Mensalista {
  id: string;
  nome: string;
  placa: string;
  validade_ate: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Entrada {
  id: string;
  placa: string;
  tipo: TipoVeiculo;
  entrada_em: string;
  saida_em: string | null;
  valor_pago: number | null;
  mensalista_id: string | null;
  created_at: string;
}

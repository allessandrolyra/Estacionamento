import { createClient } from "@/lib/supabase/client";

export async function listarMensalistas() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("mensalistas")
    .select("*")
    .order("nome");
  if (error) throw error;
  return data;
}

export async function criarMensalista(nome: string, placa: string, validade_ate: string) {
  const supabase = createClient();
  const { error } = await supabase.from("mensalistas").insert({
    nome,
    placa: placa.toUpperCase(),
    validade_ate,
    ativo: true,
  });
  if (error) throw error;
}

export async function atualizarMensalista(
  id: string,
  data: { nome?: string; placa?: string; validade_ate?: string; ativo?: boolean }
) {
  const supabase = createClient();
  if (data.placa) data.placa = data.placa.toUpperCase();
  const { error } = await supabase.from("mensalistas").update(data).eq("id", id);
  if (error) throw error;
}
